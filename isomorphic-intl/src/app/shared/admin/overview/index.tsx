"use client";

import React from "react";
import { routes } from "@/config/routes";
import { Title, Text } from "rizzui";
import cn from "@core/utils/class-names";
import { Link } from "@/i18n/routing";
import {
  PiHeadset,
  PiTicket,
  PiCar,
  PiStorefront,
  PiShoppingBag,
  PiPackage,
  PiChatCircleDots,
  PiArrowRight,
  PiArrowLeft,
  PiBuildings,
} from "react-icons/pi";
import { useTranslations, useLocale } from "next-intl";

const overviewItems = [
  {
    title: "sidebar-menu-support-agents",
    description: "overview-support-agents-desc",
    icon: PiHeadset,
    href: routes.support.agents,
    gradient: "from-blue-500 to-blue-600",
    bgLight: "bg-blue-50",
    iconBg: "bg-blue-500",
  },
  {
    title: "sidebar-menu-support-tickets",
    description: "overview-support-tickets-desc",
    icon: PiTicket,
    href: routes.support.tickets,
    gradient: "from-amber-500 to-orange-500",
    bgLight: "bg-amber-50",
    iconBg: "bg-amber-500",
  },
  {
    title: "sidebar-menu-drivers",
    description: "overview-drivers-desc",
    icon: PiCar,
    href: routes.drivers.list,
    gradient: "from-emerald-500 to-teal-500",
    bgLight: "bg-emerald-50",
    iconBg: "bg-emerald-500",
  },
  {
    title: "sidebar-menu-sellers",
    description: "overview-sellers-desc",
    icon: PiStorefront,
    href: routes.sellers.list,
    gradient: "from-orange-500 to-red-500",
    bgLight: "bg-orange-50",
    iconBg: "bg-orange-500",
  },
  {
    title: "sidebar-menu-branches",
    description: "overview-branches-desc",
    icon: PiBuildings,
    href: routes.branches.list,
    gradient: "from-indigo-500 to-purple-500",
    bgLight: "bg-indigo-50",
    iconBg: "bg-indigo-500",
  },
  {
    title: "sidebar-menu-shop-hub",
    description: "overview-shop-hub-desc",
    icon: PiShoppingBag,
    href: routes.shop.hub,
    gradient: "from-pink-500 to-rose-500",
    bgLight: "bg-pink-50",
    iconBg: "bg-pink-500",
  },
  {
    title: "sidebar-menu-products",
    description: "overview-products-desc",
    icon: PiPackage,
    href: routes.products.list,
    gradient: "from-cyan-500 to-blue-500",
    bgLight: "bg-cyan-50",
    iconBg: "bg-cyan-500",
  },
  {
    title: "sidebar-menu-my-tickets",
    description: "overview-my-tickets-desc",
    icon: PiChatCircleDots,
    href: routes.supportDashboard.tickets,
    gradient: "from-violet-500 to-purple-500",
    bgLight: "bg-violet-50",
    iconBg: "bg-violet-500",
  },
];

export default function OverviewPage() {
  const t = useTranslations("layout");
  const locale = useLocale();
  const isRTL = locale === "ar";
  const ArrowIcon = isRTL ? PiArrowLeft : PiArrowRight;
  return (
    <div className="@container">
      {/* Header Section */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-1 rounded-full bg-gradient-to-b from-primary to-primary/60" />
          <Title as="h2" className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {t("sidebar-menu-welcome")}, Admin
          </Title>
        </div>
        <Text className="ms-5 text-gray-500 dark:text-gray-400">{t("overview-welcome-message")}</Text>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {overviewItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.title}
              href={item.href}
              className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              {/* Gradient overlay on hover */}
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-[0.03]",
                  item.gradient
                )}
              />

              {/* Card Content */}
              <div className="relative z-10 p-6">
                {/* Icon */}
                <div
                  className={cn(
                    "mb-5 flex h-14 w-14 items-center justify-center rounded-xl shadow-lg transition-transform duration-300 group-hover:scale-110",
                    item.iconBg
                  )}
                >
                  <Icon className="h-7 w-7 text-white" />
                </div>

                {/* Title */}
                <Title
                  as="h4"
                  className="mb-2 text-lg font-semibold text-gray-900 dark:text-white transition-colors group-hover:text-primary"
                >
                  {t(item.title)}
                </Title>

                {/* Description */}
                <Text className="mb-6 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">{t(item.description)}</Text>

                {/* Footer with Arrow */}
                <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-4">
                  <span className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    Manage
                  </span>
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300",
                      "bg-gray-100 dark:bg-gray-800",
                      "group-hover:bg-gradient-to-br group-hover:text-white",
                      item.gradient
                    )}
                  >
                    <ArrowIcon className={cn(
                      "h-4 w-4 transition-transform",
                      isRTL ? "group-hover:-translate-x-0.5" : "group-hover:translate-x-0.5"
                    )} />
                  </div>
                </div>
              </div>

              {/* Decorative corner element */}
              <div
                className={cn(
                  "absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br opacity-10 blur-2xl transition-opacity duration-300 group-hover:opacity-20",
                  item.gradient
                )}
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
