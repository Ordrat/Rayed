"use client";

import { Title, Text, Avatar, Button, Popover } from "rizzui";
import cn from "@core/utils/class-names";
import { routes } from "@/config/routes";
import { signOut, useSession } from "next-auth/react";
import { Link } from "@/i18n/routing";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { logout } from "@/services/auth.service";
import { changeSupportStatus } from "@/services/support.service";
import { SupportStatus } from "@/types/support.types";
import toast from "react-hot-toast";

export default function ProfileMenu({
  buttonClassName,
  avatarClassName,
  username = false,
}: {
  buttonClassName?: string;
  avatarClassName?: string;
  username?: boolean;
}) {
  const { data: session } = useSession();
  const displayName = session?.user?.name || "User";
  const userEmail = session?.user?.email || "";

  return (
    <ProfileMenuPopover>
      <Popover.Trigger>
        <button
          className={cn(
            "w-9 shrink-0 rounded-full outline-none focus-visible:ring-[1.5px] focus-visible:ring-gray-400 focus-visible:ring-offset-2 active:translate-y-px sm:w-10",
            buttonClassName
          )}
        >
          <Avatar
            src="https://isomorphic-furyroad.s3.amazonaws.com/public/avatars/avatar-11.webp"
            name={displayName}
            className={cn("!h-9 w-9 sm:!h-10 sm:!w-10", avatarClassName)}
          />
          {!!username && (
            <span className="username hidden text-gray-200 dark:text-gray-700 md:inline-flex">
              Hi, {session?.user?.firstName || displayName}
            </span>
          )}
        </button>
      </Popover.Trigger>

      <Popover.Content className="z-[9999] p-0 dark:bg-gray-100 [&>svg]:dark:fill-gray-100">
        <DropdownMenu />
      </Popover.Content>
    </ProfileMenuPopover>
  );
}

function ProfileMenuPopover({ children }: React.PropsWithChildren<{}>) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <Popover
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      shadow="sm"
      placement="bottom-end"
    >
      {children}
    </Popover>
  );
}

const menuItems = [
  {
    name: "text-my-profile",
    href: routes.profile,
  },
  {
    name: "text-account-settings",
    href: routes.forms.profileSettings,
  },
  {
    name: "text-activity-log",
    href: "#",
  },
];

function DropdownMenu() {
  const t = useTranslations("common");
  const { data: session } = useSession();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      // If user is a support agent, set status to Offline before logout
      if (session?.accessToken && session?.user?.id) {
        const userRoles = session?.user?.roles || [];
        const isSupportRole = userRoles.some(
          (role) => role.toLowerCase() === 'support' || role.toLowerCase() === 'supportagent'
        );
        
        if (isSupportRole) {
          try {
            await changeSupportStatus(
              {
                supportId: session.user.id,
                status: SupportStatus.OFFLINE,
              },
              session.accessToken
            );
            console.log("Support agent status set to Offline");
          } catch (error) {
            console.error("Failed to update support status to Offline:", error);
            // Continue with logout even if status update fails
          }
        }
      }
      
      // Call backend logout API if user is authenticated
      if (session?.accessToken) {
        await logout(session.accessToken);
      }
    } catch (error) {
      console.error("Logout API error:", error);
      // Continue with local signout even if API call fails
    } finally {
      // Sign out locally - use window.location.origin to ensure redirect stays on current domain
      const callbackUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}${routes.auth.signIn}` 
        : routes.auth.signIn;
      await signOut({ callbackUrl });
      toast.success("Logged out successfully");
    }
  };

  const displayName = session?.user?.name || "User";
  const userEmail = session?.user?.email || "";

  return (
    <div className="w-64 text-left rtl:text-right">
      <div className="flex items-center border-b border-gray-300 px-6 pb-5 pt-6">
        <Avatar
          src="https://isomorphic-furyroad.s3.amazonaws.com/public/avatars/avatar-11.webp"
          name={displayName}
        />
        <div className="ms-3">
          <Title
            as="h6"
            className="font-semibold"
          >
            {displayName}
          </Title>
          <Text className="text-gray-600">{userEmail}</Text>
        </div>
      </div>
      <div className="grid px-3.5 py-3.5 font-medium text-gray-700">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="group my-0.5 flex items-center rounded-md px-2.5 py-2 hover:bg-gray-100 focus:outline-none hover:dark:bg-gray-50/50"
          >
            {t(item.name)}
          </Link>
        ))}
      </div>
      <div className="border-t border-gray-300 px-6 pb-6 pt-5">
        <Button
          className="h-auto w-full justify-start p-0 font-medium text-gray-700 outline-none focus-within:text-gray-600 hover:text-gray-900 focus-visible:ring-0"
          variant="text"
          onClick={handleSignOut}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? "Logging out..." : t("text-sign-out")}
        </Button>
      </div>
    </div>
  );
}
