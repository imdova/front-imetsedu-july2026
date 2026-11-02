"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

interface Scroll {
  prev: boolean;
  next: boolean;
  pages: number;
  page: number;
}
const IDLE: Scroll = { prev: false, next: false, pages: 1, page: 0 };

/**
 * Horizontal, scroll-snapping strip with arrows and page dots.
 *
 * The cards are server-rendered and passed in as children; this only owns the
 * scrolling. Arrows and dots appear only when the cards actually overflow, so a
 * handful of categories shows a plain row with no dead controls. It reads
 * `scrollLeft` as an absolute value and flips the scroll direction from the
 * computed `direction`, because browsers report it as negative in RTL — in
 * Arabic "next" still means "further along the reading direction".
 */
export function CategoryCarousel({
  children,
  label,
  prevLabel,
  nextLabel,
}: {
  children: React.ReactNode;
  label: string;
  prevLabel: string;
  nextLabel: string;
}) {
  const ref = React.useRef<HTMLUListElement>(null);
  const [s, setS] = React.useState<Scroll>(IDLE);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Runs from the observer / scroll callbacks only — never synchronously here.
    const measure = () => {
      const max = el.scrollWidth - el.clientWidth;
      const pos = Math.abs(el.scrollLeft);
      const pages = max > 1 ? Math.ceil(el.scrollWidth / el.clientWidth) : 1;
      const next: Scroll = {
        prev: pos > 1,
        next: pos < max - 1,
        pages,
        page: Math.min(pages - 1, Math.round(pos / el.clientWidth)),
      };
      setS((p) => (p.prev === next.prev && p.next === next.next && p.pages === next.pages && p.page === next.page ? p : next));
    };
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    el.addEventListener("scroll", measure, { passive: true });
    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", measure);
    };
  }, []);

  const go = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const rtl = getComputedStyle(el).direction === "rtl";
    el.scrollBy({ left: dir * (rtl ? -1 : 1) * el.clientWidth * 0.8, behavior: "smooth" });
  };

  const arrow = "absolute top-[38%] z-10 hidden size-9 -translate-y-1/2 place-items-center rounded-full border border-slate-200 bg-white text-[#0a1f4d] shadow-lg shadow-blue-950/10 transition hover:border-[#0b3fa8] hover:text-[#0b3fa8] sm:grid";

  return (
    <div className="relative min-w-0">
      {s.prev && (
        <button type="button" onClick={() => go(-1)} aria-label={prevLabel} className={cn(arrow, "start-0")}>
          <ChevronLeft className="size-5 rtl:rotate-180" />
        </button>
      )}
      <ul
        ref={ref}
        aria-label={label}
        className={cn(
          // scroll-padding mirrors the padding, or snapping aligns the first card
          // to the very edge and the strip reads as already scrolled.
          "flex snap-x snap-proximity scroll-px-1 gap-4 overflow-x-auto px-1 pb-3 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          (s.prev || s.next) && "sm:scroll-px-11 sm:px-11",
        )}
      >
        {children}
      </ul>
      {s.next && (
        <button type="button" onClick={() => go(1)} aria-label={nextLabel} className={cn(arrow, "end-0")}>
          <ChevronRight className="size-5 rtl:rotate-180" />
        </button>
      )}
      {s.pages > 1 && (
        <div className="mt-3 flex justify-center gap-1.5" aria-hidden="true">
          {Array.from({ length: s.pages }).map((_, i) => (
            <span key={i} className={cn("h-2 rounded-full transition-all", i === s.page ? "w-5 bg-[#0b3fa8]" : "w-2 bg-slate-300")} />
          ))}
        </div>
      )}
    </div>
  );
}
