"use client";

import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  STAGE_LABEL_KEY,
  STAGE_STYLE,
  PRIORITY_LABEL_KEY,
  PRIORITY_STYLE,
  scoreTone,
} from "../lib/maps";

export function StageBadge({ stageKey }: { stageKey: string }) {
  const t = useTranslations("Crm") as unknown as (k: string) => string;
  return (
    <Badge className={STAGE_STYLE[stageKey] ?? STAGE_STYLE.new}>
      {t(STAGE_LABEL_KEY[stageKey] ?? "stageNew")}
    </Badge>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  const t = useTranslations("Crm") as unknown as (k: string) => string;
  return (
    <Badge className={PRIORITY_STYLE[priority] ?? PRIORITY_STYLE.cold}>
      {t(PRIORITY_LABEL_KEY[priority] ?? "priorityCold")}
    </Badge>
  );
}

/** Compact numeric score chip used in tables and cards. */
export function ScoreChip({ score }: { score: number }) {
  return (
    <span
      className={cn(
        "inline-flex min-w-9 items-center justify-center rounded-md bg-muted px-1.5 py-0.5 text-xs font-semibold tabular-nums",
        scoreTone(score),
      )}
    >
      {score}
    </span>
  );
}
