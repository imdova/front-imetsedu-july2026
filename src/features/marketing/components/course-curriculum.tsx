"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, FileText, PlayCircle, Lock } from "lucide-react";

import { cn } from "@/lib/utils";
import type { CurriculumModule } from "@/types";

/** Collapsible curriculum — each module expands to reveal its lessons. */
export function CourseCurriculum({
  modules,
  locale,
}: {
  modules: CurriculumModule[];
  locale: string;
}) {
  const t = useTranslations("Marketing");
  const ar = locale === "ar";
  const [open, setOpen] = React.useState<number | null>(0); // first module open by default

  return (
    <ul className="divide-y divide-border/60 overflow-hidden rounded-xl border border-border/70">
      {modules.map((m, i) => {
        const expanded = open === i;
        const title = (ar ? m.titleAr || m.titleEn : m.titleEn || m.titleAr) || `Module ${i + 1}`;
        return (
          <li key={i} className="bg-card">
            <button
              type="button"
              onClick={() => setOpen(expanded ? null : i)}
              aria-expanded={expanded}
              className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-start transition-colors hover:bg-muted/30"
            >
              <span className="inline-flex items-center gap-2.5 text-sm font-medium">
                <span className="grid size-6 shrink-0 place-items-center rounded-md bg-primary/10 text-xs font-semibold tabular-nums text-primary">
                  {i + 1}
                </span>
                {title}
              </span>
              <span className="inline-flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
                <span className="tabular-nums">{m.lessons.length} {t("lessons")}</span>
                <ChevronDown className={cn("size-4 transition-transform", expanded && "rotate-180")} />
              </span>
            </button>

            {expanded && (
              <ul className="border-t border-border/50 bg-muted/20 px-4 py-1">
                {m.lessons.length ? (
                  m.lessons.map((l, j) => {
                    const lt = (ar ? l.titleAr || l.titleEn : l.titleEn || l.titleAr) || `Lesson ${j + 1}`;
                    return (
                      <li key={j} className="flex items-center justify-between gap-3 border-b border-border/40 py-2.5 text-sm last:border-0">
                        <span className="inline-flex items-center gap-2.5 text-muted-foreground">
                          {l.isFreePreview ? (
                            <PlayCircle className="size-4 shrink-0 text-primary" />
                          ) : (
                            <FileText className="size-4 shrink-0" />
                          )}
                          {lt}
                        </span>
                        <span className="inline-flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                          {l.duration && <span className="tabular-nums">{l.duration}</span>}
                          {!l.isFreePreview && <Lock className="size-3" />}
                        </span>
                      </li>
                    );
                  })
                ) : (
                  <li className="py-2.5 text-sm text-muted-foreground">{t("noLessons")}</li>
                )}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}
