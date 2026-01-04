"use client";

import { Link } from "@/i18n/routing";
import cn from "@core/utils/class-names";
import { SidebarMenu } from "./sidebar-menu";
import Image from "next/image";
import { siteConfig } from "@/config/site.config";

export default function Sidebar({ className }: { className?: string }) {
  return (
    <aside
      className={cn(
        "fixed bottom-0 start-0 z-50 h-full w-[270px] border-e-2 border-gray-100 bg-white dark:bg-gray-100/50 2xl:w-72",
        className
      )}
    >
      <div className="sticky top-0 z-40 bg-gray-0/10 px-6 pb-5 pt-5 dark:bg-gray-100/5 2xl:px-8 2xl:pt-6">
        <Link
          href={"/"}
          aria-label="Site Logo"
          className="flex text-gray-800 hover:text-gray-900"
        >
          <Image
            src={siteConfig.logo}
            alt={siteConfig.title}
            className="h-25 w-25"
            priority
          />
        </Link>
      </div>

      <div className="custom-scrollbar overflow-y-auto scroll-smooth h-full">
        <SidebarMenu />
      </div>
    </aside>
  );
}
