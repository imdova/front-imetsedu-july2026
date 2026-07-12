"use client";

import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePipelineStages } from "@/hooks/use-pipeline-stages";
import {
  STAGE_STYLE,
  STAGE_LABEL_KEY,
  STAGE_SHORT_LABEL_KEY,
  PRIORITY_LABEL_KEY,
  PRIORITY_STYLE,
  scoreTone,
} from "../lib/maps";

export function StageBadge({ stageKey }: { stageKey: string }) {
  const t = useTranslations("Crm") as unknown as (k: string) => string;
  const { getDisplayName } = usePipelineStages();

  const fullFromCrm = getDisplayName(stageKey);
  const labelKey = STAGE_LABEL_KEY[stageKey];
  const full =
    fullFromCrm && fullFromCrm !== stageKey.replace(/_/g, " ")
      ? fullFromCrm
      : labelKey
        ? t(labelKey)
        : fullFromCrm;

  const shortKey = STAGE_SHORT_LABEL_KEY[stageKey];
  const short = shortKey ? t(shortKey) : full;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          className={cn(
            STAGE_STYLE[stageKey] ?? STAGE_STYLE.new,
            "max-w-[7.5rem] truncate",
          )}
        >
          {short}
        </Badge>
      </TooltipTrigger>
      <TooltipContent side="top">{full}</TooltipContent>
    </Tooltip>
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

/** Compact source chip for tables — short label + full name on hover. */
export function SourceBadge({ source }: { source: string }) {
  const short = shortSourceLabel(source);
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant="outline" className="max-w-[6.5rem] truncate font-normal">
          {short}
        </Badge>
      </TooltipTrigger>
      <TooltipContent side="top">{source}</TooltipContent>
    </Tooltip>
  );
}

function shortSourceLabel(source: string): string {
  const s = source.toLowerCase();
  if (s.includes("whats")) return "whats";
  if (s.includes("facebook") || s === "fb" || s.startsWith("fb ")) return "facebook";
  if (s.includes("web") || s.includes("site") || s.includes("landing")) return "web";
  if (s.includes("google")) return "google";
  if (s.includes("instagram") || s.includes("insta")) return "insta";
  if (s.includes("referral")) return "referral";
  // Fallback: first word, capped so the column stays narrow
  const first = source.trim().split(/\s+/)[0] ?? source;
  return first.length > 10 ? `${first.slice(0, 9)}…` : first;
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
