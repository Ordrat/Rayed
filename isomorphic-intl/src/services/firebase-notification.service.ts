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
  return apiRequest<void>(`${BASE_URL}/update-token`, {
    method: 'POST',
    body: JSON.stringify(data),
    token,
  });
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
  console.log('[Notifications] Fetching notifications from API...');

  try {
    const result = await apiRequest<FirebaseNotification[] | { notifications?: FirebaseNotification[]; items?: FirebaseNotification[]; data?: FirebaseNotification[] }>(`${BASE_URL}/user`, {
      method: 'GET',
      token,
    });

    console.log('[Notifications] API response:', result);

    // Handle different response formats
    if (Array.isArray(result)) {
      console.log('[Notifications] Got array with', result.length, 'notifications');
      return result;
    } else if (result && typeof result === 'object') {
      if ('notifications' in result && Array.isArray(result.notifications)) {
        console.log('[Notifications] Got notifications property with', result.notifications.length, 'items');
        return result.notifications;
      }
      if ('items' in result && Array.isArray(result.items)) {
        console.log('[Notifications] Got items property with', result.items.length, 'items');
        return result.items;
      }
      if ('data' in result && Array.isArray(result.data)) {
        console.log('[Notifications] Got data property with', result.data.length, 'items');
        return result.data;
      }
    }

    console.warn('[Notifications] Unexpected response format:', typeof result, result);
    return [];
  } catch (error: any) {
    console.error('[Notifications] Failed to fetch notifications:', error?.message || error);
    console.error('[Notifications] Full error:', error);
    throw error; // Re-throw so the caller can handle it
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(
  data: MarkNotificationReadRequest,
  token: string
): Promise<void> {
  return apiRequest<void>(`${BASE_URL}/mark-read`, {
    method: 'POST',
    body: JSON.stringify(data),
    token,
  });
}

/**
 * Request notification permission and get FCM token
 * This is a client-side only function
 */
export async function requestNotificationPermission(): Promise<string | null> {
  console.log('[FCM] requestNotificationPermission called');

  if (typeof window === 'undefined') {
    console.warn('[FCM] Cannot request notification permission on server');
    return null;
  }

  if (!('Notification' in window)) {
    console.warn('[FCM] Notifications not supported in this browser');
    return null;
  }

  console.log('[FCM] Current notification permission:', Notification.permission);

  try {
    // Request permission
    const permission = await Notification.requestPermission();
    console.log('[FCM] Permission after request:', permission);

    if (permission !== 'granted') {
      console.warn('[FCM] Notification permission denied:', permission);
      return null;
    }

    // Get Firebase Messaging instance
    console.log('[FCM] Getting Firebase Messaging instance...');
    const messaging = await getFirebaseMessaging();
    if (!messaging) {
      console.warn('[FCM] Firebase Messaging not available');
      return null;
    }
    console.log('[FCM] Firebase Messaging instance obtained');

    // Get FCM token
    console.log('[FCM] VAPID_KEY configured:', !!VAPID_KEY);
    if (!VAPID_KEY) {
      console.warn('[FCM] VAPID key not configured - FCM token cannot be obtained');
      console.warn('[FCM] Expected env var: NEXT_PUBLIC_FIREBASE_VAPID_KEY');
      return null;
    }

    console.log('[FCM] Requesting FCM token with VAPID key...');
    const fcmToken = await getToken(messaging, { vapidKey: VAPID_KEY });
    console.log('[FCM] Token obtained successfully, length:', fcmToken?.length);
    return fcmToken;
  } catch (error) {
    console.error('[FCM] Error requesting notification permission:', error);
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
    console.log('[FCM] registerFcmToken called for user:', userId);

    const fcmToken = await requestNotificationPermission();
    if (!fcmToken) {
      console.warn('[FCM] Could not obtain FCM token');
      return false;
    }

    console.log('[FCM] FCM token obtained, length:', fcmToken.length);
    console.log('[FCM] Sending token to backend...');

    // ALWAYS register with backend - the backend should handle deduplication
    // This ensures the token is always registered even if localStorage was cleared
    await updateFcmToken({ userId, fcmToken }, authToken);

    // Store locally for reference (not for caching/skipping)
    localStorage.setItem('fcm_token', fcmToken);
    localStorage.setItem('fcm_user_id', userId);
    localStorage.setItem('fcm_registered_at', new Date().toISOString());

    console.log('[FCM] Token registered with backend successfully');
    return true;
  } catch (error: any) {
    const errorMessage = error?.message || 'Unknown error';

    console.error('[FCM] Error registering token:', errorMessage);
    console.error('[FCM] Full error:', error);

    // Check if this is a backend configuration error
    if (errorMessage.includes('ServiceAccountKeyPath') ||
        errorMessage.includes('not configured')) {
      console.warn('[FCM] Backend Firebase not configured:', errorMessage);
      console.warn('[FCM] The backend needs to configure Firebase:ServiceAccountKeyPath');
      return false;
    }

    // Clear stored token on failures so next attempt will try again
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
  console.log('[FCM] Force re-registering token...');
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
      console.warn('Firebase Messaging not available for foreground listener');
      return null;
    }

    const { onMessage: onFcmMessage } = await import('firebase/messaging');
    
    const unsubscribe = onFcmMessage(messaging, (payload) => {
      console.log('[FCM] Foreground message received:', payload);
      
      const notification = {
        title: payload.notification?.title,
        body: payload.notification?.body,
        data: payload.data,
      };
      
      onMessage(notification);
    });

    console.log('[FCM] Foreground message listener set up');
    return unsubscribe;
  } catch (error) {
    console.error('[FCM] Error setting up foreground listener:', error);
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
 * Generates a pleasant notification tone programmatically
 */
export function playNotificationSound(): void {
  if (typeof window === 'undefined') return;

  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create oscillator for main tone
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Use a pleasant frequency (like a notification chime)
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5
    oscillator.type = 'sine';
    
    // Quick fade in and out for a nice notification sound
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.4);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.4);
    
    // Play a second tone for a more pleasing effect
    setTimeout(() => {
      const oscillator2 = audioContext.createOscillator();
      const gainNode2 = audioContext.createGain();
      
      oscillator2.connect(gainNode2);
      gainNode2.connect(audioContext.destination);
      
      oscillator2.frequency.setValueAtTime(1174.66, audioContext.currentTime); // D6
      oscillator2.type = 'sine';
      
      gainNode2.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode2.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
      gainNode2.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);
      
      oscillator2.start(audioContext.currentTime);
      oscillator2.stop(audioContext.currentTime + 0.3);
    }, 150);
    
  } catch (error) {
    console.warn('[Notification] Error playing sound:', error);
  }
}
