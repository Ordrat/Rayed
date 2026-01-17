/**
 * Firebase Notification Service
 * Handles FCM token management and notifications
 */

import { apiRequest } from '@/lib/api-client';
import {
  FirebaseNotification,
  UpdateFcmTokenRequest,
  ValidateFcmTokenRequest,
  MarkNotificationReadRequest,
} from '@/types/firebase-chat.types';
import { getToken, onMessage, Messaging } from 'firebase/messaging';
import { getFirebaseMessaging } from '@/lib/firebase-config';
import notificationAudio from '@/lib/audio-context';

const BASE_URL = '/api/FirebaseNotification';

// VAPID key for web push - should be set from environment variables
const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

/**
 * Update FCM token for a user
 */
export async function updateFcmToken(
  data: UpdateFcmTokenRequest,
  token: string
): Promise<void> {
  console.log('[FCM] Updating token for user:', data.userId, 'Token length:', data.fcmToken.length);
  try {
    const result = await apiRequest<void>(`${BASE_URL}/update-token`, {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    });
    console.log('[FCM] Token update successful');
    return result;
  } catch (error: any) {
    console.error('[FCM] Token update failed:', error?.message || error);
    throw error;
  }
}

/**
 * Validate FCM token
 */
export async function validateFcmToken(
  data: ValidateFcmTokenRequest,
  token: string
): Promise<void> {
  return apiRequest<void>(`${BASE_URL}/validate-token`, {
    method: 'POST',
    body: JSON.stringify(data),
    token,
  });
}

/**
 * Get user notifications
 */
export async function getUserNotifications(
  token: string
): Promise<FirebaseNotification[]> {
  try {
    const result = await apiRequest<FirebaseNotification[] | { notifications?: FirebaseNotification[]; items?: FirebaseNotification[]; data?: FirebaseNotification[] }>(`${BASE_URL}/user`, {
      method: 'GET',
      token,
    });

    // Handle different response formats
    if (Array.isArray(result)) {
      return result;
    } else if (result && typeof result === 'object') {
      if ('notifications' in result && Array.isArray(result.notifications)) {
        return result.notifications;
      }
      if ('items' in result && Array.isArray(result.items)) {
        return result.items;
      }
      if ('data' in result && Array.isArray(result.data)) {
        return result.data;
      }
    }

    return [];
  } catch (error: any) {
    console.error('[Notifications] Failed to fetch:', error?.message || error);
    throw error;
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(
  data: MarkNotificationReadRequest,
  token: string
): Promise<void> {
  console.log('[Notifications] Marking as read:', data);
  try {
    const result = await apiRequest<void>(`${BASE_URL}/mark-read`, {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    });
    console.log('[Notifications] Mark as read successful');
    return result;
  } catch (error: any) {
    console.error('[Notifications] Mark as read failed:', error?.message || error);
    throw error;
  }
}

/**
 * Request notification permission and get FCM token
 * This is a client-side only function
 */
export async function requestNotificationPermission(): Promise<string | null> {
  if (typeof window === 'undefined') {
    return null;
  }

  if (!('Notification' in window)) {
    console.warn('[FCM] Notifications not supported');
    return null;
  }

  try {
    // Request permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('[FCM] Permission denied:', permission);
      return null;
    }

    // Get Firebase Messaging instance (this also registers the service worker)
    const messaging = await getFirebaseMessaging();
    if (!messaging) {
      console.warn('[FCM] Messaging not available');
      return null;
    }

    // Check VAPID key
    if (!VAPID_KEY) {
      console.error('[FCM] VAPID key not configured (NEXT_PUBLIC_FIREBASE_VAPID_KEY)');
      return null;
    }

    // Wait for service worker to be ready
    if ('serviceWorker' in navigator) {
      try {
        // Wait for service worker with 30 second timeout
        const swReadyPromise = navigator.serviceWorker.ready;
        const timeoutPromise = new Promise<ServiceWorkerRegistration>((_, reject) =>
          setTimeout(() => reject(new Error('Service worker timeout after 30s')), 30000)
        );

        const registration = await Promise.race([swReadyPromise, timeoutPromise]);

        // Get FCM token using the ready service worker
        const fcmToken = await getToken(messaging, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: registration
        });

        if (fcmToken) {
          console.log('[FCM] Token obtained, length:', fcmToken.length);
          return fcmToken;
        } else {
          console.error('[FCM] getToken returned empty - check VAPID key and Firebase config');
          return null;
        }
      } catch (error: any) {
        console.error('[FCM] Token error:', error?.message || error);
        return null;
      }
    }

    return null;
  } catch (error: any) {
    console.error('[FCM] Error:', error?.message || error);
    return null;
  }
}

/**
 * Register the FCM token with the backend
 * ALWAYS sends the token to the backend to ensure it's registered
 */
export async function registerFcmToken(
  userId: string,
  authToken: string,
  forceRefresh: boolean = false
): Promise<boolean> {
  try {
    const fcmToken = await requestNotificationPermission();
    if (!fcmToken) {
      console.warn('[FCM] Could not obtain token');
      return false;
    }

    // Send token to backend
    await updateFcmToken({ userId, fcmToken }, authToken);

    // Store locally for reference
    localStorage.setItem('fcm_token', fcmToken);
    localStorage.setItem('fcm_user_id', userId);
    localStorage.setItem('fcm_registered_at', new Date().toISOString());

    console.log('[FCM] Token registered successfully');
    return true;
  } catch (error: any) {
    const errorMessage = error?.message || 'Unknown error';
    console.error('[FCM] Registration error:', errorMessage);

    // Clear stored token on failures
    localStorage.removeItem('fcm_token');
    localStorage.removeItem('fcm_user_id');
    localStorage.removeItem('fcm_registered_at');
    return false;
  }
}

/**
 * Force re-register FCM token (clears cache and registers again)
 */
export async function forceRegisterFcmToken(
  userId: string,
  authToken: string
): Promise<boolean> {
  localStorage.removeItem('fcm_token');
  localStorage.removeItem('fcm_user_id');
  return registerFcmToken(userId, authToken, true);
}

/**
 * Set up foreground message listener
 */
export async function setupForegroundMessageListener(
  onMessage: (notification: { title?: string; body?: string; data?: Record<string, unknown> }) => void
): Promise<(() => void) | null> {
  try {
    const messaging = await getFirebaseMessaging();
    if (!messaging) {
      return null;
    }

    const { onMessage: onFcmMessage } = await import('firebase/messaging');

    const unsubscribe = onFcmMessage(messaging, (payload) => {
      const notification = {
        title: payload.notification?.title,
        body: payload.notification?.body,
        data: payload.data,
      };

      onMessage(notification);
    });

    return unsubscribe;
  } catch (error) {
    console.error('[FCM] Foreground listener error:', error);
    return null;
  }
}

/**
 * Show a local notification (fallback when FCM is not available)
 */
export function showLocalNotification(
  title: string,
  options?: NotificationOptions
): void {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return;
  }

  if (Notification.permission === 'granted') {
    const notification = new Notification(title, {
      icon: '/logo/R.png',
      badge: '/logo/R.png',
      ...options,
    });

    // Auto-close after 5 seconds
    setTimeout(() => notification.close(), 5000);
  }
}

/**
 * Play notification sound using Web Audio API
 * Uses shared AudioContext to avoid browser security restrictions
 */
export function playNotificationSound(): void {
  notificationAudio.playNotificationSound();
}
