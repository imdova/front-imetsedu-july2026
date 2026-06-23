"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

interface SidebarScrollProps {
  children: React.ReactNode;
  className?: string;
}

/** Scrollable nav region with overflow fades and a thin themed scrollbar. */
export function SidebarScroll({ children, className }: SidebarScrollProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = React.useState({ top: false, bottom: false });

  const updateOverflow = React.useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const threshold = 6;
    const { scrollTop, scrollHeight, clientHeight } = el;
    setOverflow({
      top: scrollTop > threshold,
      bottom: scrollTop + clientHeight < scrollHeight - threshold,
    });
  }, []);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateOverflow();

    const observer = new ResizeObserver(updateOverflow);
    observer.observe(el);

    return () => observer.disconnect();
  }, [updateOverflow, children]);

  return (
    <div className={cn("relative min-h-0 flex-1", className)}>
      <div
        aria-hidden
        data-sidebar-fade-top
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 z-10 h-8 bg-gradient-to-b from-sidebar via-sidebar/70 to-transparent transition-opacity duration-200",
          overflow.top ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        ref={scrollRef}
        data-sidebar-scroll
        onScroll={updateOverflow}
        className="sidebar-scroll h-full overflow-x-hidden overflow-y-auto overscroll-y-contain scroll-smooth pe-1 scrollbar-thin [scrollbar-gutter:stable]"
      >
        {children}
      </div>
      <div
        aria-hidden
        data-sidebar-fade-bottom
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 z-10 h-8 bg-gradient-to-t from-sidebar via-sidebar/70 to-transparent transition-opacity duration-200",
          overflow.bottom ? "opacity-100" : "opacity-0",
        )}
      />
    </div>
  );
}
