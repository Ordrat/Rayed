"use client";

import cn from "@core/utils/class-names";
import { useWindowScroll } from "@core/hooks/use-window-scroll";

type StickyHeaderProps = {
  className?: string;
  offset?: number;
};

export default function StickyHeader({
  offset = 2,
  className,
  children,
}: React.PropsWithChildren<StickyHeaderProps>) {
  const windowScroll = useWindowScroll();
  // React 19 handles hydration properly - no mount check needed
  const scrollY = (windowScroll.y ?? 0) as number;

  return (
    <header
      className={cn(
        "sticky top-0 z-[9999] flex items-center bg-gray-0/80 p-4 backdrop-blur-xl dark:bg-gray-50/50 md:px-5 lg:px-6",
        scrollY > offset ? "card-shadow" : "",
        className
      )}
    >
      {children}
    </header>
  );
}
