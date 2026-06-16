"use client";

import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { usePipelineStages } from "@/hooks/use-pipeline-stages";
import {
  STAGE_STYLE,
  PRIORITY_LABEL_KEY,
  PRIORITY_STYLE,
  scoreTone,
} from "../lib/maps";

export function StageBadge({ stageKey }: { stageKey: string }) {
  const { getDisplayName } = usePipelineStages();
  return (
    <Badge className={STAGE_STYLE[stageKey] ?? STAGE_STYLE.new}>
      {getDisplayName(stageKey)}
    </Badge>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  const t = useTranslations("Crm") as unknown as (k: string) => string;
  const translationKey = PRIORITY_LABEL_KEY[priority?.toLowerCase()];
  const displayName = translationKey ? t(translationKey) : priority;
  return (
    <Badge className={PRIORITY_STYLE[priority?.toLowerCase()] ?? PRIORITY_STYLE.cold}>
      {displayName}
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
