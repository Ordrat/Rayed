'use client';

/**
 * useFirebaseNotifications Hook
 * Manages Firebase notifications for support agents and admins
 * Features:
 * - FCM token registration
 * - Real-time notification listening via Firebase
 * - Polling fallback
 * - Sound notifications
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { ref, onValue, onChildAdded, get, Database } from 'firebase/database';
import {
  getUserNotifications,
  markNotificationAsRead,
  registerFcmToken,
  setupForegroundMessageListener,
  showLocalNotification,
  playNotificationSound,
} from '@/services/firebase-notification.service';
import { FirebaseNotification } from '@/types/firebase-chat.types';
import { getFirebaseDatabase } from '@/lib/firebase-config';

interface UseFirebaseNotificationsReturn {
  notifications: FirebaseNotification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export function useFirebaseNotifications(): UseFirebaseNotificationsReturn {
  const { data: session, status } = useSession();
  const [notifications, setNotifications] = useState<FirebaseNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fcmInitializedRef = useRef(false);
  const unsubscribersRef = useRef<(() => void)[]>([]);
  const processedNotificationIds = useRef<Set<string>>(new Set());

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    if (!session?.accessToken) return;

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
      sortedData.forEach(n => processedNotificationIds.current.add(n.id));
      
      setNotifications(sortedData);
      console.log('[Notifications] Fetched', sortedData.length, 'notifications');
    } catch (err: any) {
      console.error('[Notifications] Failed to fetch:', err);
      setError(err.message || 'Failed to fetch notifications');
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  }, [session?.accessToken]);

  // Mark single notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!session?.accessToken || !session?.user?.id) return;

    try {
      await markNotificationAsRead(
        { userid: session.user.id, notificationId },
        session.accessToken
      );
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
    } catch (err: any) {
      console.error('[Notifications] Failed to mark as read:', err);
    }
  }, [session?.accessToken, session?.user?.id]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!session?.accessToken || !session?.user?.id) return;

    try {
      const unreadNotifications = notifications.filter(n => !n.isRead);
      await Promise.all(
        unreadNotifications.map(n =>
          markNotificationAsRead(
            { userid: session.user!.id, notificationId: n.id },
            session.accessToken!
          )
        )
      );
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err: any) {
      console.error('[Notifications] Failed to mark all as read:', err);
    }
  }, [session?.accessToken, session?.user?.id, notifications]);

  // Handle new notification arrival
  const handleNewNotification = useCallback((notification: {
    title?: string;
    body?: string;
    data?: Record<string, unknown>;
  }) => {
    console.log('[Notifications] New notification received:', notification);
    
    // Play notification sound
    playNotificationSound();
    
    // Show browser notification if in background or unfocused
    if (document.hidden || !document.hasFocus()) {
      showLocalNotification(notification.title || 'New Notification', {
        body: notification.body,
        data: notification.data,
        tag: 'support-notification',
      });
    }
    
    // Refresh notifications list
    fetchNotifications();
  }, [fetchNotifications]);

  // Set up real-time Firebase listener for notifications
  const setupFirebaseListener = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      const db = getFirebaseDatabase();
      const userNotificationsPath = `notifications/${session.user.id}`;
      const notificationsRef = ref(db, userNotificationsPath);

      console.log('[Notifications] Setting up Firebase listener at:', userNotificationsPath);

      // Listen for new notifications added
      const unsubscribe = onChildAdded(notificationsRef, (snapshot) => {
        const notificationId = snapshot.key;
        if (!notificationId || processedNotificationIds.current.has(notificationId)) {
          return;
        }

        processedNotificationIds.current.add(notificationId);
        const notificationData = snapshot.val();
        
        console.log('[Notifications] New notification from Firebase:', notificationData);
        
        // Create notification object
        const newNotification: FirebaseNotification = {
          id: notificationId,
          userId: session.user!.id,
          title: notificationData.title || 'New Notification',
          body: notificationData.body || '',
          data: notificationData.data,
          isRead: false,
          createdAt: notificationData.createdAt || new Date().toISOString(),
        };

        // Add to state
        setNotifications(prev => [newNotification, ...prev]);
        
        // Handle notification effects
        handleNewNotification({
          title: newNotification.title,
          body: newNotification.body,
          data: newNotification.data,
        });
      });

      unsubscribersRef.current.push(unsubscribe);
      console.log('[Notifications] Firebase listener set up successfully');
    } catch (err) {
      console.error('[Notifications] Error setting up Firebase listener:', err);
    }
  }, [session?.user?.id, handleNewNotification]);

  // Initialize FCM token registration
  useEffect(() => {
    console.log('[Notifications] Auth status:', status, 'User ID:', session?.user?.id ? 'present' : 'missing', 'Token:', session?.accessToken ? 'present' : 'missing');

    if (status !== 'authenticated' || !session?.user?.id || !session?.accessToken) {
      console.log('[Notifications] Waiting for authentication...');
      return;
    }

    if (fcmInitializedRef.current) {
      console.log('[Notifications] FCM already initialized');
      return;
    }

    fcmInitializedRef.current = true;

    const initializeFcm = async () => {
      console.log('[Notifications] Initializing FCM for user:', session.user?.id);
      
      // Register FCM token with backend
      const registered = await registerFcmToken(session.user!.id, session.accessToken!);
      if (registered) {
        console.log('[Notifications] FCM token registered successfully');
      }

      // Set up foreground message listener
      const unsubscribe = await setupForegroundMessageListener(handleNewNotification);
      if (unsubscribe) {
        unsubscribersRef.current.push(unsubscribe);
      }

      // Set up Firebase Realtime Database listener as a fallback
      setupFirebaseListener();
    };

    initializeFcm();

    return () => {
      fcmInitializedRef.current = false;
    };
  }, [status, session?.user?.id, session?.accessToken, handleNewNotification, setupFirebaseListener]);

  // Initial fetch when session is available
  useEffect(() => {
    if (session?.accessToken) {
      fetchNotifications();
    }
  }, [session?.accessToken, fetchNotifications]);

  // Poll for new notifications every 30 seconds as a fallback
  useEffect(() => {
    if (!session?.accessToken) return;

    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [session?.accessToken, fetchNotifications]);

  // Request notification permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          console.log('[Notifications] Permission:', permission);
        });
      }
    }
  }, []);

  // Cleanup subscriptions
  useEffect(() => {
    return () => {
      unsubscribersRef.current.forEach(unsub => {
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
    refresh: fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
}

export default useFirebaseNotifications;
