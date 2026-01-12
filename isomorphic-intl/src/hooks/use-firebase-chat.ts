'use client';

/**
 * Firebase Chat Hook
 * Real-time chat with Firebase Realtime Database
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ref,
  onChildAdded,
  onChildChanged,
  onValue,
  get,
} from 'firebase/database';
import { ChatMessage, TypingState } from '@/types/firebase-chat.types';
import { SenderType } from '@/types/firebase.enums';
import {
  sendTextMessage,
  updateTypingStatus,
  markMessagesAsRead,
} from '@/services/firebase-chat.service';
import { getFirebaseDatabase } from '@/lib/firebase-config';

interface UseFirebaseChatOptions {
  chatId: string;
  token: string;
  userType: 'customer' | 'support';
  onNewMessage?: (message: ChatMessage) => void;
}

interface UseFirebaseChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  isConnected: boolean;
  isOtherTyping: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  setTyping: (isTyping: boolean) => void;
  markAsRead: () => Promise<void>;
  loadExistingMessages: () => Promise<void>;
}

export function useFirebaseChat({
  chatId,
  token,
  userType,
  onNewMessage,
}: UseFirebaseChatOptions): UseFirebaseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const unsubscribersRef = useRef<(() => void)[]>([]);
  const processedMessageIds = useRef<Set<string>>(new Set());

  // Determine if a message is from the current user
  const isMyMessage = useCallback(
    (senderType: SenderType): boolean => {
      if (userType === 'customer') {
        return senderType === SenderType.Customer;
      }
      return senderType === SenderType.Support;
    },
    [userType]
  );

  // Load existing messages
  const loadExistingMessages = useCallback(async () => {
    if (!chatId) return;

    // Load existing messages silently

    try {
      setIsLoading(true);
      const db = getFirebaseDatabase();
      // Firebase path: support_chats/{chatId}/messages (e.g., support_chats/ticket_xxx/messages)
      const messagesPath = `support_chats/${chatId}/messages`;
      const messagesRef = ref(db, messagesPath);
      console.log('[Chat] Firebase path:', messagesPath);
      console.log('[Chat] Database URL:', db.app.options.databaseURL);

      // Try to read the database root to test connectivity
      const rootRef = ref(db);
      const rootSnapshot = await get(rootRef);
      console.log('[Chat] Database root exists:', rootSnapshot.exists());
      if (rootSnapshot.exists()) {
        console.log('[Chat] Database root keys:', Object.keys(rootSnapshot.val() || {}));
      }

      // Also try to read the parent (chat metadata) to diagnose access issues
      const chatRef = ref(db, `support_chats/${chatId}`);
      const chatSnapshot = await get(chatRef);
      console.log('[Chat] Chat root exists:', chatSnapshot.exists());
      if (chatSnapshot.exists()) {
        console.log('[Chat] Chat root data keys:', Object.keys(chatSnapshot.val() || {}));
      }

      const snapshot = await get(messagesRef);
      if (snapshot.exists()) {
        const messagesData = snapshot.val();

        const messagesList: ChatMessage[] = Object.entries(messagesData).map(
          ([key, value]) => {
            const msg = value as Record<string, any>;
            // Map Firebase PascalCase to TypeScript camelCase
            return {
              id: key,
              chatId: msg.ChatId || msg.chatId || chatId,
              senderId: msg.SenderId || msg.senderId || '',
              senderName: msg.SenderName || msg.senderName || '',
              senderType: msg.SenderType ?? msg.senderType ?? 0,
              messageType: msg.MessageType ?? msg.messageType ?? 0,
              content: msg.Content || msg.content || '',
              imageUrl: msg.ImageUrl || msg.imageUrl,
              actionType: msg.ActionType || msg.actionType,
              actionData: msg.ActionData || msg.actionData,
              timestamp: msg.Timestamp || msg.timestamp || Date.now(),
              isRead: msg.IsRead ?? msg.isRead ?? false,
            };
          }
        );

        // Sort by timestamp
        messagesList.sort((a, b) => {
          const timeA = typeof a.timestamp === 'string' ? new Date(a.timestamp).getTime() : a.timestamp;
          const timeB = typeof b.timestamp === 'string' ? new Date(b.timestamp).getTime() : b.timestamp;
          return timeA - timeB;
        });

        // Track processed message IDs
        messagesList.forEach((msg) => {
          if (msg.id) processedMessageIds.current.add(msg.id);
        });

        setMessages(messagesList);
      } else {
        // No messages found
      }
    } catch (err: any) {
      console.error('[Chat] Error loading messages:', err?.message);
      // Check for permission denied error
      if (err?.code === 'PERMISSION_DENIED' || err?.message?.includes('permission')) {
        setError('Permission denied - check Firebase security rules');
      } else {
        setError('Failed to load messages');
      }
    } finally {
      setIsLoading(false);
    }
  }, [chatId]);

  // Send a new message
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || !chatId || !token) return;

      try {
        await sendTextMessage({ chatId, content }, token);

        // Clear typing indicator after sending
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        await updateTypingStatus({ chatId, isTyping: false }, token);
      } catch (err) {
        console.error('[Chat] Error sending message:', err);
        throw err;
      }
    },
    [chatId, token]
  );

  // Update typing status with debounce
  const setTyping = useCallback(
    (isTyping: boolean) => {
      if (!chatId || !token) return;

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Update typing status
      updateTypingStatus({ chatId, isTyping }, token).catch(console.error);

      // Auto-clear typing after 3 seconds
      if (isTyping) {
        typingTimeoutRef.current = setTimeout(() => {
          updateTypingStatus({ chatId, isTyping: false }, token).catch(console.error);
        }, 3000);
      }
    },
    [chatId, token]
  );

  // Track if we've already called markAsRead to avoid repeated calls
  const markAsReadCalledRef = useRef<boolean>(false);
  const lastMarkAsReadChatId = useRef<string>('');

  // Mark messages as read via backend API
  // The backend is responsible for updating Firebase
  const markAsRead = useCallback(async () => {
    if (!chatId || !token) return;
    
    // Prevent calling multiple times for the same chat session
    if (markAsReadCalledRef.current && lastMarkAsReadChatId.current === chatId) {
      return;
    }

    try {
      markAsReadCalledRef.current = true;
      lastMarkAsReadChatId.current = chatId;
      
      // Use the backend API to mark messages as read
      // The backend has proper permissions to update Firebase
      await markMessagesAsRead(chatId, token);
      
    } catch (err: any) {
      // Reset flag on error so we can retry
      markAsReadCalledRef.current = false;
      // Silently ignore - not critical for chat functionality
    }
  }, [chatId, token]);

  // Set up real-time listeners
  useEffect(() => {
    if (!chatId) return;

    const db = getFirebaseDatabase();
    
    // Clean up previous listeners
    unsubscribersRef.current.forEach((unsub) => unsub());
    unsubscribersRef.current = [];

    // Listen for new messages - Firebase path: support_chats/{chatId}/messages
    const messagesRef = ref(db, `support_chats/${chatId}/messages`);

    const messageUnsub = onChildAdded(
      messagesRef,
      (snapshot) => {
        const messageId = snapshot.key;

        if (!messageId || processedMessageIds.current.has(messageId)) {
          return;
        }

        processedMessageIds.current.add(messageId);
        const msg = snapshot.val() as Record<string, any>;

        // Map Firebase PascalCase to TypeScript camelCase
        const newMessage: ChatMessage = {
          id: messageId,
          chatId: msg.ChatId || msg.chatId || chatId,
          senderId: msg.SenderId || msg.senderId || '',
          senderName: msg.SenderName || msg.senderName || '',
          senderType: msg.SenderType ?? msg.senderType ?? 0,
          messageType: msg.MessageType ?? msg.messageType ?? 0,
          content: msg.Content || msg.content || '',
          imageUrl: msg.ImageUrl || msg.imageUrl,
          actionType: msg.ActionType || msg.actionType,
          actionData: msg.ActionData || msg.actionData,
          timestamp: msg.Timestamp || msg.timestamp || Date.now(),
          isRead: msg.IsRead ?? msg.isRead ?? false,
        };

        setMessages((prev) => [...prev, newMessage]);
        onNewMessage?.(newMessage);
      },
      (error) => {
        console.error('[Chat] Listener error:', error?.message);
        setError(`Firebase error: ${error?.message || 'Unknown error'}`);
      }
    );
    unsubscribersRef.current.push(messageUnsub);

    // Listen for message changes (read status updates)
    const messageChangeUnsub = onChildChanged(
      messagesRef,
      (snapshot) => {
        const messageId = snapshot.key;
        if (!messageId) return;

        const msg = snapshot.val() as Record<string, any>;
        const newIsRead = msg.IsRead ?? msg.isRead ?? false;

        // Update the message in state
        setMessages((prev) =>
          prev.map((m) => {
            if (m.id === messageId && m.isRead !== newIsRead) {
              return { ...m, isRead: newIsRead };
            }
            return m;
          })
        );
      },
      (error) => {
        // Silently ignore Firebase listener errors
      }
    );
    unsubscribersRef.current.push(messageChangeUnsub);

    // Listen for typing status - Firebase path: support_chats/{chatId}/typing
    const typingRef = ref(db, `support_chats/${chatId}/typing`);
    const typingUnsub = onValue(typingRef, (snapshot) => {
      const typingData = snapshot.val() as TypingState | null;
      if (!typingData) {
        setIsOtherTyping(false);
        return;
      }

      // Check if anyone else is typing (within last 5 seconds)
      const now = Date.now();
      const someoneTyping = Object.values(typingData).some(
        (timestamp) => timestamp && now - timestamp < 5000
      );
      setIsOtherTyping(someoneTyping);
    });
    unsubscribersRef.current.push(typingUnsub);

    setIsConnected(true);

    // Load existing messages on mount
    loadExistingMessages();

    return () => {
      unsubscribersRef.current.forEach((unsub) => unsub());
      unsubscribersRef.current = [];
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      setIsConnected(false);
    };
  }, [chatId, loadExistingMessages, onNewMessage]);

  return {
    messages,
    isLoading,
    isConnected,
    isOtherTyping,
    error,
    sendMessage,
    setTyping,
    markAsRead,
    loadExistingMessages,
  };
}
