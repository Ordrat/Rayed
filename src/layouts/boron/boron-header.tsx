"use client";

import { Link } from "@/i18n/routing";
import HamburgerButton from "@/layouts/hamburger-button";
import BoronSidebar from "@/layouts/boron/boron-sidebar";
import HeaderMenuRight from "@/layouts/boron/boron-header-menu-right";
import StickyHeader from "@/layouts/sticky-header";
import cn from "@core/utils/class-names";
import { useTheme } from "next-themes";
import { useColorPresetName } from "../settings/use-theme-color";
import SearchWidget from "@/app/shared/search/search";
import Image from "next/image";
import { siteConfig } from "@/config/site.config";

export default function BoronHeader() {
  const { theme } = useTheme();
  const { colorPresetName } = useColorPresetName();

  return (
    <StickyHeader className="fixed start-0 top-0 z-[990] w-full bg-white dark:bg-gray-100/50 dark:backdrop-blur-3xl 2xl:py-5 3xl:px-8 4xl:px-10">
      <div className="flex w-full max-w-2xl items-center">
        <HamburgerButton
          className="text-gray-900 dark:text-gray-600 hover:text-gray-800"
          view={<BoronSidebar className="static w-full 2xl:w-full" />}
        />
        <Link
          href={"/"}
          aria-label="Site Logo"
          className="me-4 w-9 shrink-0 text-gray-900 hover:text-gray-800 lg:me-5 xl:hidden"
        >
          <Image
            src={siteConfig.logo}
            alt={siteConfig.title}
            className="h-8 w-auto"
            priority
          />
        </Link>
        <div className="hidden w-[270px] xl:inline-block 2xl:w-72">
          <Link
            href={"/"}
            aria-label="Site Logo"
            className="w-[155px] text-gray-900 hover:text-gray-800"
          >
            <Image
              src={siteConfig.logo}
              alt={siteConfig.title}
              className="max-w-[155px] h-auto"
              priority
            />
          </Link>
        </div>

        <SearchWidget
          className={cn(
            "text-gray-900 xl:border-green-700 xl:outline-green-700 xl:hover:border-green-200 xl:hover:outline-green-800 dark:xl:border-green-800 dark:xl:outline-green-800 dark:xl:hover:border-green-900 dark:xl:hover:outline-green-900 [&_.magnifying-glass]:text-green-700 dark:[&_.magnifying-glass]:text-green-800",
            colorPresetName === "black" &&
              theme === "light" &&
              "[&_.search-command]:bg-green-0 [&_.search-command]:text-green-900"
          )}
          placeholderClassName="group-hover:text-green-800 duration-150 dark:group-hover:text-green-800 text-green-800 dark:text-green-800"
        />
      </div>

      <HeaderMenuRight />
    </StickyHeader>
  );
}
