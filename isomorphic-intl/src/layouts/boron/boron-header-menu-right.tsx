"use client";
import { Badge, ActionIcon } from "rizzui";
import cn from "@core/utils/class-names";
import NotificationDropdown from "@/layouts/notification-dropdown";
import ProfileMenu from "@/layouts/profile-menu";
import SettingsButton from "@/layouts/settings-button";
import { PiGearFill, PiBellRinging } from "react-icons/pi";
import { useColorPresetName } from "../settings/use-theme-color";
import LanguageSwitcher from "../language-switcher";

export default function HeaderMenuRight() {
  const { colorPresetName } = useColorPresetName();

  return (
    <div className="ms-auto flex shrink-0 items-center gap-2 text-green-700 xs:gap-3 xl:gap-5">
      <LanguageSwitcher selectClassName="shadow-none" iconClassName="text-green-900" />
      <NotificationDropdown>
        <ActionIcon
          aria-label="Notification"
          variant="text"
          className={cn(
            "relative text-green-900 hover:text-green-0 dark:text-green-700",
            colorPresetName === "black" && "hover:text-green-0 dark:hover:text-green-900"
          )}
        >
          <PiBellRinging className="h-5 w-auto xl:h-5 3xl:h-6" />
          <Badge
            renderAsDot
            color="warning"
            enableOutlineRing
            className="absolute right-2.5 top-2.5 -translate-y-1/3 translate-x-1/2"
          />
        </ActionIcon>
      </NotificationDropdown>
      <ProfileMenu
        username
        buttonClassName="w-[unset] sm:w-[unset] flex items-center gap-3 xl:ms-2 [&_.username]:!text-green-900"
        avatarClassName="!w-8 !h-8"
      />
    </div>
  );
}
