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

const BASE_URL = '/api/FirebaseNotification';

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
  return apiRequest<FirebaseNotification[]>(`${BASE_URL}/user`, {
    method: 'GET',
    token,
  });
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
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.warn('Notifications not supported');
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission denied');
      return null;
    }

    // FCM token will be obtained through Firebase messaging
    // This is a placeholder - actual implementation depends on Firebase setup
    return null;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return null;
  }
}
