'use client';

/**
 * My Assigned Tickets Page (Support Agent)
 * Shows tickets assigned to the current support agent
 */

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Title, Text, Badge, Button, Loader } from 'rizzui';
import { PiChatCircleText } from 'react-icons/pi';
import { Link } from '@/i18n/routing';
import { routes } from '@/config/routes';
import { getSupportAgentTickets } from '@/services/support-ticket.service';
import { SupportTicket } from '@/types/support-ticket.types';
import {
  TicketStatus,
  TicketStatusLabels,
  TicketCategoryLabels,
  TicketPriorityLabels,
} from '@/types/firebase.enums';
import PageHeader from '@/app/shared/page-header';
import toast from 'react-hot-toast';
import { useRouter } from '@/i18n/routing';
import { useLocale } from 'next-intl';

const pageHeader = {
  title: 'My Tickets',
  breadcrumb: [
    { name: 'Home', href: '/' },
    { name: 'Support Dashboard', href: routes.supportDashboard.home },
    { name: 'My Tickets' },
  ],
};

export default function MyTicketsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const locale = useLocale();
  const lang = locale === 'ar' ? 'ar' : 'en';

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchMyTickets();
    } else if (status === 'unauthenticated') {
      router.push(routes.auth.signIn1);
    }
  }, [session, status, router]);

  const fetchMyTickets = async () => {
    try {
      setIsLoading(true);
      // Get tickets assigned to the current support agent
      const myTickets = await getSupportAgentTickets(session?.accessToken || '');
      // Filter out closed tickets
      const activeTickets = (myTickets || []).filter(
        (ticket) => ticket.status !== TicketStatus.Closed
      );
      setTickets(activeTickets);
    } catch (error: any) {
      console.error('Failed to fetch tickets:', error);
      toast.error(error.message || 'Failed to fetch tickets');
      setTickets([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader variant="spinner" size="xl" />
      </div>
    );
  }

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />

      {tickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <PiChatCircleText className="h-20 w-20 text-gray-300 mb-4" />
          <Title as="h4" className="mb-2">
            {lang === 'ar' ? 'لا توجد تذاكر مخصصة لك' : 'No tickets assigned to you'}
          </Title>
          <Text className="text-gray-500">
            {lang === 'ar'
              ? 'سيتم إشعارك عند تعيين تذكرة جديدة'
              : "You'll be notified when a new ticket is assigned"}
          </Text>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="rounded-lg border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
            >
              {/* Header */}
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <Text className="text-xs text-gray-500">#{ticket.ticketNumber}</Text>
                  <Title as="h5" className="font-semibold line-clamp-2">
                    {ticket.subject}
                  </Title>
                </div>
                <Badge
                  color={
                    ticket.status === TicketStatus.WaitingCustomer
                      ? 'warning'
                      : ticket.status === TicketStatus.InProgress
                      ? 'info'
                      : 'secondary'
                  }
                  size="sm"
                >
                  {TicketStatusLabels[ticket.status]?.[lang] || 'Unknown'}
                </Badge>
              </div>

              {/* Info */}
              <div className="mb-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <Text className="text-gray-500">
                    {lang === 'ar' ? 'الفئة' : 'Category'}
                  </Text>
                  <Text>{TicketCategoryLabels[ticket.category]?.[lang] || 'Unknown'}</Text>
                </div>
                <div className="flex justify-between">
                  <Text className="text-gray-500">
                    {lang === 'ar' ? 'الأولوية' : 'Priority'}
                  </Text>
                  <Badge
                    size="sm"
                    color={
                      ticket.priority === 4
                        ? 'danger'
                        : ticket.priority === 3
                        ? 'warning'
                        : 'secondary'
                    }
                  >
                    {TicketPriorityLabels[ticket.priority]?.[lang] || 'Unknown'}
                  </Badge>
                </div>
              </div>

              {/* Action */}
              <Link href={routes.supportDashboard.chat(ticket.id)} className="block">
                <Button className="w-full bg-primary hover:bg-primary/90">
                  <PiChatCircleText className="me-2 h-4 w-4" />
                  {lang === 'ar' ? 'فتح المحادثة' : 'Open Chat'}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
