"use client";

import * as React from "react";
import { ArrowRight, Award, Check, ListTree, MessageCircle, Star, Zap } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { num, useOrientationT, type OrientationKey } from "@/features/orientation/lib/i18n";
import { levelFor } from "@/features/orientation/lib/gamification";

export interface JourneyModule {
  id: string;
  n: number;
  title: string;
  done: number;
  total: number;
  current: boolean;
  onClick: () => void;
}

/** XP, level and stars from the module checks. */
function ScoreRow({ xp, starsEarned, starsTotal }: { xp: number; starsEarned: number; starsTotal: number }) {
  const { t } = useOrientationT();
  const level = levelFor(xp);
  const toNext = level.next ? level.next.min - xp : 0;
  const span = level.next ? level.next.min - level.current.min : 1;
  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 font-bold tabular-nums text-amber-700 dark:text-amber-400">
        <Zap className="size-3.5" />
        {t("journey.xp", { xp: num(xp) })} · {t(level.current.key as OrientationKey)}
      </span>
      <span className="inline-flex items-center gap-1 font-semibold tabular-nums text-[#B7801F]">
        <Star className="size-3.5 fill-[#D89B32] text-[#D89B32]" />
        {t("journey.stars", { n: num(starsEarned), total: num(starsTotal) })}
      </span>
      {level.next && (
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <span className="h-1.5 w-16 overflow-hidden rounded-full bg-muted" aria-hidden="true">
            <span className="block h-full rounded-full bg-amber-500" style={{ width: `${Math.round(((xp - level.current.min) / span) * 100)}%` }} />
          </span>
          {t("journey.nextLevel", { xp: num(toNext), level: t(level.next.key as OrientationKey) })}
        </span>
      )}
    </div>
  );
}

/**
 * The top of the page: where the rep is, what's next, how long is left, and the
 * finish line. Five module segments lead to the team-lead sign-off marker,
 * which turns gold when every lesson is done.
 */
export function JourneyHeader({
  percent,
  greeting,
  summary,
  continueLabel,
  onContinue,
  modules,
  allDone,
  signedOff,
  teamLeadLink,
  paceText,
  xp,
  starsEarned,
  starsTotal,
  onOpenOutline,
}: {
  paceText: string;
  /** Best XP across module checks. */
  xp: number;
  starsEarned: number;
  /** 3 per module check; 0 hides the score row. */
  starsTotal: number;
  percent: number;
  greeting: string;
  summary: string;
  /** Null hides the button (everything is done). */
  continueLabel: string | null;
  onContinue: () => void;
  modules: JourneyModule[];
  allDone: boolean;
  signedOff: boolean;
  teamLeadLink: string;
  onOpenOutline: () => void;
}) {
  const { t } = useOrientationT();

  return (
    <section
      id="orientation-journey"
      aria-label={t("journey.label")}
      className="grid scroll-mt-20 gap-5 rounded-[18px] border border-border/70 bg-card p-4 shadow-sm sm:p-5"
    >
      <div className="flex flex-wrap items-center gap-4">
        <div
          role="img"
          aria-label={`${percent}%`}
          className="grid size-14 shrink-0 place-items-center rounded-full"
          style={{ background: `conic-gradient(var(--primary) ${percent}%, var(--muted) 0)` }}
        >
          <span className="grid size-11 place-items-center rounded-full bg-card text-[13px] font-bold tabular-nums">{percent}%</span>
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-heading text-lg font-bold leading-tight">{greeting}</h2>
          <p className="text-sm text-muted-foreground tabular-nums">{summary}</p>
          {starsTotal > 0 && (
            <ScoreRow xp={xp} starsEarned={starsEarned} starsTotal={starsTotal} />
          )}
        </div>
        <div className="flex w-full flex-wrap gap-2 sm:w-auto">
          <Button variant="outline" className="gap-1.5 min-[1080px]:hidden" onClick={onOpenOutline}>
            <ListTree className="size-4" />
            {t("outline.button")}
          </Button>
          {continueLabel && (
            <Button className="max-w-full flex-1 gap-1.5 sm:flex-none" onClick={onContinue}>
              <span className="truncate">{continueLabel}</span>
              <ArrowRight className="size-4 shrink-0 rtl:-scale-x-100" />
            </Button>
          )}
        </div>
      </div>

      <div
        className="grid grid-cols-[repeat(var(--modules),minmax(0,1fr))] items-start gap-1.5 min-[761px]:grid-cols-[repeat(var(--modules),minmax(0,1fr))_auto]"
        style={{ "--modules": Math.max(1, modules.length) } as React.CSSProperties}
      >
        {modules.map((m) => {
          const complete = m.total > 0 && m.done >= m.total;
          return (
            <button
              key={m.id}
              type="button"
              onClick={m.onClick}
              aria-label={t("journey.moduleAria", { n: m.n, module: m.title, done: m.done, total: m.total })}
              aria-current={m.current ? "step" : undefined}
              className="grid min-w-0 gap-1.5 rounded-md text-start"
            >
              <span className="h-2 overflow-hidden rounded-full border border-border/70 bg-muted">
                <span
                  className={cn("block h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none", complete ? "bg-emerald-500" : "bg-primary")}
                  style={{ width: `${m.total ? (m.done / m.total) * 100 : 0}%` }}
                />
              </span>
              <span className="hidden min-w-0 items-baseline gap-1.5 text-xs text-muted-foreground min-[761px]:flex">
                <span className="shrink-0 tabular-nums">{m.n}</span>
                <b className={cn("truncate font-semibold", m.current ? "text-primary" : "text-foreground")}>{m.title}</b>
              </span>
            </button>
          );
        })}
        <div className="hidden justify-items-center gap-1.5 px-1.5 min-[761px]:grid" aria-label={t("journey.signoff")}>
          <span
            className={cn(
              "-mt-3 grid size-8 place-items-center rounded-full border-2 bg-card",
              signedOff
                ? "border-[#D89B32] bg-[#D89B32] text-white"
                : allDone
                  ? "border-[#D89B32] text-[#D89B32]"
                  : "border-dashed border-border text-muted-foreground",
            )}
          >
            {signedOff ? <Check className="size-4" /> : <Award className="size-4" />}
          </span>
          <span className="whitespace-nowrap text-xs text-muted-foreground">
            {signedOff ? t("journey.signedOff") : t("journey.signoff")}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-dashed border-border pt-3.5 text-[13px] text-muted-foreground">
        <span>
          <b className="font-semibold text-foreground/80">{t("journey.pace")}:</b> {paceText}
        </span>
        {teamLeadLink && (
          <span className="ms-auto">
            {t("journey.stuck")}{" "}
            <a
              href={teamLeadLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
            >
              <MessageCircle className="size-3.5" />
              {t("journey.ask")}
            </a>
          </span>
        )}
      </div>
    </section>
  );
}
