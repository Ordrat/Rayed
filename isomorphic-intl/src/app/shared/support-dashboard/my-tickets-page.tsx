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

  const [activeTickets, setActiveTickets] = useState<SupportTicket[]>([]);
  const [historyTickets, setHistoryTickets] = useState<SupportTicket[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
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
      
      // Filter Active Tickets (Open, InProgress, WaitingCustomer)
      const active = (myTickets || []).filter(
        (ticket) => 
          ticket.status !== TicketStatus.Closed && 
          ticket.status !== TicketStatus.Resolved
      );
      
      // Filter History Tickets (Closed, Resolved)
      const history = (myTickets || []).filter(
        (ticket) => 
          ticket.status === TicketStatus.Closed || 
          ticket.status === TicketStatus.Resolved
      );

      setActiveTickets(active);
      setHistoryTickets(history);
    } catch (error: any) {
      console.error('Failed to fetch tickets:', error);
      toast.error(error.message || 'Failed to fetch tickets');
      setActiveTickets([]);
      setHistoryTickets([]);
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

      {/* Tab Selection */}
      <div className="flex items-center gap-4 mb-8 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('active')}
          className={`pb-3 px-1 text-sm font-medium transition-all relative ${
            activeTab === 'active'
              ? 'text-primary'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          {lang === 'ar' ? 'التذاكر النشطة' : 'Active Tickets'}
          {activeTab === 'active' && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />
          )}
          <Badge
             variant="flat"
             size="sm"
             className={`ms-2 ${activeTab === 'active' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500'}`}
          >
            {activeTickets.length}
          </Badge>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 px-1 text-sm font-medium transition-all relative ${
            activeTab === 'history'
              ? 'text-primary'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          {lang === 'ar' ? 'سجل التذاكر' : 'Ticket History'}
          {activeTab === 'history' && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />
          )}
           <Badge
             variant="flat"
             size="sm"
             className={`ms-2 ${activeTab === 'history' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500'}`}
          >
            {historyTickets.length}
          </Badge>
        </button>
      </div>

      {activeTab === 'active' ? (
        /* Active Tickets View */
        <div>
           {activeTickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-gray-50 rounded-2xl border border-gray-100 dark:bg-gray-800/50 dark:border-gray-700">
              <div className="bg-white p-4 rounded-full mb-4 shadow-sm dark:bg-gray-800">
                <PiChatCircleText className="h-12 w-12 text-gray-400" />
              </div>
              <Title as="h5" className="mb-1">
                {lang === 'ar' ? 'لا توجد تذاكر نشطة' : 'No active tickets'}
              </Title>
              <Text className="text-gray-500 text-sm">
                {lang === 'ar'
                  ? 'رائع! لقد أنجزت جميع مهامك الحالية'
                  : "Great! You have cleared all your active tasks"}
              </Text>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {activeTickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} lang={lang} />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* History View */
        <div>
          {historyTickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 dark:bg-gray-800/30 dark:border-gray-700">
               <Title as="h5" className="mb-1 text-gray-400">
                {lang === 'ar' ? 'لا يوجد سجل تذاكر' : 'No ticket history yet'}
              </Title>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {historyTickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} lang={lang} isHistory={true} />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}

// Reusable Ticket Card Component
function TicketCard({ ticket, lang, isHistory = false }: { ticket: SupportTicket, lang: string, isHistory?: boolean }) {
  // Helper for status colors
  const getStatusColor = (s: number) => {
    switch (s) {
      case TicketStatus.Resolved: return 'success';
      case TicketStatus.Closed: return 'secondary';
      case TicketStatus.WaitingCustomer: return 'warning';
      case TicketStatus.InProgress: return 'info';
      case TicketStatus.Open: return 'primary';
      default: return 'secondary';
    }
  };

  // Helper for priority colors
  const getPriorityColor = (p: number) => {
    switch (p) {
      case 4: return 'danger'; // Urgent
      case 3: return 'warning'; // High
      case 2: return 'info'; // Medium
      default: return 'secondary'; // Low
    }
  };

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-xl border bg-white p-6 transition-all hover:shadow-lg dark:bg-gray-800 ${
        isHistory 
          ? 'border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50' 
          : 'border-gray-200 dark:border-gray-700'
      }`}
    >
      {/* Header with Status */}
      <div className="mb-4">
        <div className="flex items-start justify-between mb-2">
          <Badge variant="outline" className="text-xs font-mono text-gray-500">
             #{ticket.ticketNumber}
          </Badge>
          <Badge
            variant="flat"
            color={getStatusColor(ticket.status)}
            className="capitalize"
          >
            {TicketStatusLabels[ticket.status]?.[lang] || 'Unknown'}
          </Badge>
        </div>
        <Title as="h5" className={`font-semibold text-lg line-clamp-2 leading-snug transition-colors ${!isHistory && 'group-hover:text-primary'}`}>
          {ticket.subject}
        </Title>
      </div>

      {/* Info Grid */}
      <div className="mb-6 grid grid-cols-2 gap-y-3 gap-x-4 text-sm border-t border-b border-gray-100 py-3 dark:border-gray-700">
        <div>
          <Text className="text-gray-500 mb-1 text-xs uppercase tracking-wider">
            {lang === 'ar' ? 'الفئة' : 'Category'}
          </Text>
          <Text className="font-medium text-gray-900 dark:text-gray-100">
             {TicketCategoryLabels[ticket.category]?.[lang] || 'Unknown'}
          </Text>
        </div>
        <div>
           <Text className="text-gray-500 mb-1 text-xs uppercase tracking-wider">
             {lang === 'ar' ? 'الأولوية' : 'Priority'}
           </Text>
           <Badge
             variant="flat"
             size="sm"
             color={getPriorityColor(ticket.priority)}
           >
             {TicketPriorityLabels[ticket.priority]?.[lang] || 'Unknown'}
           </Badge>
        </div>
        <div>
           <Text className="text-gray-500 mb-1 text-xs uppercase tracking-wider">
              {isHistory ? (lang === 'ar' ? 'تاريخ الحل' : 'Resolved') : (lang === 'ar' ? 'تاريخ الإنشاء' : 'Created')}
            </Text>
            <Text className="font-medium text-gray-900 dark:text-gray-100">
               {new Date(ticket.createdAt).toLocaleDateString()}
            </Text>
        </div>
      </div>

      {/* Action */}
      <Link href={routes.supportDashboard.chat(ticket.id)} className="block mt-auto">
        <Button 
          size="lg" 
          variant={isHistory ? "outline" : "solid"}
          className={`w-full shadow-sm transition-transform ${
            isHistory 
              ? 'hover:bg-gray-50 dark:hover:bg-gray-700' 
              : 'bg-primary hover:bg-primary/90 text-white hover:shadow group-hover:-translate-y-0.5'
          }`}
        >
          <PiChatCircleText className={`me-2 h-5 w-5 ${!isHistory && 'text-white'}`} />
          {lang === 'ar' ? 'فتح المحادثة' : 'Open Chat'}
        </Button>
      </Link>
    </div>
  );
}

