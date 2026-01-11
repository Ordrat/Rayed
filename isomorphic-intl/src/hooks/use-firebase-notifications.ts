'use client';

/**
 * useFirebaseNotifications Hook
 * Manages Firebase notifications for support agents
 */

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import {
  getUserNotifications,
  markNotificationAsRead,
  updateFcmToken,
} from '@/services/firebase-notification.service';
import { FirebaseNotification } from '@/types/firebase-chat.types';

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
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<FirebaseNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const fetchNotifications = useCallback(async () => {
    if (!session?.accessToken) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await getUserNotifications(session.accessToken);
      setNotifications(data || []);
    } catch (err: any) {
      console.error('Failed to fetch notifications:', err);
      setError(err.message || 'Failed to fetch notifications');
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  }, [session?.accessToken]);

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
      console.error('Failed to mark notification as read:', err);
    }
  }, [session?.accessToken, session?.user?.id]);

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
      console.error('Failed to mark all notifications as read:', err);
    }
  }, [session?.accessToken, session?.user?.id, notifications]);

  // Initial fetch
  useEffect(() => {
    if (session?.accessToken) {
      fetchNotifications();
    }
  }, [session?.accessToken, fetchNotifications]);

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    if (!session?.accessToken) return;

    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [session?.accessToken, fetchNotifications]);

  // Request notification permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log('Notification permission granted');
        }
      });
    }
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
