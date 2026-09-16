"use client";

import * as React from "react";
import { ExternalLink, GitBranch, Link2, ScrollText, Target, type LucideIcon } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { WEEK_TOOL_LINKS } from "@/features/orientation/lib/course-map";
import type { WeekContent } from "@/features/orientation/lib/sales-orientation";
import { useOrientationT } from "@/features/orientation/lib/i18n";
import { Lead, SectionLabel, type GateProps } from "./lesson-parts";
import { TickList } from "./orientation-modules";

const TOOL_ICONS: Record<string, LucideIcon> = {
  leads: Target,
  pipelines: GitBranch,
  "payment-links": Link2,
  rules: ScrollText,
};

/**
 * Your first week & tools — the CRM pages every enquiry ends up in, and the
 * setup steps before a first shift. Ticking every step completes the lesson.
 * A page links only when the viewer's role can open it.
 */
export function WeekLesson({
  week,
  access,
  seen,
  mark,
}: {
  week: WeekContent;
  /** Which tool keys this viewer can open. */
  access: Record<string, boolean>;
} & GateProps) {
  const { t } = useOrientationT();

  const openLink = (key: string) => {
    const tool = WEEK_TOOL_LINKS[key];
    if (!tool || !access[key]) return null;
    return (
      <Button asChild variant="ghost" size="sm" className="h-8 shrink-0 gap-1.5 text-primary">
        <Link href={tool.href} target="_blank" rel="noopener noreferrer">
          {t("common.open")}
          <ExternalLink className="size-3.5" />
        </Link>
      </Button>
    );
  };

  return (
    <div className="space-y-5">
      {week.intro && <Lead>{week.intro}</Lead>}

      <div className="grid gap-3 md:grid-cols-3">
        {week.tools.map((tool, i) => {
          const Icon = TOOL_ICONS[tool.key] ?? Target;
          const known = !!WEEK_TOOL_LINKS[tool.key];
          return (
            <div key={`${i}-${tool.key}`} className="flex flex-col gap-1.5 rounded-2xl border border-border/70 p-4">
              <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
                <Icon className="size-4" />
              </span>
              <b className="text-sm">{tool.title}</b>
              <p className="flex-1 text-[13px] leading-relaxed text-muted-foreground">{tool.body}</p>
              {known && (access[tool.key] ? openLink(tool.key) : <p className="text-xs text-muted-foreground">{t("week.noAccess")}</p>)}
            </div>
          );
        })}
      </div>

      <div className="space-y-2.5">
        {week.setupTitle && <SectionLabel>{week.setupTitle}</SectionLabel>}
        <TickList items={week.checklist} prefix="w" seen={seen} mark={mark} renderExtra={(i) => openLink(week.checklist[i]?.link ?? "")} />
      </div>
    </div>
  );
}
