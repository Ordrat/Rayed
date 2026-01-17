"use client";

/**
 * useFirebaseNotifications Hook
 * Manages Firebase Cloud Messaging (FCM) notifications for support agents
 * Features:
 * - FCM token registration
 * - Real-time notification listening via FCM (foreground & background)
 * - Direct FCM message handling without database storage
 * - Sound notifications
 * - Notifications for ticket assignments only (not chat messages)
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import {
  getUserNotifications,
  markNotificationAsRead,
  registerFcmToken,
  forceRegisterFcmToken,
  setupForegroundMessageListener,
  showLocalNotification,
  playNotificationSound,
} from "@/services/firebase-notification.service";
import { FirebaseNotification } from "@/types/firebase-chat.types";

interface UseFirebaseNotificationsReturn {
  notifications: FirebaseNotification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  fcmRegistered: boolean;
  refresh: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  reRegisterFcm: () => Promise<boolean>;
}

export function useFirebaseNotifications(): UseFirebaseNotificationsReturn {
  const { data: session, status } = useSession();
  const [notifications, setNotifications] = useState<FirebaseNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fcmRegistered, setFcmRegistered] = useState(false);

  const fcmInitializedRef = useRef(false);
  const unsubscribersRef = useRef<(() => void)[]>([]);
  const processedNotificationIds = useRef<Set<string>>(new Set());

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Function to force re-register FCM token
  const reRegisterFcm = useCallback(async (): Promise<boolean> => {
    if (!session?.user?.id || !session?.accessToken) {
      return false;
    }

    try {
      const result = await forceRegisterFcmToken(session.user.id, session.accessToken);
      setFcmRegistered(result);
      return result;
    } catch (err) {
      console.error("[Notifications] FCM re-registration error:", err);
      setFcmRegistered(false);
      return false;
    }
  }, [session?.user?.id, session?.accessToken]);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    if (!session?.accessToken) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const data = await getUserNotifications(session.accessToken);

      // Sort by createdAt descending (newest first)
      const sortedData = [...(data || [])].sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });

      // Track processed notification IDs
      sortedData.forEach((n) => processedNotificationIds.current.add(n.id));

      setNotifications(sortedData);
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to fetch notifications";

      // Check if this is a backend configuration error (not user-facing)
      if (errorMessage.includes("ServiceAccountKeyPath") || errorMessage.includes("not configured")) {
        setNotifications([]);
      } else if (errorMessage.includes("401") || errorMessage.includes("Unauthorized")) {
        setError(null);
        setNotifications([]);
      } else {
        setError(errorMessage);
        setNotifications([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [session?.accessToken]);

  // Mark single notification as read
  const markAsRead = useCallback(
    async (notificationId: string) => {
      if (!session?.accessToken || !session?.user?.id) return;

      try {
        await markNotificationAsRead({ userid: session.user.id, notificationId }, session.accessToken);
        setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)));
      } catch (err: any) {
        // Silent failure
      }
    },
    [session?.accessToken, session?.user?.id],
  );

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!session?.accessToken || !session?.user?.id) return;

    try {
      const unreadNotifications = notifications.filter((n) => !n.isRead);
      await Promise.all(
        unreadNotifications.map((n) =>
          markNotificationAsRead({ userid: session.user!.id, notificationId: n.id }, session.accessToken!),
        ),
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      // Silent failure for mark all as read
    }
  }, [session?.accessToken, session?.user?.id, notifications]);

  // Handle new notification arrival from FCM
  const handleNewNotification = useCallback(
    (notification: { title?: string; body?: string; data?: Record<string, unknown> }) => {
      console.log('[Notifications] Received FCM notification:', notification);

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

      // Add notification to state (at the beginning of the list)
      setNotifications((prev) => {
        // Check if similar notification already exists (avoid duplicates)
        const isDuplicate = prev.some(
          (n) => n.title === newNotification.title &&
                 n.body === newNotification.body &&
                 Math.abs(new Date(n.createdAt).getTime() - new Date(newNotification.createdAt).getTime()) < 5000
        );

        if (isDuplicate) {
          console.log('[Notifications] Duplicate notification detected, skipping');
          return prev;
        }

        console.log('[Notifications] Adding new notification to state');
        return [newNotification, ...prev];
      });

      // Play notification sound
      playNotificationSound();

      // Show browser notification if in background or unfocused
      if (document.hidden || !document.hasFocus()) {
        showLocalNotification(notification.title || "New Notification", {
          body: notification.body,
          data: notification.data,
          tag: "support-notification",
        });
      }
    },
    [session?.user?.id],
  );


  // Initialize FCM token registration
  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id || !session?.accessToken) {
      return;
    }

    // Reset if user changes
    const currentUserId = session.user.id;
    const storedUserId = typeof window !== "undefined" ? localStorage.getItem("fcm_user_id") : null;
    const userChanged = storedUserId && storedUserId !== currentUserId;

    if (fcmInitializedRef.current && !userChanged) {
      return;
    }

    fcmInitializedRef.current = true;

    const initializeFcm = async () => {
      // Register FCM token with backend
      try {
        const registered = await registerFcmToken(currentUserId, session.accessToken!);
        setFcmRegistered(registered);
        console.log('[Notifications] FCM token registered:', registered);
      } catch (err) {
        console.error("[Notifications] FCM registration error:", err);
        setFcmRegistered(false);
      }

      // Set up foreground message listener for FCM
      try {
        const unsubscribe = await setupForegroundMessageListener(handleNewNotification);
        if (unsubscribe) {
          unsubscribersRef.current.push(unsubscribe);
          console.log('[Notifications] FCM foreground listener set up successfully');
        }
      } catch (err) {
        console.error('[Notifications] Failed to set up foreground listener:', err);
      }
    };

    initializeFcm();

    return () => {
      fcmInitializedRef.current = false;
    };
  }, [status, session?.user?.id, session?.accessToken, handleNewNotification]);

  // Initial fetch when session is available (for any persisted notifications from backend)
  useEffect(() => {
    if (session?.accessToken) {
      fetchNotifications();
    }
  }, [session?.accessToken, fetchNotifications]);

  // Listen for messages from service worker (background notifications)
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    const handleServiceWorkerMessage = (event: MessageEvent) => {
      console.log('[Notifications] Received message from service worker:', event.data);

      if (event.data?.type === 'FCM_NOTIFICATION_RECEIVED') {
        // Handle notification received in background
        handleNewNotification(event.data.notification);
      } else if (event.data?.type === 'NOTIFICATION_CLICKED') {
        // Notification was clicked, could trigger specific actions here
        console.log('[Notifications] Notification clicked:', event.data.data);
      }
    };

    navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);

    return () => {
      navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
    };
  }, [handleNewNotification]);

  // Request notification permission on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
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
    isLoading,
    error,
    fcmRegistered,
    refresh: fetchNotifications,
    markAsRead,
    markAllAsRead,
    reRegisterFcm,
  };
}

export default useFirebaseNotifications;
