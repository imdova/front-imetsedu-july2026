"use client";

import { useTranslations } from "next-intl";
import { Check, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ScoreResult } from "@/lib/crm/scoring";
import { PriorityBadge } from "./lead-badges";
import { scoreTone } from "../lib/maps";

const R = 34;
const CIRC = 2 * Math.PI * R;

/** Circular live score dial + earned/available contribution breakdown. */
export function ScoreWidget({ result }: { result: ScoreResult }) {
  const t = useTranslations("Crm");
  const tr = t as unknown as (k: string) => string;
  const offset = CIRC - (result.score / 100) * CIRC;

  return (
    <div className="rounded-xl border border-border/70 bg-card p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="relative size-[88px] shrink-0">
          <svg viewBox="0 0 80 80" className="size-full -rotate-90">
            <circle cx="40" cy="40" r={R} fill="none" stroke="var(--muted)" strokeWidth="7" />
            <circle
              cx="40"
              cy="40"
              r={R}
              fill="none"
              stroke="currentColor"
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={offset}
              className={cn("transition-all duration-500", scoreTone(result.score))}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <span className={cn("font-heading text-2xl font-bold tabular-nums", scoreTone(result.score))}>
              {result.score}
            </span>
          </div>
        </div>
        <div className="space-y-1.5">
          <p className="text-sm font-medium">{t("liveScore")}</p>
          <PriorityBadge priority={result.priority} />
        </div>
      </div>

      <div className="mt-4 space-y-1.5 border-t pt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t("scoreBreakdown")}
        </p>
        <ul className="space-y-1">
          {result.contributions.map((c) => (
            <li key={c.key} className="flex items-center justify-between text-sm">
              <span className="inline-flex items-center gap-2">
                <span
                  className={cn(
                    "grid size-4 place-items-center rounded-full",
                    c.earned ? "bg-success/15 text-success" : "bg-muted text-muted-foreground",
                  )}
                >
                  {c.earned ? <Check className="size-3" /> : <Plus className="size-3" />}
                </span>
                <span className={cn(!c.earned && "text-muted-foreground")}>
                  {tr(c.labelKey)}
                </span>
              </span>
              <span
                className={cn(
                  "text-xs tabular-nums",
                  c.earned ? "font-medium text-success" : "text-muted-foreground",
                )}
              >
                {c.earned ? "+" : ""}
                {c.points} {c.earned ? t("earned") : t("available")}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
