"use client";

/**
 * Notification Dropdown
 * Shows Firebase notifications for support agents
 * Uses existing monorepo UI patterns
 */

import { Link } from "@/i18n/routing";
import { useMedia } from "@core/hooks/use-media";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { ReactElement, RefObject, useState, useCallback } from "react";
import { PiArrowsClockwiseBold, PiCheck, PiBellSimple, PiChatCircleText, PiTicket, PiUserCircle } from "react-icons/pi";
import { Badge, Checkbox, Popover, Text, Title, Loader } from "rizzui";
import { useFirebaseNotifications } from "@/hooks/use-firebase-notifications";
import { FirebaseNotification } from "@/types/firebase-chat.types";
import { routes } from "@/config/routes";
import { useLocale } from "next-intl";

dayjs.extend(relativeTime);

// Get icon based on notification type
function getNotificationIcon(notification: FirebaseNotification) {
  const data = notification.data as Record<string, any> | undefined;
  const type = data?.type || 'default';
  
  switch (type) {
    case 'new_ticket':
    case 'ticket_assigned':
    case 'ticket_closed':
    case 'ticket_resolved':
      return <PiTicket className="h-5 w-5 text-primary" />;
    case 'new_message':
      return <PiChatCircleText className="h-5 w-5 text-blue-500" />;
    default:
      return <PiBellSimple className="h-5 w-5 text-gray-500" />;
  }
}

// Get link based on notification type
function getNotificationLink(notification: FirebaseNotification): string {
  const data = notification.data as Record<string, any> | undefined;
  const ticketId = data?.ticketId;
  
  if (ticketId) {
    return routes.supportDashboard.chat(ticketId);
  }
  return '#';
}

function NotificationsList({
  setIsOpen,
}: {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const locale = useLocale();
  const lang = locale === 'ar' ? 'ar' : 'en';
  const { notifications, isLoading, markAsRead, markAllAsRead, unreadCount, error, refresh, reRegisterFcm } = useFirebaseNotifications();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Also re-register FCM token on manual refresh to ensure backend has it
      await reRegisterFcm();
      await refresh();
    } finally {
      setIsRefreshing(false);
    }
  }, [reRegisterFcm, refresh]);

  const handleMarkAllAsRead = useCallback(() => {
    markAllAsRead();
  }, [markAllAsRead]);

  const handleNotificationClick = useCallback((notification: FirebaseNotification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    setIsOpen(false);
  }, [markAsRead, setIsOpen]);

  if (isLoading) {
    return (
      <div className="w-[320px] sm:w-[360px] 2xl:w-[420px] flex items-center justify-center py-12">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="w-[320px] text-left sm:w-[360px] 2xl:w-[420px] rtl:text-right">
      <div className="mb-3 flex items-center justify-between ps-6">
        <Title as="h5" fontWeight="semibold">
          {lang === 'ar' ? 'الإشعارات' : 'Notifications'}
          {unreadCount > 0 && (
            <Badge size="sm" color="primary" className="ms-2">
              {unreadCount}
            </Badge>
          )}
        </Title>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`text-sm text-gray-500 hover:text-primary transition-transform ${isRefreshing ? 'animate-spin' : ''}`}
            title={lang === 'ar' ? 'تحديث' : 'Refresh'}
          >
            <PiArrowsClockwiseBold className="h-4 w-4" />
          </button>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-sm text-primary hover:underline"
            >
              {lang === 'ar' ? 'تحديد الكل كمقروء' : 'Mark all as read'}
            </button>
          )}
        </div>
      </div>
      
      {error && (
        <div className="mx-4 mb-3 rounded-md bg-red-50 p-2 text-center text-sm text-red-600">
          {lang === 'ar' ? 'فشل تحميل الإشعارات' : 'Failed to load notifications'}
          <button onClick={handleRefresh} className="ms-2 underline">
            {lang === 'ar' ? 'إعادة المحاولة' : 'Retry'}
          </button>
        </div>
      )}
      
      <div className="custom-scrollbar overflow-y-auto scroll-smooth max-h-[420px]">
        {notifications.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <PiBellSimple className="mx-auto h-12 w-12 mb-2 opacity-50" />
            <Text>{lang === 'ar' ? 'لا توجد إشعارات' : 'No notifications'}</Text>
          </div>
        ) : (
          <div className="grid cursor-pointer grid-cols-1 gap-1 ps-4">
            {notifications.map((item) => (
              <Link
                key={item.id}
                href={getNotificationLink(item)}
                onClick={() => handleNotificationClick(item)}
                className="group grid grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-md px-2 py-2 pe-3 transition-colors hover:bg-gray-100 dark:hover:bg-gray-50"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded bg-gray-100/70 dark:bg-gray-50/50">
                  {getNotificationIcon(item)}
                </div>
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center">
                  <div className="w-full">
                    <Text className="mb-0.5 w-11/12 truncate text-sm font-semibold text-gray-900 dark:text-gray-700">
                      {item.title}
                    </Text>
                    <Text className="text-xs text-gray-500 truncate">
                      {item.body}
                    </Text>
                    <Text className="ms-auto whitespace-nowrap text-xs text-gray-400 mt-1">
                      {dayjs(item.createdAt).fromNow(true)}
                    </Text>
                  </div>
                  <div className="ms-auto flex-shrink-0">
                    {!item.isRead ? (
                      <Badge
                        renderAsDot
                        size="lg"
                        color="primary"
                        className="scale-90"
                      />
                    ) : (
                      <span className="inline-block rounded-full bg-gray-100 p-0.5 dark:bg-gray-50">
                        <PiCheck className="h-auto w-[9px]" />
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      {notifications.length > 0 && (
        <Link
          href={routes.supportDashboard.home}
          onClick={() => setIsOpen(false)}
          className="-me-6 block px-6 pb-0.5 pt-3 text-center hover:underline"
        >
          {lang === 'ar' ? 'عرض كل النشاط' : 'View All Activity'}
        </Link>
      )}
    </div>
  );
}

export default function NotificationDropdown({
  children,
}: {
  children: ReactElement & { ref?: RefObject<any> };
}) {
  const isMobile = useMedia("(max-width: 480px)", false);
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <Popover
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      shadow="sm"
      placement={isMobile ? "bottom" : "bottom-end"}
    >
      <Popover.Trigger>{children}</Popover.Trigger>
      <Popover.Content className="z-[9999] px-0 pb-4 pe-6 pt-5 dark:bg-gray-100 [&>svg]:hidden [&>svg]:dark:fill-gray-100 sm:[&>svg]:inline-flex">
        <NotificationsList setIsOpen={setIsOpen} />
      </Popover.Content>
    </Popover>
  );
}
