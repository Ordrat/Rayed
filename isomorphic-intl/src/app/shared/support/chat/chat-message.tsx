'use client';

/**
 * Chat Message Component
 * Displays a single message bubble
 */

import cn from "@core/utils/class-names";
import { ChatMessage as ChatMessageType } from '@/types/firebase-chat.types';
import { MessageType, SenderType, SenderTypeLabels } from '@/types/firebase.enums';

interface ChatMessageProps {
  message: ChatMessageType;
  isOwn: boolean;
  locale?: string;
}

function formatTime(timestamp: string | number): string {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function ChatMessageBubble({ message, isOwn, locale = 'en' }: ChatMessageProps) {
  const isSystem = message.messageType === MessageType.System;
  const isAction = message.messageType === MessageType.Action;
  
  // System messages
  if (isSystem) {
    return (
      <div className="flex justify-center my-3">
        <div className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm px-4 py-2 rounded-full">
          {message.content}
        </div>
      </div>
    );
  }

  // Action messages (refunds, etc.)
  if (isAction) {
    return (
      <div className="flex justify-center my-3">
        <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-4 py-3 rounded-xl text-center max-w-md">
          <div className="font-semibold">💰 {message.content}</div>
          {message.actionData && (
            <div className="text-sm mt-1 opacity-80">
              {typeof message.actionData === 'string'
                ? message.actionData
                : JSON.stringify(message.actionData)}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Regular text messages
  return (
    <div
      className={cn('flex mb-4', {
        'justify-end': isOwn,
        'justify-start': !isOwn,
      })}
    >
      <div
        className={cn('max-w-[75%] px-4 py-3 rounded-2xl', {
          'bg-primary text-primary-foreground rounded-br-md': isOwn,
          'bg-muted dark:bg-gray-800 rounded-bl-md': !isOwn,
        })}
      >
        {/* Sender name for received messages */}
        {!isOwn && message.senderName && (
          <div className="text-xs font-semibold text-primary mb-1">
            {message.senderName}
          </div>
        )}
        
        {/* Message content */}
        <div className="break-words">{message.content}</div>
        
        {/* Image if present */}
        {message.imageUrl && (
          <img
            src={message.imageUrl}
            alt="attachment"
            className="mt-2 max-w-[250px] rounded-lg cursor-pointer hover:opacity-90"
            onClick={() => window.open(message.imageUrl, '_blank')}
          />
        )}
        
        {/* Timestamp */}
        <div
          className={cn('text-xs mt-1', {
            'text-primary-foreground/70': isOwn,
            'text-muted-foreground': !isOwn,
          })}
        >
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
}

export default ChatMessageBubble;
