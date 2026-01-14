"use client";

import { Link } from "@/i18n/routing";
import { Fragment } from "react";
import { usePathname } from "next/navigation";
import { Title, Collapse } from "rizzui";
import cn from "@core/utils/class-names";
import { PiCommand, PiCaretDownBold } from "react-icons/pi";
import { menuItems } from "@/layouts/boron/boron-menu-items";
import { useBoronKbdShortcuts } from "@/layouts/boron/boron-utils";
import { useLocale, useTranslations } from "next-intl";

export function BoronSidebarMenu() {
  const pathname = usePathname();
  const t = useTranslations("layout");
  const locale = useLocale();

  useBoronKbdShortcuts();

  return (
    <div className="mt-4 pb-3 2xl:pt-1.5 3xl:mt-6">
      {menuItems.map((item, index) => {
        const Icon = item.icon;
        const url = item?.href === "/" ? `/${locale}` : `/${locale}${item?.href}`;
        const isActive =
          pathname === url ||
          (pathname.startsWith(url + "/") && item?.href !== "/");

        // Check if item has dropdown items
        const hasDropdown = item.dropdownItems && item.dropdownItems.length > 0;
        
        // Check if any dropdown item is active
        const isDropdownActive = hasDropdown && item.dropdownItems?.some((dropdownItem) => {
          const dropdownUrl = `/${locale}${dropdownItem.href}`;
          return pathname === dropdownUrl || pathname.startsWith(dropdownUrl + "/");
        });

        return (
          <Fragment key={item.name + "-" + index}>
            {item?.href ? (
              <>
                <Link
                  href={item?.href ?? "/"}
                  className={cn(
                    "group relative mx-3 my-0.5 flex items-center justify-between rounded-md px-3 py-2 font-medium capitalize lg:my-1 2xl:mx-5 2xl:my-2",
                    isActive
                      ? "bg-[#1f502a] text-gray-0"
                      : "text-gray-700 transition-colors duration-200 hover:bg-[#1f502a] hover:text-gray-0 dark:text-gray-700/90"
                  )}
                >
                  <div className="flex w-full items-center truncate">
                    {Icon && (
                      <span
                        className={cn(
                          "me-2 inline-flex h-5 w-5 items-center justify-center rounded-md duration-200 [&>svg]:h-[20px] [&>svg]:w-[20px]",
                          isActive
                            ? "text-gray-0"
                            : "text-gray-800 group-hover:text-gray-0 dark:text-gray-500 dark:group-hover:text-gray-0"
                        )}
                      >
                        <Icon />
                      </span>
                    )}
                    <span className="truncate">{t(item.name)}</span>
                    {"shortcut" in item && item.shortcut && (item as any).shortcut?.key && (
                      <span
                        className={cn(
                          "ms-auto hidden items-center gap-1 rounded px-1 duration-200 xl:inline-flex",
                          isActive
                            ? "bg-gray-100/30 dark:bg-gray-0/20"
                            : "bg-gray-100 group-hover:bg-gray-300"
                        )}
                      >
                        <kbd>
                          <PiCommand
                            strokeWidth={1.3}
                            className="h-[15px] w-[15px]"
                          />
                        </kbd>
                        <kbd>{(item as any).shortcut.key}</kbd>
                      </span>
                    )}
                  </div>
                </Link>
              </>
            ) : hasDropdown ? (
              <Collapse
                defaultOpen={isDropdownActive}
                className="mx-3 my-0.5 2xl:mx-5"
                header={({ open, toggle }) => (
                  <div
                    onClick={toggle}
                    className={cn(
                      "group relative flex cursor-pointer items-center justify-between rounded-md px-3 py-2 font-medium capitalize duration-200 lg:my-1 2xl:my-2",
                      isDropdownActive
                        ? "bg-[#1f502a] text-gray-0"
                        : "text-gray-700 transition-colors duration-200 hover:bg-[#1f502a] hover:text-gray-0 dark:text-gray-700/90"
                    )}
                  >
                    <div className="flex items-center truncate">
                      {Icon && (
                        <span
                          className={cn(
                            "me-2 inline-flex h-5 w-5 items-center justify-center rounded-md duration-200 [&>svg]:h-[20px] [&>svg]:w-[20px]",
                            isDropdownActive
                              ? "text-gray-0"
                              : "text-gray-800 group-hover:text-gray-0 dark:text-gray-500 dark:group-hover:text-gray-0"
                          )}
                        >
                          <Icon />
                        </span>
                      )}
                      <span className="truncate">{t(item.name)}</span>
                    </div>
                    <PiCaretDownBold
                      strokeWidth={3}
                      className={cn(
                        "h-3.5 w-3.5 -rotate-90 transition-transform duration-200 rtl:rotate-90",
                        open && "rotate-0 rtl:rotate-0"
                      )}
                    />
                  </div>
                )}
              >
                {item.dropdownItems?.map((dropdownItem, dropdownIndex) => {
                  const dropdownUrl = `/${locale}${dropdownItem.href}`;
                  const isDropdownItemActive = pathname === dropdownUrl || pathname.startsWith(dropdownUrl + "/");
                  
                  return (
                    <Link
                      key={dropdownItem.name + "-" + dropdownIndex}
                      href={dropdownItem.href}
                      className={cn(
                        "mb-0.5 flex items-center rounded-md py-2 pl-10 pr-3 font-medium capitalize duration-200",
                        isDropdownItemActive
                          ? "text-[#1f502a] dark:text-[#1f502a]"
                          : "text-gray-500 hover:text-[#1f502a] dark:text-gray-400"
                      )}
                    >
                      <span
                        className={cn(
                          "me-2 inline-flex h-1 w-1 rounded-full bg-current transition-all duration-200",
                          isDropdownItemActive
                            ? "bg-[#1f502a] ring-[1px] ring-[#1f502a]"
                            : "opacity-40"
                        )}
                      />
                      <span className="truncate">{t(dropdownItem.name)}</span>
                    </Link>
                  );
                })}
              </Collapse>
            ) : (
              <Title
                as="h6"
                className={cn(
                  "mx-6 mb-2 truncate text-xs font-normal uppercase tracking-widest text-gray-500 2xl:mx-8",
                  index !== 0 && "mt-6 border-t border-gray-100 pt-6 2xl:pt-8 3xl:mt-7"
                )}
              >
                {t(item.name)}
              </Title>
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
