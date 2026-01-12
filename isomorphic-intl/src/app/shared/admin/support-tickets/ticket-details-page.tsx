'use client';

/**
 * Ticket Details Page (Admin)
 * Full ticket info including chat history
 */

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import {
  Title,
  Text,
  Badge,
  Button,
  Loader,
  Select,
} from 'rizzui';
import {
  PiArrowLeftBold,
  PiChatCircleText,
  PiCheckCircleBold,
  PiUserCirclePlus,
  PiXCircleBold,
} from 'react-icons/pi';
import { Link } from '@/i18n/routing';
import { routes } from '@/config/routes';
import {
  getSupportTicketById,
  assignTicketToAgent,
  closeSupportTicket,
  getArchivedMessages,
} from '@/services/support-ticket.service';
import { getAllSupport } from '@/services/support.service';
import { SupportTicket, ArchivedMessage } from '@/types/support-ticket.types';
import { SupportAgent } from '@/types/support.types';
import {
  TicketStatus,
  TicketStatusLabels,
  TicketCategoryLabels,
  TicketPriorityLabels,
  SenderType,
  MessageType,
} from '@/types/firebase.enums';
import PageHeader from '@/app/shared/page-header';
import { ChatWindow } from '@/app/shared/support/chat';
import { TicketActionsPanel } from '@/app/shared/support/ticket-actions-panel';
import toast from 'react-hot-toast';
import { useRouter } from '@/i18n/routing';
import { useLocale } from 'next-intl';


export default function TicketDetailsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const locale = useLocale();
  const lang = locale === 'ar' ? 'ar' : 'en';
  const ticketId = params.ticketId as string;

  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [agents, setAgents] = useState<SupportAgent[]>([]);
  const [archivedMessages, setArchivedMessages] = useState<ArchivedMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClosing, setIsClosing] = useState(false);

  const pageHeader = {
    title: ticket ? `Ticket #${ticket.ticketNumber}` : 'Ticket Details',
    breadcrumb: [
      { name: lang === 'ar' ? 'الرئيسية' : 'Home', href: '/', isStatic: true },
      { name: lang === 'ar' ? 'الإدارة' : 'Admin', href: '#', isStatic: true },
      { name: lang === 'ar' ? 'تذاكر الدعم' : 'Support Tickets', href: routes.support.tickets, isStatic: true },
      { name: ticket?.ticketNumber || 'Details', isStatic: true },
    ],
  };

  useEffect(() => {
    if (status === 'authenticated' && ticketId) {
      fetchData();
    } else if (status === 'unauthenticated') {
      router.push(routes.auth.signIn1);
    }
  }, [session, status, ticketId, router]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [ticketData, agentsData] = await Promise.all([
        getSupportTicketById(ticketId, session?.accessToken || ''),
        getAllSupport(session?.accessToken || ''),
      ]);
      setTicket(ticketData);
      setAgents(agentsData || []);

      // Load archived messages if ticket is closed
      if (ticketData.status === TicketStatus.Closed) {
        const messages = await getArchivedMessages(ticketId, session?.accessToken || '');
        setArchivedMessages(messages || []);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch ticket details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignAgent = async (agentId: string) => {
    try {
      const updated = await assignTicketToAgent(ticketId, agentId, session?.accessToken || '');
      setTicket(updated);
      toast.success(lang === 'ar' ? 'تم تعيين التذكرة بنجاح' : 'Ticket assigned successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to assign ticket');
    }
  };

  const handleCloseTicket = async () => {
    setIsClosing(true);
    try {
      const updated = await closeSupportTicket(
        ticketId,
        { archiveMessages: true, deleteFirebaseChat: false },
        session?.accessToken || ''
      );
      setTicket(updated);
      toast.success(lang === 'ar' ? 'تم إغلاق التذكرة' : 'Ticket closed successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to close ticket');
    } finally {
      setIsClosing(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader variant="spinner" size="xl" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center">
        <Text className="mb-4 text-gray-500">
          {lang === 'ar' ? 'لم يتم العثور على التذكرة' : 'Ticket not found'}
        </Text>
        <Link href={routes.support.tickets}>
          <Button variant="outline">
            <PiArrowLeftBold className="me-2 h-4 w-4" />
            {lang === 'ar' ? 'العودة للتذاكر' : 'Back to Tickets'}
          </Button>
        </Link>
      </div>
    );
  }

  const isClosed = ticket.status === TicketStatus.Closed;
  const isResolved = ticket.status === TicketStatus.Resolved;
  const isReadOnly = isClosed || isResolved;
  // ChatId format: ticket_{ticketId without dashes} - must match Firebase format
  const chatId = `ticket_${ticket.id.replace(/-/g, '')}`;

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} isStaticTitle={true}>
        <div className="flex items-center gap-2">
          <Link href={routes.support.tickets}>
            <Button variant="outline">
              <PiArrowLeftBold className="me-2 h-4 w-4" />
              {lang === 'ar' ? 'رجوع' : 'Back'}
            </Button>
          </Link>
          {!isClosed && (
            <Button
              onClick={handleCloseTicket}
              isLoading={isClosing}
              className="bg-green-600 hover:bg-green-700"
            >
              <PiCheckCircleBold className="me-2 h-4 w-4" />
              {lang === 'ar' ? 'إغلاق التذكرة' : 'Close Ticket'}
            </Button>
          )}
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Panel - Ticket Info & Actions */}
        <div className="lg:col-span-1 space-y-6">
          {/* Status Card */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <Title as="h4" className="mb-4 text-lg font-semibold">
              {lang === 'ar' ? 'معلومات التذكرة' : 'Ticket Info'}
            </Title>
            <div className="space-y-4">
              <div className="flex justify-between">
                <Text className="text-gray-500">
                  {lang === 'ar' ? 'الحالة' : 'Status'}
                </Text>
                <Badge
                  color={
                    ticket.status === TicketStatus.Closed
                      ? 'secondary'
                      : ticket.status === TicketStatus.Resolved
                      ? 'success'
                      : 'warning'
                  }
                >
                  {TicketStatusLabels[ticket.status]?.[lang] || 'Unknown'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <Text className="text-gray-500">
                  {lang === 'ar' ? 'الفئة' : 'Category'}
                </Text>
                <Text className="font-medium">
                  {TicketCategoryLabels[ticket.category]?.[lang] || 'Unknown'}
                </Text>
              </div>
              <div className="flex justify-between">
                <Text className="text-gray-500">
                  {lang === 'ar' ? 'الأولوية' : 'Priority'}
                </Text>
                <Badge
                  color={
                    ticket.priority === 4
                      ? 'danger'
                      : ticket.priority === 3
                      ? 'warning'
                      : 'info'
                  }
                >
                  {TicketPriorityLabels[ticket.priority]?.[lang] || 'Unknown'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <Text className="text-gray-500">
                  {lang === 'ar' ? 'تاريخ الإنشاء' : 'Created'}
                </Text>
                <Text className="font-medium">
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </Text>
              </div>
            </div>
          </div>

          {/* Assignment Card - Only show for open tickets */}
          {!isReadOnly && (
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <Title as="h4" className="mb-4 text-lg font-semibold">
                {lang === 'ar' ? 'تعيين لوكيل' : 'Assign to Agent'}
              </Title>
              <Select
                options={agents.map((agent) => ({
                  value: agent.id,
                  label: `${agent.firstName} ${agent.lastName}`,
                }))}
                value={
                  ticket.assignedToSupportId
                    ? {
                        value: ticket.assignedToSupportId,
                        label: (() => {
                          const agent = agents.find(a => a.id === ticket.assignedToSupportId);
                          return agent ? `${agent.firstName} ${agent.lastName}` : ticket.assignedToSupportId;
                        })(),
                      }
                    : null
                }
                onChange={(option: any) => handleAssignAgent(option?.value)}
                placeholder={lang === 'ar' ? 'اختر وكيل...' : 'Select agent...'}
                className="w-full"
              />
            </div>
          )}

          {/* Actions History Panel */}
          <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 overflow-hidden">
            <TicketActionsPanel
              ticketId={ticket.id}
              token={session?.accessToken || ''}
              locale={locale}
              isClosed={isReadOnly}
            />
          </div>
        </div>

        {/* Chat Panel */}
        <div className="lg:col-span-2">
          <div className="h-[600px] rounded-lg border border-gray-200 overflow-hidden dark:border-gray-700 flex flex-col">
            {isClosed ? (
              // Show archived messages for closed tickets
              <div className="flex flex-col h-full">
                <div className="bg-gray-100 dark:bg-gray-800 p-4 border-b">
                  <Title as="h4" className="font-semibold">
                    {lang === 'ar' ? 'سجل المحادثة' : 'Chat History'}
                  </Title>
                  <Text className="text-sm text-gray-500">
                    {lang === 'ar' ? 'التذكرة مغلقة' : 'This ticket is closed'}
                  </Text>
                </div>
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-950">
                  {archivedMessages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      {lang === 'ar' ? 'لا توجد رسائل مؤرشفة' : 'No archived messages'}
                    </div>
                  ) : (
                    archivedMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`mb-4 flex ${
                          msg.senderType === SenderType.Support ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[75%] px-4 py-3 rounded-2xl ${
                            msg.senderType === SenderType.Support
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-white dark:bg-gray-800'
                          }`}
                        >
                          {msg.senderType !== SenderType.Support && (
                            <Text className="text-xs font-semibold text-primary mb-1">
                              {msg.senderName}
                            </Text>
                          )}
                          <Text>{msg.messageText}</Text>
                          <Text className="text-xs opacity-70 mt-1">
                            {new Date(msg.sentAt).toLocaleTimeString()}
                          </Text>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : isResolved ? (
              // Show chat window in read-only mode for resolved tickets
              <div className="flex flex-col h-full">
                <ChatWindow
                  ticket={ticket}
                  chatId={chatId}
                  token={session?.accessToken || ''}
                  userType="support"
                  locale={locale}
                  className="flex-1"
                  readOnly={true}
                />
                <div className="flex items-center justify-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border-t border-green-200 dark:border-green-800 text-green-700 dark:text-green-400">
                  <PiCheckCircleBold className="w-4 h-4" />
                  <Text className="text-sm font-medium">
                    {lang === 'ar' ? 'تم حل هذه التذكرة - وضع القراءة فقط' : 'This ticket is resolved - Read only mode'}
                  </Text>
                </div>
              </div>
            ) : (
              // Show live chat for active tickets
              <ChatWindow
                ticket={ticket}
                chatId={chatId}
                token={session?.accessToken || ''}
                userType="support"
                locale={locale}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

