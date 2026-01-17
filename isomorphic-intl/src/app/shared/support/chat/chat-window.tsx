"use client";

/**
 * Chat Window Component
 * Main chat container combining all components
 */

import { useRef, useEffect, useCallback } from "react";
import cn from "@core/utils/class-names";
import { useFirebaseChat } from "@/hooks/use-firebase-chat";
import { SupportTicket } from "@/types/support-ticket.types";
import { SenderType } from "@/types/firebase.enums";
import { ChatMessage } from "@/types/firebase-chat.types";
import { ChatMessageBubble } from "./chat-message";
import { TypingIndicator } from "./typing-indicator";
import { ChatInput } from "./chat-input";
import { ChatHeader } from "./chat-header";
import { Loader } from "rizzui";
import { PiChatCircleTextLight } from "react-icons/pi";
import notificationAudio from "@/lib/audio-context";

interface ChatWindowProps {
  ticket: SupportTicket;
  chatId: string;
  token: string;
  userType: "customer" | "support";
  customerName?: string;
  locale?: string;
  onClose?: () => void;
  className?: string;
  readOnly?: boolean;
}

export function ChatWindow({
  ticket,
  chatId,
  token,
  userType,
  customerName,
  locale = "en",
  onClose,
  className,
  readOnly = false,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastMessageCountRef = useRef<number>(0);

  // Determine if a message is from current user
  const isOwnMessage = useCallback(
    (senderType: SenderType): boolean => {
      if (userType === "customer") {
        return senderType === SenderType.Customer;
      }
      return senderType === SenderType.Support;
    },
    [userType]
  );

  // Handle new message notification
  const handleNewMessage = useCallback(
    (message: ChatMessage) => {
      // Only play sound for messages from the other party
      if (!isOwnMessage(message.senderType)) {
        notificationAudio.playNotificationSound();
      }
    },
    [isOwnMessage]
  );

  const { messages, isLoading, isConnected, isOtherTyping, error, sendMessage, setTyping, markAsRead } =
    useFirebaseChat({
      chatId,
      token,
      userType,
      onNewMessage: handleNewMessage,
    });

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOtherTyping]);

  // Auto mark messages as read when new messages arrive
  useEffect(() => {
    const messageCount = messages.length;

    // Skip if no messages or if this is the initial load
    if (messageCount === 0) {
      console.log('[ChatWindow] No messages to mark as read');
      return;
    }

    // Mark as read when:
    // 1. Initial load (lastMessageCountRef is 0)
    // 2. New messages arrive (count increases)
    if (lastMessageCountRef.current === 0 || messageCount > lastMessageCountRef.current) {
      console.log('[ChatWindow] New messages detected, marking as read. Previous:', lastMessageCountRef.current, 'Current:', messageCount);
      lastMessageCountRef.current = messageCount;
      markAsRead();
    }
  }, [messages, markAsRead]);

  return (
    <div
      className={cn("flex flex-col h-full bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden", className)}
    >
      {/* Header */}
      <ChatHeader
        ticket={ticket}
        customerName={customerName}
        isConnected={isConnected}
        locale={locale}
        onClose={onClose}
      />

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-950">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader size="lg" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full text-red-500">{error}</div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <PiChatCircleTextLight className="w-20 h-20 mb-4 opacity-50" />
            <p className="text-lg">{locale === "ar" ? "لا توجد رسائل بعد" : "No messages yet"}</p>
            <p className="text-sm">{locale === "ar" ? "ابدأ المحادثة مع العميل" : "Start the conversation"}</p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <ChatMessageBubble
                key={message.id || index}
                message={message}
                isOwn={isOwnMessage(message.senderType)}
                locale={locale}
              />
            ))}
          </>
        )}

        {/* Typing indicator */}
        {isOtherTyping && <TypingIndicator />}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area - hide when readOnly */}
      {!readOnly && (
        <ChatInput
          onSend={sendMessage}
          onTyping={setTyping}
          disabled={!isConnected}
          placeholder={locale === "ar" ? "اكتب رسالة..." : "Type a message..."}
        />
      )}
    </div>
  );
}

export default ChatWindow;
