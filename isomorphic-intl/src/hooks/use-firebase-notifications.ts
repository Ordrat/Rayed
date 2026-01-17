"use client";

/**
 * useFirebaseNotifications Hook
 * Manages Firebase Cloud Messaging (FCM) notifications for support agents
 * Features:
 * - FCM token registration
 * - Real-time notification listening via FCM (foreground & background)
 * - Direct FCM message handling (notifications NOT stored in database)
 * - Sound notifications
 * - Notifications for ticket assignments only (not chat messages)
 *
 * DEBUG MODE: Enabled - Check console for [FCM Debug] logs
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import {
  registerFcmToken,
  forceRegisterFcmToken,
  setupForegroundMessageListener,
  showLocalNotification,
  playNotificationSound,
} from "@/services/firebase-notification.service";
import { FirebaseNotification } from "@/types/firebase-chat.types";

// Debug logging helper
const DEBUG_FCM = true;
const logDebug = (...args: unknown[]) => {
  if (DEBUG_FCM) {
    console.log("%c[FCM Debug]", "background: #4CAF50; color: white; padding: 2px 4px; border-radius: 2px;", ...args);
  }
};

const logError = (...args: unknown[]) => {
  console.error("%c[FCM Error]", "background: #f44336; color: white; padding: 2px 4px; border-radius: 2px;", ...args);
};

const logWarn = (...args: unknown[]) => {
  console.warn("%c[FCM Warn]", "background: #ff9800; color: white; padding: 2px 4px; border-radius: 2px;", ...args);
};

interface UseFirebaseNotificationsReturn {
  notifications: FirebaseNotification[];
  unreadCount: number;
  fcmRegistered: boolean;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  reRegisterFcm: () => Promise<boolean>;
}

export function useFirebaseNotifications(): UseFirebaseNotificationsReturn {
  const { data: session, status } = useSession();
  const [notifications, setNotifications] = useState<FirebaseNotification[]>([]);
  const [fcmRegistered, setFcmRegistered] = useState(false);

  const fcmInitializedRef = useRef(false);
  const unsubscribersRef = useRef<(() => void)[]>([]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Log session status changes
  useEffect(() => {
    logDebug("Session status changed:", {
      status,
      userId: session?.user?.id,
      hasToken: !!session?.accessToken,
    });
  }, [status, session?.user?.id, session?.accessToken]);

  // Log notification state changes
  useEffect(() => {
    logDebug("Notifications state updated:", {
      count: notifications.length,
      unreadCount,
      notifications: notifications.map((n) => ({
        id: n.id,
        title: n.title,
        isRead: n.isRead,
        createdAt: n.createdAt,
      })),
    });
  }, [notifications, unreadCount]);

  // Function to force re-register FCM token
  const reRegisterFcm = useCallback(async (): Promise<boolean> => {
    logDebug("Force re-registering FCM token...");

    if (!session?.user?.id || !session?.accessToken) {
      logWarn("Cannot re-register: No session data");
      return false;
    }

    try {
      const result = await forceRegisterFcmToken(session.user.id, session.accessToken);
      logDebug("FCM re-registration result:", result);
      setFcmRegistered(result);
      return result;
    } catch (err) {
      logError("FCM re-registration failed:", err);
      setFcmRegistered(false);
      return false;
    }
  }, [session?.user?.id, session?.accessToken]);

  // Mark single notification as read (local state only)
  const markAsRead = useCallback((notificationId: string) => {
    logDebug("Marking notification as read:", notificationId);
    setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)));
  }, []);

  // Mark all notifications as read (local state only)
  const markAllAsRead = useCallback(() => {
    logDebug("Marking all notifications as read");
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, []);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    logDebug("Clearing all notifications");
    setNotifications([]);
  }, []);

  // Handle new notification arrival from FCM
  const handleNewNotification = useCallback(
    (notification: { title?: string; body?: string; data?: Record<string, unknown> }) => {
      logDebug("📬 NEW NOTIFICATION RECEIVED:", {
        title: notification.title,
        body: notification.body,
        data: notification.data,
        timestamp: new Date().toISOString(),
      });

      // Create a notification object from FCM payload
      const newNotification: FirebaseNotification = {
        id: `fcm_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        userId: session?.user?.id || "",
        title: notification.title || "New Notification",
        body: notification.body || "",
        data: notification.data,
        isRead: false,
        createdAt: new Date().toISOString(),
      };

      logDebug("Created notification object:", newNotification);

      // Add notification to state (at the beginning of the list)
      setNotifications((prev) => {
        // Check if similar notification already exists (avoid duplicates)
        const isDuplicate = prev.some(
          (n) =>
            n.title === newNotification.title &&
            n.body === newNotification.body &&
            Math.abs(new Date(n.createdAt).getTime() - new Date(newNotification.createdAt).getTime()) < 5000,
        );

        if (isDuplicate) {
          logWarn("Duplicate notification detected, skipping:", newNotification.title);
          return prev;
        }

        logDebug("Adding notification to state, new count:", prev.length + 1);
        return [newNotification, ...prev];
      });

      // Play notification sound
      logDebug("Playing notification sound...");
      playNotificationSound();

      // Show browser notification if in background or unfocused
      if (document.hidden || !document.hasFocus()) {
        logDebug("Page not focused, showing browser notification");
        showLocalNotification(notification.title || "New Notification", {
          body: notification.body,
          data: notification.data,
          tag: "support-notification",
        });
      } else {
        logDebug("Page is focused, skipping browser notification");
      }
    },
    [session?.user?.id],
  );

  // Initialize FCM token registration
  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id || !session?.accessToken) {
      logDebug("Skipping FCM init - not authenticated:", { status, hasUserId: !!session?.user?.id });
      return;
    }

    // Reset if user changes
    const currentUserId = session.user.id;
    const storedUserId = typeof window !== "undefined" ? localStorage.getItem("fcm_user_id") : null;
    const userChanged = storedUserId && storedUserId !== currentUserId;

    if (fcmInitializedRef.current && !userChanged) {
      logDebug("FCM already initialized, skipping");
      return;
    }

    logDebug("🚀 Initializing FCM...", { currentUserId, userChanged });
    fcmInitializedRef.current = true;

    const initializeFcm = async () => {
      // Register FCM token with backend
      try {
        logDebug("Registering FCM token with backend...");
        const registered = await registerFcmToken(currentUserId, session.accessToken!);
        logDebug("FCM token registration result:", registered);
        setFcmRegistered(registered);

        if (registered) {
          logDebug("✅ FCM token registered successfully! Ready to receive notifications.");
        } else {
          logWarn("⚠️ FCM token registration returned false - check notification permissions");
        }
      } catch (err) {
        logError("FCM token registration failed:", err);
        setFcmRegistered(false);
      }

      // Set up foreground message listener for FCM
      try {
        logDebug("Setting up foreground message listener...");
        const unsubscribe = await setupForegroundMessageListener(handleNewNotification);
        if (unsubscribe) {
          logDebug("✅ Foreground message listener set up successfully!");
          unsubscribersRef.current.push(unsubscribe);
        } else {
          logWarn("⚠️ Foreground listener returned null - FCM may not work");
        }
      } catch (err) {
        logError("Failed to set up foreground listener:", err);
      }
    };

    initializeFcm();

    return () => {
      logDebug("FCM cleanup triggered");
      fcmInitializedRef.current = false;
    };
  }, [status, session?.user?.id, session?.accessToken, handleNewNotification]);

  // Listen for messages from service worker (background notifications)
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      logDebug("Service worker not available on this platform");
      return;
    }

    logDebug("Setting up service worker message listener...");

    const handleServiceWorkerMessage = (event: MessageEvent) => {
      logDebug("📨 Message from service worker:", event.data);

      if (event.data?.type === "FCM_NOTIFICATION_RECEIVED") {
        logDebug("🔔 Background notification received via service worker:", event.data.notification);
        handleNewNotification(event.data.notification);
      }
    };

    navigator.serviceWorker.addEventListener("message", handleServiceWorkerMessage);
    logDebug("✅ Service worker message listener registered");

    return () => {
      navigator.serviceWorker.removeEventListener("message", handleServiceWorkerMessage);
      logDebug("Service worker message listener removed");
    };
  }, [handleNewNotification]);

  // Request notification permission on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      logDebug("Notification permission status:", Notification.permission);

      if (Notification.permission === "default") {
        logDebug("Requesting notification permission...");
        Notification.requestPermission().then((permission) => {
          logDebug("Notification permission result:", permission);
        });
      }
    }
  }, []);

  // Cleanup subscriptions
  useEffect(() => {
    return () => {
      unsubscribersRef.current.forEach((unsub) => {
        try {
          unsub();
        } catch (e) {
          // Ignore cleanup errors
        }
      });
      unsubscribersRef.current = [];
    };
  }, []);

  return {
    notifications,
    unreadCount,
    fcmRegistered,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    reRegisterFcm,
  };
}

export default useFirebaseNotifications;
