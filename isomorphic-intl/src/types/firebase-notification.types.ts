/**
 * Firebase Notification Types
 */

/**
 * Notification from API
 */
export interface FirebaseNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
}

/**
 * Notification type enum
 */
export enum NotificationType {
  NewTicket = 'new_ticket',
  NewMessage = 'new_message',
  TicketAssigned = 'ticket_assigned',
  TicketClosed = 'ticket_closed',
  TicketResolved = 'ticket_resolved',
  System = 'system',
}

/**
 * Request to mark notification as read
 */
export interface MarkNotificationReadRequest {
  userid: string;
  notificationId: string;
}

/**
 * Request to update FCM token
 */
export interface UpdateFCMTokenRequest {
  userId: string;
  fcmToken: string;
}

/**
 * Request to validate FCM token
 */
export interface ValidateFCMTokenRequest {
  fcmToken: string;
}

/**
 * Notification type labels for UI
 */
export const NotificationTypeLabels: Record<NotificationType, { en: string; ar: string }> = {
  [NotificationType.NewTicket]: { en: 'New Ticket', ar: 'تذكرة جديدة' },
  [NotificationType.NewMessage]: { en: 'New Message', ar: 'رسالة جديدة' },
  [NotificationType.TicketAssigned]: { en: 'Ticket Assigned', ar: 'تم تعيين التذكرة' },
  [NotificationType.TicketClosed]: { en: 'Ticket Closed', ar: 'تم إغلاق التذكرة' },
  [NotificationType.TicketResolved]: { en: 'Ticket Resolved', ar: 'تم حل التذكرة' },
  [NotificationType.System]: { en: 'System', ar: 'النظام' },
};
