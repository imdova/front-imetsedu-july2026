"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  ChevronDown,
  Check,
  Monitor,
  Clock,
  UserRound,
  ClipboardList,
  PlayCircle,
  Lock,
  Radio,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { CurriculumModule } from "@/types";

/** Vertical live-curriculum roadmap — premium module cards on a progress rail. */
export function CourseCurriculum({
  modules,
  locale,
  moduleOutcomes,
  moduleTopics,
}: {
  modules: CurriculumModule[];
  locale: string;
  /** Per-module outcome lists (same order as `modules`). */
  moduleOutcomes?: (string[] | undefined)[];
  /** Short topic tags under each title, e.g. Leadership · Operations. */
  moduleTopics?: (string[] | undefined)[];
}) {
  const t = useTranslations("Marketing");
  const ar = locale === "ar";
  const [open, setOpen] = React.useState<number | null>(0);

  return (
    <div dir={ar ? "rtl" : "ltr"} className="w-full">
      <ol className="relative space-y-0">
        {/* Continuous progress rail */}
        <span
          aria-hidden
          className="absolute start-[1.375rem] top-5 bottom-5 w-px bg-gradient-to-b from-primary/40 via-primary/25 to-amber-400/35 sm:start-[1.625rem]"
        />

        {modules.map((m, i) => {
          const expanded = open === i;
          const title =
            (ar ? m.titleAr || m.titleEn : m.titleEn || m.titleAr) ||
            `Module ${i + 1}`;
          const sessionCount = m.lessons.length;
          const outcomes = moduleOutcomes?.[i]?.filter(Boolean) ?? [];
          const topics = moduleTopics?.[i]?.filter(Boolean) ?? [];
          // Soft alternating card tint for hierarchy
          const cardSurface = expanded
            ? "border-primary/25 bg-white shadow-md shadow-primary/10 ring-1 ring-primary/10 dark:bg-card"
            : i % 2 === 0
              ? "border-border/60 bg-white/90 hover:border-primary/20 hover:shadow-sm dark:bg-card/80"
              : "border-border/50 bg-[#F8FAFF] hover:border-primary/20 hover:shadow-sm dark:bg-primary/[0.06]";

          return (
            <li
              key={`${title}-${i}`}
              className="relative flex gap-4 pb-6 last:pb-0 sm:gap-5"
            >
              {/* Step node on the rail */}
              <div className="relative z-[1] flex w-11 shrink-0 flex-col items-center sm:w-12">
                <span
                  className={cn(
                    "grid size-9 place-items-center rounded-full font-heading text-sm font-bold tabular-nums transition-all sm:size-10 sm:text-base",
                    expanded
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-105"
                      : "bg-white text-primary ring-2 ring-primary/25 dark:bg-card",
                  )}
                >
                  {i + 1}
                </span>
              </div>

              {/* Premium module card */}
              <div
                className={cn(
                  "min-w-0 flex-1 overflow-hidden rounded-2xl border transition-all duration-300",
                  cardSurface,
                )}
              >
                <button
                  type="button"
                  onClick={() => setOpen(expanded ? null : i)}
                  aria-expanded={expanded}
                  className="flex w-full items-start gap-3 px-4 py-4 text-start sm:gap-4 sm:px-5 sm:py-5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-heading text-base font-bold tracking-tight text-foreground sm:text-lg">
                      {title}
                    </p>

                    {topics.length > 0 ? (
                      <p className="mt-1.5 text-xs font-medium tracking-wide text-primary/80 sm:text-[0.8125rem]">
                        {topics.join(ar ? " · " : " · ")}
                      </p>
                    ) : null}

                    {/* Progress underline */}
                    <span
                      aria-hidden
                      className={cn(
                        "mt-3 block h-0.5 w-full max-w-[12rem] rounded-full",
                        expanded
                          ? "bg-gradient-to-r from-primary via-primary to-amber-400"
                          : "bg-primary/15",
                      )}
                      style={{
                        width: `${Math.min(100, 28 + (i + 1) * (72 / Math.max(modules.length, 1)))}%`,
                      }}
                    />

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {sessionCount > 0 ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-800">
                          <Monitor className="size-3.5" aria-hidden />
                          <span
                            className="size-1.5 rounded-full bg-emerald-500"
                            aria-hidden
                          />
                          {t("liveSessionsCount", { count: sessionCount })}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <span
                    className={cn(
                      "mt-0.5 grid size-9 shrink-0 place-items-center rounded-full transition-colors",
                      expanded
                        ? "bg-primary text-primary-foreground"
                        : "bg-primary/10 text-primary",
                    )}
                  >
                    <ChevronDown
                      className={cn(
                        "size-4 transition-transform duration-300",
                        expanded && "rotate-180",
                      )}
                    />
                  </span>
                </button>

                {expanded && (
                  <div className="space-y-4 border-t border-primary/10 bg-gradient-to-b from-primary/[0.03] to-transparent px-4 py-4 sm:px-5 sm:py-5">
                    <div className="flex flex-wrap gap-2">
                      <DeliveryChip
                        icon={Monitor}
                        label={t("deliveryLiveZoom")}
                        tone="text-sky-700 bg-sky-50 ring-sky-200/70 dark:text-sky-300 dark:bg-sky-950/40 dark:ring-sky-800"
                      />
                      <DeliveryChip
                        icon={Clock}
                        label={t("liveSessionsCount", {
                          count: sessionCount || 1,
                        })}
                        tone="text-emerald-700 bg-emerald-50 ring-emerald-200/70 dark:text-emerald-300 dark:bg-emerald-950/40 dark:ring-emerald-800"
                      />
                      <DeliveryChip
                        icon={UserRound}
                        label={t("deliveryInstructorLed")}
                        tone="text-violet-700 bg-violet-50 ring-violet-200/70 dark:text-violet-300 dark:bg-violet-950/40 dark:ring-violet-800"
                      />
                      <DeliveryChip
                        icon={ClipboardList}
                        label={t("deliveryAssignment")}
                        tone="text-amber-700 bg-amber-50 ring-amber-200/70 dark:text-amber-300 dark:bg-amber-950/40 dark:ring-amber-800"
                      />
                    </div>

                    {outcomes.length > 0 ? (
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {t("moduleOutcomesLead")}
                        </p>
                        <ul className="mt-2.5 space-y-2">
                          {outcomes.map((o) => (
                            <li
                              key={o}
                              className="flex items-start gap-2.5 text-sm text-foreground/90"
                            >
                              <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                                <Check
                                  className="size-2.5 stroke-[3]"
                                  aria-hidden
                                />
                              </span>
                              {o}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {sessionCount > 0 ? (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                          {t("moduleSessionsHeading")}
                        </p>
                        <ul className="mt-2">
                          {m.lessons.map((l, j) => {
                            const lt =
                              (ar
                                ? l.titleAr || l.titleEn
                                : l.titleEn || l.titleAr) || `Session ${j + 1}`;
                            return (
                              <li
                                key={`${lt}-${j}`}
                                className="flex items-center justify-between gap-3 border-b border-border/40 py-2.5 text-sm last:border-0"
                              >
                                <span className="inline-flex items-center gap-2.5 text-muted-foreground">
                                  {l.isFreePreview ? (
                                    <PlayCircle className="size-4 shrink-0 text-primary" />
                                  ) : (
                                    <Radio className="size-4 shrink-0 text-primary/70" />
                                  )}
                                  {lt}
                                </span>
                                <span className="inline-flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                                  {l.duration && (
                                    <span className="tabular-nums">
                                      {l.duration}
                                    </span>
                                  )}
                                  {!l.isFreePreview && (
                                    <Lock className="size-3" />
                                  )}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {t("noLessons")}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function DeliveryChip({
  icon: Icon,
  label,
  tone,
}: {
  icon: React.ElementType;
  label: string;
  tone: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
        tone,
      )}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden />
      {label}
    </span>
  );
}
