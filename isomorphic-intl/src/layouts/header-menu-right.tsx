"use client";

import { Badge } from "rizzui/badge";
import { ActionIcon } from "rizzui/action-icon";
import ProfileMenu from "@/layouts/profile-menu";
import SettingsButton from "@/layouts/settings-button";
import RingBellSolidIcon from "@core/components/icons/ring-bell-solid";
import NotificationDropdown from "./notification-dropdown";
import LanguageSwitcher from "./language-switcher";
import { useFirebaseNotifications } from "@/hooks/use-firebase-notifications";

export default function HeaderMenuRight() {
  const { unreadCount } = useFirebaseNotifications();

  return (
    <div className="ms-auto flex shrink-0 items-center gap-2 xs:gap-3 xl:gap-4" dir="ltr">
      <LanguageSwitcher />

      <div className="flex items-center gap-2 text-gray-700 xs:gap-3 xl:gap-4">
        <NotificationDropdown>
          <ActionIcon
            aria-label="Notification"
            variant="text"
            className="relative h-[34px] w-[34px] shadow backdrop-blur-md dark:bg-gray-100 md:h-9 md:w-9"
          >
            <RingBellSolidIcon className="h-[18px] w-auto" />
            {unreadCount > 0 && (
              <Badge
                renderAsDot
                color="warning"
                enableOutlineRing
                className="absolute right-2.5 top-2.5 -translate-y-1/3 translate-x-1/2"
              />
            )}
          </ActionIcon>
        </NotificationDropdown>

        <SettingsButton />
        <ProfileMenu />
      </div>
    </div>
  );
}
