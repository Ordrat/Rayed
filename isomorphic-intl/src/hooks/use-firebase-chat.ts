'use client';

/**
 * Firebase Chat Hook
 * Real-time chat with Firebase Realtime Database
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ref,
  onChildAdded,
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

    try {
      setIsLoading(true);
      const db = getFirebaseDatabase();
      const messagesRef = ref(db, `support_chats/${chatId}/messages`);
      const snapshot = await get(messagesRef);

      if (snapshot.exists()) {
        const messagesData = snapshot.val();
        const messagesList: ChatMessage[] = Object.entries(messagesData).map(
          ([key, value]) => ({
            id: key,
            ...(value as Omit<ChatMessage, 'id'>),
          })
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
      }
    } catch (err) {
      console.error('Error loading messages:', err);
      setError('Failed to load messages');
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
        console.error('Error sending message:', err);
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

  // Mark messages as read
  const markAsRead = useCallback(async () => {
    if (!chatId || !token) return;
    try {
      await markMessagesAsRead(chatId, token);
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  }, [chatId, token]);

  // Set up real-time listeners
  useEffect(() => {
    if (!chatId) return;

    const db = getFirebaseDatabase();
    
    // Clean up previous listeners
    unsubscribersRef.current.forEach((unsub) => unsub());
    unsubscribersRef.current = [];

    // Listen for new messages
    const messagesRef = ref(db, `support_chats/${chatId}/messages`);
    const messageUnsub = onChildAdded(messagesRef, (snapshot) => {
      const messageId = snapshot.key;
      if (!messageId || processedMessageIds.current.has(messageId)) {
        return;
      }

      processedMessageIds.current.add(messageId);
      const messageData = snapshot.val() as Omit<ChatMessage, 'id'>;
      const newMessage: ChatMessage = {
        id: messageId,
        ...messageData,
      };

      setMessages((prev) => [...prev, newMessage]);
      onNewMessage?.(newMessage);
    });
    unsubscribersRef.current.push(messageUnsub);

    // Listen for typing status
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
