/**
 * Firebase Chat Types
 */

import { MessageType, SenderType } from './firebase.enums';

/**
 * Chat message from Firebase
 */
export interface ChatMessage {
  id?: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderType: SenderType;
  messageType: MessageType;
  content: string;
  imageUrl?: string;
  actionType?: string;
  actionData?: Record<string, unknown>;
  timestamp: string | number;
  isRead?: boolean;
}

/**
 * Typing state in Firebase
 */
export interface TypingState {
  [userId: string]: number; // timestamp when user started typing
}

/**
 * Request to send a text message
 */
export interface SendTextMessageRequest {
  chatId: string;
  content: string;
}

/**
 * Request to send an action message
 */
export interface SendActionMessageRequest {
  chatId: string;
  actionType: string;
  content: string;
  actionData?: string;
}

/**
 * Request to update typing status
 */
export interface UpdateTypingRequest {
  chatId: string;
  isTyping: boolean;
}

/**
 * Request to update online status
 */
export interface UpdateOnlineStatusRequest {
  chatId: string;
  isOnline: boolean;
}

/**
 * Chat metadata
 */
export interface ChatMetadata {
  ticketId: string;
  customerId: string;
  customerName: string;
  supportId?: string;
  supportName?: string;
  createdAt: string;
  lastMessageAt?: string;
  status: string;
}

/**
 * Firebase notification
 */
export interface FirebaseNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

/**
 * Update FCM token request
 */
export interface UpdateFcmTokenRequest {
  userId: string;
  fcmToken: string;
}

/**
 * Validate FCM token request
 */
export interface ValidateFcmTokenRequest {
  fcmToken: string;
}

/**
 * Mark notification read request
 */
export interface MarkNotificationReadRequest {
  userid: string;
  notificationId: string;
}
