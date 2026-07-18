"use client";

import * as React from "react";
import { List } from "lucide-react";

import { cn } from "@/lib/utils";

export interface TocItem {
  id: string;
  text: string;
}

/** Thin progress bar fixed to the top of the viewport, tracking how far the
 *  reader has scrolled through the article body. */
export function ReadingProgress({ targetId }: { targetId: string }) {
  const [pct, setPct] = React.useState(0);

  React.useEffect(() => {
    const el = document.getElementById(targetId);
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height - vh;
      if (total <= 0) {
        setPct(rect.bottom <= vh ? 100 : 0);
        return;
      }
      const scrolled = Math.min(Math.max(-rect.top, 0), total);
      setPct((scrolled / total) * 100);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [targetId]);

  return (
    <div className="fixed inset-x-0 top-0 z-50 h-1 bg-transparent" aria-hidden>
      <div
        className="h-full bg-primary transition-[width] duration-150 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/** Scroll-spy so the active section is highlighted as the reader moves. */
function useActiveHeading(ids: string[]): string {
  const [active, setActive] = React.useState(ids[0] ?? "");
  React.useEffect(() => {
    if (!ids.length) return;
    const seen = new Map<string, boolean>();
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) seen.set(e.target.id, e.isIntersecting);
        // Highest heading currently on screen wins; else keep last.
        const visible = ids.find((id) => seen.get(id));
        if (visible) setActive(visible);
      },
      { rootMargin: "-88px 0px -70% 0px", threshold: 0 },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [ids]);
  return active;
}

/** Article table of contents. Sticky rail on desktop, collapsible on mobile. */
export function ArticleToc({ items, label }: { items: TocItem[]; label: string }) {
  const ids = React.useMemo(() => items.map((i) => i.id), [items]);
  const active = useActiveHeading(ids);

  const onJump = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 88;
    window.scrollTo({ top: y, behavior: "smooth" });
    history.replaceState(null, "", `#${id}`);
  };

  if (items.length < 3) return null;

  const linkList = (
    <ul className="space-y-1 border-s border-border/60 text-sm">
      {items.map((it) => (
        <li key={it.id}>
          <a
            href={`#${it.id}`}
            onClick={(e) => onJump(e, it.id)}
            className={cn(
              "-ms-px block border-s-2 py-1 ps-3 leading-snug transition-colors",
              active === it.id
                ? "border-primary font-medium text-primary"
                : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
            )}
          >
            {it.text}
          </a>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      {/* Mobile: collapsible */}
      <details className="group mb-6 rounded-2xl border border-border/60 bg-card/40 p-4 lg:hidden">
        <summary className="flex cursor-pointer list-none items-center gap-2 font-heading text-sm font-semibold">
          <List className="size-4 text-primary" />
          {label}
        </summary>
        <div className="mt-3">{linkList}</div>
      </details>

      {/* Desktop: sticky rail */}
      <nav className="sticky top-24 hidden lg:block" aria-label={label}>
        <p className="mb-3 flex items-center gap-2 font-heading text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
          <List className="size-3.5 text-primary" />
          {label}
        </p>
        {linkList}
      </nav>
    </>
  );
}
