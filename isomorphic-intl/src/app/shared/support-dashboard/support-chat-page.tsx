'use client';

/**
 * Live Chat Page (Support Agent)
 * Full chat interface for support agents
 */

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { Title, Text, Button, Loader, Badge } from 'rizzui';
import {
  PiArrowLeftBold,
  PiCheckCircleBold,
  PiXCircleBold,
} from 'react-icons/pi';
import { Link } from '@/i18n/routing';
import { routes } from '@/config/routes';
import {
  getSupportTicketById,
  closeSupportTicket,
  updateSupportTicket,
} from '@/services/support-ticket.service';
import { SupportTicket } from '@/types/support-ticket.types';
import {
  TicketStatus,
  TicketStatusLabels,
  TicketCategoryLabels,
} from '@/types/firebase.enums';
import { ChatWindow } from '@/app/shared/support/chat';
import { TicketActionsPanel } from '@/app/shared/support/ticket-actions-panel';
import toast from 'react-hot-toast';
import { useRouter } from '@/i18n/routing';
import { useLocale } from 'next-intl';

export default function SupportChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const locale = useLocale();
  const lang = locale === 'ar' ? 'ar' : 'en';
  const ticketId = params.ticketId as string;

  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (status === 'authenticated' && ticketId) {
      fetchTicket();
    } else if (status === 'unauthenticated') {
      router.push(routes.auth.signIn1);
    }
  }, [session, status, ticketId, router]);

  const fetchTicket = async () => {
    try {
      setIsLoading(true);
      const data = await getSupportTicketById(ticketId, session?.accessToken || '');
      setTicket(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch ticket');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkResolved = async () => {
    setIsUpdating(true);
    try {
      const updated = await updateSupportTicket(
        ticketId,
        { status: TicketStatus.Resolved },
        session?.accessToken || ''
      );
      setTicket(updated);
      toast.success(lang === 'ar' ? 'تم وضع علامة محلولة' : 'Marked as resolved');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update ticket');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCloseTicket = async () => {
    setIsUpdating(true);
    try {
      const updated = await closeSupportTicket(
        ticketId,
        { archiveMessages: true, deleteFirebaseChat: false },
        session?.accessToken || ''
      );
      setTicket(updated);
      toast.success(lang === 'ar' ? 'تم إغلاق التذكرة' : 'Ticket closed');
      router.push(routes.supportDashboard.tickets);
    } catch (error: any) {
      toast.error(error.message || 'Failed to close ticket');
    } finally {
      setIsUpdating(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader variant="spinner" size="xl" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <Text className="mb-4 text-gray-500">
          {lang === 'ar' ? 'لم يتم العثور على التذكرة' : 'Ticket not found'}
        </Text>
        <Link href={routes.supportDashboard.tickets}>
          <Button variant="outline">
            <PiArrowLeftBold className="me-2 h-4 w-4" />
            {lang === 'ar' ? 'العودة' : 'Go Back'}
          </Button>
        </Link>
      </div>
    );
  }

  const chatId = `ticket_${ticket.id}`;
  const isClosed = ticket.status === TicketStatus.Closed;
  const isResolved = ticket.status === TicketStatus.Resolved;

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="flex items-center justify-between border rounded-lg bg-white px-4 py-3 dark:bg-gray-900">
        <div className="flex items-center gap-4">
          <Link href={routes.supportDashboard.tickets}>
            <Button variant="text" size="sm">
              <PiArrowLeftBold className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Title as="h5" className="font-semibold">
                #{ticket.ticketNumber}
              </Title>
              <Badge
                size="sm"
                color={
                  isClosed
                    ? 'secondary'
                    : isResolved
                    ? 'success'
                    : 'warning'
                }
              >
                {TicketStatusLabels[ticket.status]?.[lang]}
              </Badge>
            </div>
            <Text className="text-sm text-gray-500">
              {TicketCategoryLabels[ticket.category]?.[lang]} • {ticket.subject}
            </Text>
          </div>
        </div>

        {/* Actions */}
        {!isClosed && (
          <div className="flex gap-2">
            {!isResolved && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkResolved}
                isLoading={isUpdating}
                className="border-green-500 text-green-600 hover:bg-green-50"
              >
                <PiCheckCircleBold className="me-1 h-4 w-4" />
                {lang === 'ar' ? 'تم الحل' : 'Resolved'}
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleCloseTicket}
              isLoading={isUpdating}
              className="bg-gray-600 hover:bg-gray-700"
            >
              <PiXCircleBold className="me-1 h-4 w-4" />
              {lang === 'ar' ? 'إغلاق' : 'Close'}
            </Button>
          </div>
        )}
      </div>

      {/* Main Content - Chat and Actions side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chat Window */}
        <div className="lg:col-span-2" style={{ height: '500px' }}>
          {isClosed ? (
            <div className="flex h-full items-center justify-center text-gray-500 border rounded-lg bg-white dark:bg-gray-900">
              {lang === 'ar' ? 'هذه التذكرة مغلقة' : 'This ticket is closed'}
            </div>
          ) : (
            <ChatWindow
              ticket={ticket}
              chatId={chatId}
              token={session?.accessToken || ''}
              userType="support"
              locale={locale}
              className="h-full"
            />
          )}
        </div>

        {/* Actions Panel */}
        <div className="lg:col-span-1">
          <TicketActionsPanel
            ticketId={ticket.id}
            token={session?.accessToken || ''}
            locale={locale}
            isClosed={isClosed}
          />
        </div>
      </div>
    </div>
  );
}
