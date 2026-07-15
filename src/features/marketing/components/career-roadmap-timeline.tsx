"use client";

import * as React from "react";
import { Award, Briefcase, Compass } from "lucide-react";

import { cn } from "@/lib/utils";
import type { CareerRole } from "@/features/marketing/lib/course-content";

/**
 * Career-ladder timeline with scroll-driven progress: the rail fills and each
 * step reveals (opacity + seniority bar) as it enters the viewport.
 */
export function CareerRoadmapTimeline({
  locale,
  roles,
}: {
  locale: string;
  roles: CareerRole[];
}) {
  const ar = locale === "ar";
  const rootRef = React.useRef<HTMLDivElement>(null);
  const [progress, setProgress] = React.useState(0);
  const [visible, setVisible] = React.useState<Record<number, boolean>>({});

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const onScroll = () => {
      const rect = root.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // 0 when section just enters, 1 when nearly scrolled through.
      const raw = (vh * 0.65 - rect.top) / (rect.height + vh * 0.2);
      setProgress(Math.min(1, Math.max(0, raw)));
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const items = root.querySelectorAll<HTMLElement>("[data-career-step]");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const idx = Number((e.target as HTMLElement).dataset.careerStep);
          if (Number.isFinite(idx)) {
            setVisible((prev) => (prev[idx] ? prev : { ...prev, [idx]: true }));
          }
        }
      },
      { threshold: 0.35, rootMargin: "0px 0px -8% 0px" },
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [roles.length]);

  const tr = (en: string, arText: string) => (ar ? arText : en);

  return (
    <div ref={rootRef} className="relative mt-6">
      <ol className="relative">
        {/* Track */}
        <span
          className="absolute start-[1.0625rem] top-3 bottom-6 w-0.5 rounded-full bg-border/80"
          aria-hidden
        />
        {/* Fill that grows on scroll */}
        <span
          className="absolute start-[1.0625rem] top-3 w-0.5 origin-top rounded-full bg-gradient-to-b from-primary via-primary to-amber-500 transition-[height] duration-150 ease-out"
          style={{ height: `calc((100% - 1.5rem) * ${progress})` }}
          aria-hidden
        />

        <li className="relative flex items-center gap-4 pb-5" data-career-step={-1}>
          <span className="z-10 grid size-9 shrink-0 place-items-center rounded-full border-2 border-dashed border-border bg-background text-muted-foreground ring-4 ring-background">
            <Compass className="size-4" />
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {tr("Entry level", "نقطة البداية")}
          </span>
        </li>

        {roles.map((r, i) => {
          const last = i === roles.length - 1;
          const pct = Math.round(((i + 1) / roles.length) * 100);
          const on = visible[i];
          return (
            <li
              key={r.title}
              data-career-step={i}
              className={cn(
                "relative flex items-start gap-4 pb-5 last:pb-0 transition-all duration-700 ease-out",
                on ? "translate-y-0 opacity-100" : "translate-y-3 opacity-40",
              )}
            >
              <span
                className={cn(
                  "z-10 grid size-9 shrink-0 place-items-center rounded-full font-heading text-sm font-bold tabular-nums ring-4 ring-background transition-transform duration-500",
                  last
                    ? "bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-[0_2px_8px_rgba(180,83,9,0.4)]"
                    : "bg-primary text-primary-foreground",
                  on && "scale-100",
                  !on && "scale-90",
                )}
              >
                {last ? <Award className="size-4" /> : i + 1}
              </span>

              <div
                className={cn(
                  "min-w-0 flex-1 rounded-xl border p-3.5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
                  last
                    ? "border-amber-300 bg-gradient-to-br from-amber-50 to-background dark:border-amber-900/50 dark:from-amber-950/30 dark:to-background"
                    : "border-border/70 bg-card",
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p
                      className={cn(
                        "text-[10px] font-bold uppercase tracking-wider",
                        last ? "text-amber-700 dark:text-amber-400" : "text-primary/70",
                      )}
                    >
                      {tr(`Level ${i + 1}`, `المستوى ${i + 1}`)}
                    </p>
                    <p className="truncate font-semibold text-foreground">{r.title}</p>
                  </div>
                  {last ? (
                    <span className="shrink-0 rounded-full bg-amber-500 px-2.5 py-0.5 text-[11px] font-bold text-white">
                      {tr("Goal", "الهدف")}
                    </span>
                  ) : (
                    <Briefcase className="size-4 shrink-0 text-muted-foreground/50" />
                  )}
                </div>

                <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full rounded-full bg-gradient-to-r transition-[width] duration-700 ease-out rtl:bg-gradient-to-l",
                      last ? "from-amber-400 to-amber-600" : "from-primary/40 to-primary",
                    )}
                    style={{ width: on ? `${pct}%` : "0%" }}
                  />
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
