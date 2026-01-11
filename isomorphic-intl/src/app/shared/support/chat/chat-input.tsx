'use client';

/**
 * Chat Input Component
 * Text input with send button
 */

import { useState, useCallback, KeyboardEvent, ChangeEvent } from 'react';
import cn from "@core/utils/class-names";
import { PiPaperPlaneTiltFill } from 'react-icons/pi';
import { Button, Input } from 'rizzui';

interface ChatInputProps {
  onSend: (message: string) => Promise<void>;
  onTyping?: (isTyping: boolean) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function ChatInput({
  onSend,
  onTyping,
  disabled = false,
  placeholder = 'Type a message...',
  className,
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = useCallback(async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isSending || disabled) return;

    setIsSending(true);
    try {
      await onSend(trimmedMessage);
      setMessage('');
      onTyping?.(false);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  }, [message, isSending, disabled, onSend, onTyping]);

  const handleKeyPress = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setMessage(e.target.value);
      onTyping?.(e.target.value.length > 0);
    },
    [onTyping]
  );

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-4 border-t bg-white dark:bg-gray-900',
        className
      )}
    >
      <Input
        type="text"
        value={message}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        disabled={disabled || isSending}
        className="flex-1"
        inputClassName="rounded-full px-4 py-3"
      />
      <Button
        onClick={handleSend}
        disabled={!message.trim() || isSending || disabled}
        className="rounded-full w-12 h-12 p-0 flex items-center justify-center"
        isLoading={isSending}
      >
        {!isSending && <PiPaperPlaneTiltFill className="w-5 h-5" />}
      </Button>
    </div>
  );
}

export default ChatInput;
