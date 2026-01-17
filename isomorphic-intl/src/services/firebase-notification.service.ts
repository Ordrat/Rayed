/**
 * Firebase Notification Service
 * Handles FCM token management and notifications
 *
 * DEBUG MODE: Enabled - Check console for [FCM Service] logs
 */

import { apiRequest } from "@/lib/api-client";
import {
  FirebaseNotification,
  UpdateFcmTokenRequest,
  ValidateFcmTokenRequest,
  MarkNotificationReadRequest,
} from "@/types/firebase-chat.types";
import { getToken, onMessage, Messaging } from "firebase/messaging";
import { getFirebaseMessaging } from "@/lib/firebase-config";
import notificationAudio from "@/lib/audio-context";

const BASE_URL = "/api/FirebaseNotification";

// VAPID key for web push - should be set from environment variables
const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

// Debug logging helper
const DEBUG_FCM_SERVICE = true;
const logDebug = (...args: unknown[]) => {
  if (DEBUG_FCM_SERVICE) {
    console.log("%c[FCM Service]", "background: #2196F3; color: white; padding: 2px 4px; border-radius: 2px;", ...args);
  }
};

const logError = (...args: unknown[]) => {
  console.error(
    "%c[FCM Service Error]",
    "background: #f44336; color: white; padding: 2px 4px; border-radius: 2px;",
    ...args,
  );
};

const logWarn = (...args: unknown[]) => {
  console.warn(
    "%c[FCM Service Warn]",
    "background: #ff9800; color: white; padding: 2px 4px; border-radius: 2px;",
    ...args,
  );
};

/**
 * Update FCM token for a user
 */
export async function updateFcmToken(data: UpdateFcmTokenRequest, token: string): Promise<void> {
  logDebug("Updating FCM token with backend:", {
    userId: data.userId,
    tokenLength: data.fcmToken?.length,
    tokenPreview: data.fcmToken?.substring(0, 20) + "...",
  });

  try {
    await apiRequest<void>(`${BASE_URL}/update-token`, {
      method: "POST",
      body: JSON.stringify(data),
      token,
    });
    logDebug("✅ FCM token updated successfully on backend");
  } catch (error) {
    logError("Failed to update FCM token on backend:", error);
    throw error;
  }
}

/**
 * Validate FCM token
 */
export async function validateFcmToken(data: ValidateFcmTokenRequest, token: string): Promise<void> {
  return apiRequest<void>(`${BASE_URL}/validate-token`, {
    method: "POST",
    body: JSON.stringify(data),
    token,
  });
}

/**
 * Request notification permission and get FCM token
 * This is a client-side only function
 */
export async function requestNotificationPermission(): Promise<string | null> {
  logDebug("Requesting notification permission...");

  if (typeof window === "undefined") {
    logDebug("Not in browser environment, skipping");
    return null;
  }

  if (!("Notification" in window)) {
    logWarn("Notifications not supported in this browser");
    return null;
  }

  try {
    // Request permission
    logDebug("Current permission status:", Notification.permission);
    const permission = await Notification.requestPermission();
    logDebug("Permission request result:", permission);

    if (permission !== "granted") {
      logWarn("Notification permission denied");
      return null;
    }

    // Get Firebase Messaging instance (this also registers the service worker)
    logDebug("Getting Firebase Messaging instance...");
    const messaging = await getFirebaseMessaging();
    if (!messaging) {
      logError("Firebase Messaging not available");
      return null;
    }
    logDebug("✅ Firebase Messaging instance obtained");

    // Check VAPID key
    if (!VAPID_KEY) {
      logError("VAPID key not configured! Set NEXT_PUBLIC_FIREBASE_VAPID_KEY environment variable");
      return null;
    }
    logDebug("VAPID key configured:", VAPID_KEY.substring(0, 20) + "...");

    // Wait for service worker to be ready
    if ("serviceWorker" in navigator) {
      try {
        logDebug("Waiting for service worker to be ready...");

        // Wait for service worker with 30 second timeout
        const swReadyPromise = navigator.serviceWorker.ready;
        const timeoutPromise = new Promise<ServiceWorkerRegistration>((_, reject) =>
          setTimeout(() => reject(new Error("Service worker timeout after 30s")), 30000),
        );

        const registration = await Promise.race([swReadyPromise, timeoutPromise]);
        logDebug("✅ Service worker ready:", registration.active?.scriptURL);

        // Get FCM token using the ready service worker
        logDebug("Getting FCM token from Firebase...");
        const fcmToken = await getToken(messaging, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: registration,
        });

        if (fcmToken) {
          logDebug("✅ FCM token obtained:", fcmToken.substring(0, 30) + "...");
          return fcmToken;
        } else {
          logWarn("getToken returned empty - check Firebase configuration");
          return null;
        }
      } catch (error: any) {
        logError("Error getting FCM token:", error?.message || error);
        return null;
      }
    }

    logWarn("Service worker not supported");
    return null;
  } catch (error: any) {
    logError("Unexpected error in requestNotificationPermission:", error?.message || error);
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
  forceRefresh: boolean = false,
): Promise<boolean> {
  logDebug("registerFcmToken called:", { userId, forceRefresh });

  try {
    const fcmToken = await requestNotificationPermission();
    if (!fcmToken) {
      logWarn("No FCM token obtained, registration failed");
      return false;
    }

    // Send token to backend
    logDebug("Sending FCM token to backend API...");
    await updateFcmToken({ userId, fcmToken }, authToken);

    // Store locally for reference
    localStorage.setItem("fcm_token", fcmToken);
    localStorage.setItem("fcm_user_id", userId);
    localStorage.setItem("fcm_registered_at", new Date().toISOString());

    logDebug("✅ FCM token stored locally and registered with backend");
    return true;
  } catch (error: any) {
    logError("FCM registration failed:", error?.message || error);
    // Clear stored token on failures
    localStorage.removeItem("fcm_token");
    localStorage.removeItem("fcm_user_id");
    localStorage.removeItem("fcm_registered_at");
    return false;
  }
}

/**
 * Force re-register FCM token (clears cache and registers again)
 */
export async function forceRegisterFcmToken(userId: string, authToken: string): Promise<boolean> {
  logDebug("Force re-registering FCM token...");
  localStorage.removeItem("fcm_token");
  localStorage.removeItem("fcm_user_id");
  return registerFcmToken(userId, authToken, true);
}

/**
 * Set up foreground message listener
 */
export async function setupForegroundMessageListener(
  onMessageCallback: (notification: { title?: string; body?: string; data?: Record<string, unknown> }) => void,
): Promise<(() => void) | null> {
  logDebug("Setting up foreground message listener...");

  try {
    const messaging = await getFirebaseMessaging();
    if (!messaging) {
      logError("Firebase Messaging not available for foreground listener");
      return null;
    }

    const { onMessage: onFcmMessage } = await import("firebase/messaging");

    const unsubscribe = onFcmMessage(messaging, (payload) => {
      logDebug("📬 FOREGROUND FCM MESSAGE RECEIVED:", {
        notification: payload.notification,
        data: payload.data,
        from: payload.from,
        messageId: payload.messageId,
      });

      const notification = {
        title: payload.notification?.title,
        body: payload.notification?.body,
        data: payload.data,
      };

      onMessageCallback(notification);
    });

    logDebug("✅ Foreground message listener registered successfully");
    return unsubscribe;
  } catch (error) {
    logError("Foreground listener setup error:", error);
    return null;
  }
}

/**
 * Show a local notification (fallback when FCM is not available)
 */
export function showLocalNotification(title: string, options?: NotificationOptions): void {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return;
  }

  if (Notification.permission === "granted") {
    const notification = new Notification(title, {
      icon: "/logo/R.png",
      badge: "/logo/R.png",
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
