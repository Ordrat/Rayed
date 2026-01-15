"use client";

import SAFlagIcon from "@core/components/icons/language/SAFlag";
import USFlagIcon from "@core/components/icons/language/USFlag";
import { Select } from "rizzui";
import cn from "@core/utils/class-names";
import { useLocale } from "next-intl";
import { JSX, useEffect, useState, useTransition } from "react";
import { Locale, usePathname, useRouter } from "@/i18n/routing";

type LocaleOptionsType = {
  label: string;
  value: Locale;
  icon: ({ ...props }: React.SVGProps<SVGSVGElement>) => JSX.Element;
};

const localeOptions: LocaleOptionsType[] = [
  {
    label: "English - EN",
    value: "en",
    icon: USFlagIcon,
  },
  {
    label: "عربى - AR",
    value: "ar",
    icon: SAFlagIcon,
  },
];

export default function LanguageSwitcher({
  className,
  iconClassName,
  selectClassName,
}: {
  className?: string;
  iconClassName?: string;
  selectClassName?: string;
}) {
  const router = useRouter();
  const locale = useLocale();
  const pathname = usePathname();
  const [_, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);
  const [selected, setSelected] = useState<LocaleOptionsType>(localeOptions[0]);

  useEffect(() => {
    const selectedLocale = localeOptions.find((item) => item.value.toLowerCase() === locale.toLowerCase());
    if (selectedLocale) {
      setSelected(selectedLocale);
    }
    setMounted(true);
  }, [locale]);

  function handleChange(op: LocaleOptionsType) {
    setSelected(op);
    startTransition(() => {
      router.replace(`${pathname}`, { locale: op.value });
    });
  }

  // Show a placeholder during SSR to avoid hydration mismatch
  if (!mounted) {
    return (
      <div
        className={cn(
          "flex items-center justify-center h-[34px] w-[34px] md:h-9 md:w-9 rounded-full shadow backdrop-blur-md dark:bg-gray-100",
          className
        )}
      >
        <USFlagIcon className="size-5" />
      </div>
    );
  }

  // Use different placement based on locale direction
  const placement = locale === "ar" ? "bottom-start" : "bottom-end";

  return (
    <Select
      size="sm"
      value={selected}
      className={cn("w-auto", className)}
      placement={placement}
      onChange={handleChange}
      options={localeOptions}
      dropdownClassName="w-44 p-2 !z-[99999] shadow-xl rounded-xl border-gray-100 dark:border-gray-800"
      suffixClassName={cn("!size-3", iconClassName)}
      selectClassName={cn(
        "w-auto h-[34px] md:h-9 ring-0 border-none shadow-sm bg-white hover:bg-gray-50 dark:bg-gray-100/50 dark:hover:bg-gray-100 transition-colors",
        selectClassName
      )}
      displayValue={(op: LocaleOptionsType) => renderDisplayValue(op)}
      getOptionDisplayValue={(op: LocaleOptionsType) => renderOptionDisplayValue(op)}
    />
  );
}

function renderDisplayValue(op: LocaleOptionsType) {
  const Icon = op.icon;
  return <>{Icon && <Icon className="size-5" />}</>;
}

function renderOptionDisplayValue(op: LocaleOptionsType) {
  const Icon = op.icon;
  return (
    <div className="flex items-center gap-3">
      {Icon && <Icon className="size-5" />}
      <span>{op.label}</span>
    </div>
  );
}
