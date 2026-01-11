'use client';

/**
 * Chat Header Component
 * Shows ticket info, connection status, and user avatar
 */

import cn from "@core/utils/class-names";
import { SupportTicket } from '@/types/support-ticket.types';
import {
  TicketStatusLabels,
  TicketCategoryLabels,
  TicketStatus,
} from '@/types/firebase.enums';
import { Badge, Avatar } from 'rizzui';
import { PiCircleFill, PiXBold } from 'react-icons/pi';

interface ChatHeaderProps {
  ticket?: SupportTicket;
  customerName?: string;
  isConnected: boolean;
  locale?: string;
  onClose?: () => void;
  className?: string;
}

function getStatusColor(status: TicketStatus): string {
  switch (status) {
    case TicketStatus.Open:
      return 'bg-blue-500';
    case TicketStatus.Assigned:
    case TicketStatus.InProgress:
      return 'bg-yellow-500';
    case TicketStatus.WaitingCustomer:
      return 'bg-orange-500';
    case TicketStatus.Resolved:
      return 'bg-green-500';
    case TicketStatus.Closed:
      return 'bg-gray-500';
    default:
      return 'bg-gray-500';
  }
}

export function ChatHeader({
  ticket,
  customerName,
  isConnected,
  locale = 'en',
  onClose,
  className,
}: ChatHeaderProps) {
  const lang = locale === 'ar' ? 'ar' : 'en';
  
  return (
    <div
      className={cn(
        'flex items-center gap-4 p-4 border-b bg-primary',
        className
      )}
    >
      {/* Avatar */}
      <Avatar
        name={customerName || 'Customer'}
        size="lg"
        className="bg-white/20"
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h2 className="font-semibold text-lg truncate text-white">
          {ticket?.subject || customerName || 'Support Chat'}
        </h2>
        <div className="flex items-center gap-2 text-sm text-white/90">
          {/* Connection status */}
          <span className="flex items-center gap-1">
            <PiCircleFill
              className={cn('w-2 h-2', {
                'text-green-400': isConnected,
                'text-red-400': !isConnected,
              })}
            />
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>

          {/* Ticket number */}
          {ticket?.ticketNumber && (
            <>
              <span>•</span>
              <span>#{ticket.ticketNumber}</span>
            </>
          )}
        </div>
      </div>

      {/* Status badge */}
      {ticket && (
        <Badge
          className={cn(
            'text-white border-0',
            getStatusColor(ticket.status)
          )}
        >
          {TicketStatusLabels[ticket.status]?.[lang] || 'Unknown'}
        </Badge>
      )}

      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-white/20 transition-colors text-white"
          aria-label="Close"
        >
          <PiXBold className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

export default ChatHeader;
