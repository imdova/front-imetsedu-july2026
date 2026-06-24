"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface CourseNavItem { id: string; label: string }

/**
 * Sticky in-page section navigation with scroll-spy. Horizontally scrollable on
 * mobile; the active section (closest to the top) is highlighted, and clicks
 * smooth-scroll to the section. Pairs with `scroll-mt-*` on each section.
 */
export function CourseSectionNav({ items, className }: { items: CourseNavItem[]; className?: string }) {
  const [active, setActive] = React.useState(items[0]?.id);

  React.useEffect(() => {
    const els = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => !!el);
    if (!els.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-25% 0px -65% 0px", threshold: 0 },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [items]);

  const go = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav
      aria-label="Course sections"
      className={cn(
        "flex gap-1 overflow-x-auto border-b border-border/70 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      {items.map((i) => (
        <a
          key={i.id}
          href={`#${i.id}`}
          onClick={(e) => go(e, i.id)}
          aria-current={active === i.id ? "true" : undefined}
          className={cn(
            "-mb-px whitespace-nowrap border-b-2 px-3.5 py-3 text-sm font-medium transition-colors",
            active === i.id
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          {i.label}
        </a>
      ))}
    </nav>
  );
}
