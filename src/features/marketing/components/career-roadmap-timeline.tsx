"use client";

import * as React from "react";
import { Award, Briefcase, Compass } from "lucide-react";

import { cn } from "@/lib/utils";
import type { CareerRole } from "@/features/marketing/lib/course-content";

/**
 * Career ladder as a climbing staircase: entry level sits at the bottom-left and
 * each rung steps up and to the right, ending at the goal.
 *
 * **Why it reads bottom-up.** A career ladder is a climb, so the visual has to
 * ascend — but the list must still be authored and announced in order (1 → n).
 * So the DOM order is the real order and `flex-col-reverse` does the flipping:
 * a screen reader hears entry-level first, a reader sees it at the foot of the
 * stairs. The step numbers survive either way.
 *
 * **No progress bars.** Each rung used to carry one, filled to
 * `(index + 1) / roles.length` — the array position dressed up as a percentage.
 * It measured nothing but read as if it did.
 *
 * `description` is optional: a title-only ladder is valid and simply renders a
 * tighter rung.
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
  const [visible, setVisible] = React.useState<Record<number, boolean>>({});

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
      { threshold: 0.25, rootMargin: "0px 0px -6% 0px" },
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [roles.length]);

  const tr = (en: string, arText: string) => (ar ? arText : en);
  if (!roles.length) return null;

  return (
    <div ref={rootRef} className="relative mt-8">
      {/* col-reverse: DOM order is 1→n (correct for reading order and the step
          numbers); the visual climbs, so the goal lands on top. */}
      <ol className="flex flex-col-reverse">
        {roles.map((r, i) => {
          const last = i === roles.length - 1;
          const on = visible[i];
          return (
            <li
              key={r.title}
              data-career-step={i}
              className={cn(
                "relative transition-all duration-700 ease-out",
                on ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
              )}
            >
              {/* Riser — the climb between this rung and the one below it.
                  Skipped on the first rung, which sits on the entry marker. */}
              {i > 0 && (
                <span
                  aria-hidden
                  className="absolute bottom-full start-[1.35rem] h-6 w-0.5 rounded-full bg-gradient-to-t from-primary/15 to-primary/45 sm:start-[1.6rem]"
                />
              )}

              {/* The stair lives on this wrapper, not on the <li>: a margin set
                  on the list item computed to 0 no matter how it was expressed
                  (utility, arbitrary property, or inline literal), so the offset
                  goes on an ordinary block instead of fighting that.

                  Responsive by construction rather than by breakpoint: the clamp
                  resolves to 0 below ~40rem, so narrow screens stay flat and full
                  width, and grows to one notch per rung by desktop. */}
              <div
                style={{
                  marginInlineStart: `calc(${i} * clamp(0rem, (100vw - 40rem) * 0.06, 2.75rem))`,
                }}
                className={cn(
                  "relative flex items-stretch gap-4 ps-12 pb-6 sm:ps-14",
                  last && "pb-0",
                )}
              >
                {/* Step marker */}
                <span
                  className={cn(
                    "absolute start-0 top-0 z-10 grid size-11 place-items-center rounded-2xl font-heading text-sm font-bold tabular-nums ring-4 ring-background transition-transform duration-500 sm:size-[3.25rem]",
                    last
                      ? "bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-[0_6px_20px_rgba(180,83,9,0.35)]"
                      : "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-[0_6px_18px_rgba(11,63,168,0.28)]",
                    on ? "scale-100" : "scale-90",
                  )}
                >
                  {last ? <Award className="size-5" /> : i + 1}
                </span>

                {/* Rung */}
                <div
                  className={cn(
                    "min-w-0 flex-1 rounded-2xl border p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:p-5",
                    last
                      ? "border-amber-300 bg-gradient-to-br from-amber-50 via-background to-background dark:border-amber-900/50 dark:from-amber-950/30"
                      : "border-border/70 bg-card",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p
                      className={cn(
                        "min-w-0 flex-1 font-heading text-base font-bold leading-snug tracking-tight",
                        last
                          ? "text-amber-900 dark:text-amber-200"
                          : "text-foreground",
                      )}
                    >
                      {r.title}
                    </p>
                    {last ? (
                      <span className="shrink-0 rounded-full bg-amber-500 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
                        {tr("Goal", "الهدف")}
                      </span>
                    ) : (
                      <Briefcase
                        className="size-4 shrink-0 text-muted-foreground/40"
                        aria-hidden
                      />
                    )}
                  </div>
                  {r.description && (
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {r.description}
                    </p>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {/* Entry marker — visually the foot of the stairs. Last in the DOM so
          col-reverse puts it at the bottom, and it is not part of the <ol>:
          it is a label for where the list starts, not a rung of it. */}
      <div className="mt-1 flex items-center gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl border-2 border-dashed border-border bg-background text-muted-foreground sm:size-[3.25rem]">
          <Compass className="size-4" />
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {tr("Entry level", "نقطة البداية")}
        </span>
      </div>
    </div>
  );
}
