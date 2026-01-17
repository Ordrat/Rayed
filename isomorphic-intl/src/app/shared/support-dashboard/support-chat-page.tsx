"use client";

/**
 * Live Chat Page (Support Agent)
 * Full chat interface for support agents
 */

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { Title, Text, Button, Loader, Badge } from "rizzui";
import { PiArrowLeftBold, PiCheckCircleBold, PiXCircleBold } from "react-icons/pi";
import { Link } from "@/i18n/routing";
import { routes } from "@/config/routes";
import { getSupportTicketById, closeSupportTicket, updateSupportTicket } from "@/services/support-ticket.service";
import { SupportTicket } from "@/types/support-ticket.types";
import { TicketStatus, TicketStatusLabels, TicketCategoryLabels } from "@/types/firebase.enums";
import { ChatWindow } from "@/app/shared/support/chat";
import { TicketActionsPanel } from "@/app/shared/support/ticket-actions-panel";
import { CloseTicketModal } from "@/app/shared/support/close-ticket-modal";
import toast from "react-hot-toast";
import { useRouter } from "@/i18n/routing";
import { useLocale } from "next-intl";

export default function SupportChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const locale = useLocale();
  const lang = locale === "ar" ? "ar" : "en";
  const ticketId = params.ticketId as string;

  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && ticketId) {
      fetchTicket();
    } else if (status === "unauthenticated") {
      router.push(routes.auth.signIn);
    }
  }, [session, status, ticketId, router]);

  const fetchTicket = async () => {
    try {
      setIsLoading(true);
      const data = await getSupportTicketById(ticketId, session?.accessToken || "");
      setTicket(data);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch ticket");
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
        session?.accessToken || "",
      );
      setTicket(updated);
      toast.success(lang === "ar" ? "تم وضع علامة محلولة" : "Marked as resolved");
      router.push(routes.supportDashboard.tickets);
    } catch (error: any) {
      toast.error(error.message || "Failed to update ticket");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOpenCloseModal = () => {
    setIsCloseModalOpen(true);
  };

  const handleCloseTicket = async (data: {
    closureNotes: string;
    archiveMessages: boolean;
    deleteFirebaseChat: boolean;
  }) => {
    setIsUpdating(true);
    try {
      const updated = await closeSupportTicket(
        ticketId,
        {
          archiveMessages: data.archiveMessages,
          deleteFirebaseChat: data.deleteFirebaseChat,
          closureNotes: data.closureNotes,
        },
        session?.accessToken || "",
      );
      setTicket(updated);
      setIsCloseModalOpen(false);
      toast.success(lang === "ar" ? "تم إغلاق التذكرة" : "Ticket closed");
      router.push(routes.supportDashboard.tickets);
    } catch (error: any) {
      console.error("[Support] Close ticket error:", error);
      const errorMessage = error?.message || error?.data?.error || "Failed to close ticket";
      toast.error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader variant="spinner" size="xl" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <Text className="mb-4 text-gray-500">{lang === "ar" ? "لم يتم العثور على التذكرة" : "Ticket not found"}</Text>
        <Link href={routes.supportDashboard.tickets}>
          <Button variant="outline">
            <PiArrowLeftBold className="me-2 h-4 w-4" />
            {lang === "ar" ? "العودة" : "Go Back"}
          </Button>
        </Link>
      </div>
    );
  }

  // ChatId format: ticket_{ticketId without dashes} - must match Firebase format
  const chatId = `ticket_${ticket.id.replace(/-/g, "")}`;
  const isClosed = ticket.status === TicketStatus.Closed;
  const isResolved = ticket.status === TicketStatus.Resolved;

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] gap-4">
      {/* Sleek Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm shrink-0">
        <div className="flex items-center gap-4">
          <Link href={routes.supportDashboard.tickets} className="shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="w-9 h-9 p-0 rounded-full border-gray-200 hover:border-primary hover:text-primary transition-colors"
            >
              <PiArrowLeftBold className="h-4 w-4" />
            </Button>
          </Link>

          <div className="h-8 w-[1px] bg-gray-200 dark:bg-gray-700 mx-1 hidden md:block"></div>

          <div>
            <div className="flex items-center gap-3">
              <Title as="h5" className="font-bold text-gray-900 dark:text-gray-50 text-base md:text-lg">
                {ticket.subject}
              </Title>
              <Badge size="sm" variant="flat" color={isClosed ? "secondary" : isResolved ? "success" : "warning"}>
                {TicketStatusLabels[ticket.status]?.[lang]}
              </Badge>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" size="sm" className="font-mono text-xs text-gray-400">
                #{ticket.ticketNumber}
              </Badge>
              <span className="text-gray-300">•</span>
              <Text className="text-xs text-gray-500 font-medium bg-gray-100 dark:bg-gray-700/50 px-2 py-0.5 rounded-md">
                {TicketCategoryLabels[ticket.category]?.[lang]}
              </Text>
            </div>
          </div>
        </div>

        {/* Actions Toolbar */}
        {!isClosed && (
          <div className="flex items-center gap-3">
            {!isResolved && (
              <Button
                variant="outline"
                onClick={handleMarkResolved}
                isLoading={isUpdating}
                className="gap-2 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 hover:text-green-800 transition-all dark:border-green-800 dark:text-green-400 dark:hover:bg-green-900/20"
              >
                <PiCheckCircleBold className="h-4 w-4" />
                {lang === "ar" ? "تم الحل" : "Mark Resolved"}
              </Button>
            )}
            <Button
              onClick={handleOpenCloseModal}
              disabled={isUpdating}
              className="gap-2 bg-gray-900 hover:bg-gray-800 text-white dark:bg-gray-700 dark:hover:bg-gray-600 shadow-sm"
            >
              <PiXCircleBold className="h-4 w-4" />
              {lang === "ar" ? "إغلاق التذكرة" : "Close Ticket"}
            </Button>
          </div>
        )}
      </div>

      {/* Main Content Area - Full height grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-0">
        {/* Chat Section - Takes up more space */}
        <div className="lg:col-span-8 flex flex-col min-h-0 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          {isClosed || isResolved ? (
            <div className="flex-1 flex flex-col">
              {/* Show chat history in read-only mode */}
              <ChatWindow
                ticket={ticket}
                chatId={chatId}
                token={session?.accessToken || ""}
                userType="support"
                locale={locale}
                className="h-full border-none"
                readOnly={true}
              />
              {/* Read-only notice at the bottom */}
              <div className="flex items-center justify-center gap-2 p-3 bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 text-gray-500">
                {isClosed ? (
                  <>
                    <PiXCircleBold className="w-4 h-4" />
                    <Text className="text-sm">
                      {lang === "ar"
                        ? "هذه التذكرة مغلقة - لا يمكن إرسال رسائل جديدة"
                        : "This ticket is closed - no new messages can be sent"}
                    </Text>
                  </>
                ) : (
                  <>
                    <PiCheckCircleBold className="w-4 h-4 text-green-500" />
                    <Text className="text-sm">
                      {lang === "ar"
                        ? "تم حل هذه التذكرة - لا يمكن إرسال رسائل جديدة"
                        : "This ticket is resolved - no new messages can be sent"}
                    </Text>
                  </>
                )}
              </div>
            </div>
          ) : (
            <ChatWindow
              ticket={ticket}
              chatId={chatId}
              token={session?.accessToken || ""}
              userType="support"
              locale={locale}
              className="h-full border-none"
            />
          )}
        </div>

        {/* Actions Panel - Fixed sidebar on large screens */}
        <div className="lg:col-span-4 flex flex-col min-h-0">
          <TicketActionsPanel
            ticketId={ticket.id}
            token={session?.accessToken || ""}
            locale={locale}
            isClosed={isClosed || isResolved}
          />
        </div>
      </div>

      {/* Close Ticket Modal */}
      <CloseTicketModal
        isOpen={isCloseModalOpen}
        onClose={() => setIsCloseModalOpen(false)}
        onConfirm={handleCloseTicket}
        isLoading={isUpdating}
        locale={locale}
      />
    </div>
  );
}
