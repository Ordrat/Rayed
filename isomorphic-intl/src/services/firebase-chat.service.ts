/**
 * Firebase Chat Service
 * Handles all chat-related API operations
 */

import { apiRequest } from '@/lib/api-client';
import {
  SendTextMessageRequest,
  SendActionMessageRequest,
  UpdateTypingRequest,
  ChatMetadata,
} from '@/types/firebase-chat.types';

const BASE_URL = '/api/v1/FirebaseChat';

/**
 * Send a text message
 */
export async function sendTextMessage(
  data: SendTextMessageRequest,
  token: string
): Promise<string> {
  return apiRequest<string>(`${BASE_URL}/messages/text`, {
    method: 'POST',
    body: JSON.stringify(data),
    token,
  });
}

/**
 * Send an action message (refund, compensation, etc.)
 */
export async function sendActionMessage(
  data: SendActionMessageRequest,
  token: string
): Promise<string> {
  return apiRequest<string>(`${BASE_URL}/messages/action`, {
    method: 'POST',
    body: JSON.stringify(data),
    token,
  });
}

/**
 * Send a system message
 */
export async function sendSystemMessage(
  chatId: string,
  content: string,
  token: string
): Promise<string> {
  return apiRequest<string>(`${BASE_URL}/messages/system?chatId=${chatId}`, {
    method: 'POST',
    body: JSON.stringify(content),
    token,
  });
}

/**
 * Update typing status
 */
export async function updateTypingStatus(
  data: UpdateTypingRequest,
  token: string
): Promise<void> {
  return apiRequest<void>(`${BASE_URL}/typing`, {
    method: 'PUT',
    body: JSON.stringify(data),
    token,
  });
}

/**
 * Mark all messages as read
 */
export async function markMessagesAsRead(
  chatId: string,
  token: string
): Promise<void> {
  // URL encode the chatId to handle special characters
  const encodedChatId = encodeURIComponent(chatId);
  try {
    await apiRequest<void>(`${BASE_URL}/messages/read?chatId=${encodedChatId}`, {
      method: 'PUT',
      token,
    });
  } catch (error: any) {
    // Log but don't throw for non-critical operation
    console.warn('[Firebase Chat] Mark as read failed:', error?.message || error);
    throw error;
  }
}

/**
 * Get unread message count
 */
export async function getUnreadCount(
  chatId: string,
  token: string
): Promise<number> {
  return apiRequest<number>(`${BASE_URL}/unread-count?chatId=${chatId}`, {
    method: 'GET',
    token,
  });
}

/**
 * Get chat metadata
 */
export async function getChatMetadata(
  chatId: string,
  token: string
): Promise<ChatMetadata> {
  return apiRequest<ChatMetadata>(`${BASE_URL}/metadata?chatId=${chatId}`, {
    method: 'GET',
    token,
  });
}

/**
 * Update online status
 */
export async function updateOnlineStatus(
  chatId: string,
  isOnline: boolean,
  token: string
): Promise<void> {
  return apiRequest<void>(`${BASE_URL}/online-status`, {
    method: 'PUT',
    body: JSON.stringify({ chatId, isOnline }),
    token,
  });
}
