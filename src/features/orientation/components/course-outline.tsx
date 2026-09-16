"use client";

import * as React from "react";
import { Check, ChevronDown, Lock, RotateCcw } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { formatMinutes, useOrientationT, type OrientationKey } from "@/features/orientation/lib/i18n";
import type { LessonView } from "@/features/orientation/lib/sales-orientation";
import { TypeIcon } from "./lesson-parts";

export interface OutlineModule {
  id: string;
  n: number;
  title: string;
  lessons: { view: LessonView; index: number; done: boolean; current: boolean; locked: boolean }[];
}

/**
 * The course outline: collapsible modules with each lesson's status, type and
 * minutes. The module holding the current lesson opens by default. Rendered
 * in the sticky side column on wide screens and inside a bottom sheet below
 * 1080px.
 */
export function CourseOutline({
  modules,
  activeModuleId,
  onSelect,
  onReset,
  className,
}: {
  modules: OutlineModule[];
  activeModuleId: string;
  onSelect: (index: number) => void;
  onReset?: () => void;
  className?: string;
}) {
  const { t } = useOrientationT();
  const [toggled, setToggled] = React.useState<Record<string, boolean>>({});

  return (
    <nav aria-label={t("outline.button")} className={cn("space-y-0.5", className)}>
      {modules.map((m) => {
        const done = m.lessons.filter((l) => l.done).length;
        const total = m.lessons.length;
        const complete = total > 0 && done === total;
        const active = m.id === activeModuleId;
        const open = toggled[m.id] ?? active;
        const minutes = m.lessons.reduce((sum, l) => sum + l.view.minutes, 0);
        const listId = `outline-${m.id}`;
        return (
          <div key={m.id} className="border-b border-border/60 py-1 last:border-b-0">
            <button
              type="button"
              aria-expanded={open}
              aria-controls={listId}
              onClick={() => setToggled((s) => ({ ...s, [m.id]: !open }))}
              className="flex w-full items-center gap-2.5 rounded-xl p-2 text-start transition-colors hover:bg-muted/60"
            >
              <span
                className={cn(
                  "grid size-7 shrink-0 place-items-center rounded-lg text-xs font-bold tabular-nums",
                  complete ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" : active ? "bg-primary text-primary-foreground" : "bg-muted",
                )}
              >
                {complete ? <Check className="size-3.5" /> : m.n}
              </span>
              <span className="min-w-0 flex-1">
                <b className="block text-[13.5px] font-semibold leading-snug">{m.title}</b>
                <small className="text-xs text-muted-foreground tabular-nums">
                  {t("outline.meta", { done, total, time: formatMinutes(minutes, t) })}
                </small>
              </span>
              <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
            </button>

            {open && (
              <ul id={listId} className="pb-1 pt-0.5">
                {m.lessons.map(({ view, index, done: isDone, current, locked }) => (
                  <li key={view.id}>
                    <button
                      type="button"
                      aria-current={current ? "step" : undefined}
                      onClick={() => onSelect(index)}
                      className={cn(
                        "grid w-full grid-cols-[1.25rem_1fr_auto] items-center gap-2.5 rounded-xl py-2 pe-2 ps-2.5 text-start transition-colors",
                        current ? "bg-primary/[0.08]" : "hover:bg-muted/60",
                      )}
                    >
                      <span
                        className={cn(
                          "grid size-5 place-items-center rounded-full border-[1.5px]",
                          isDone
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : current
                              ? "border-primary bg-primary shadow-[inset_0_0_0_3px_var(--card)]"
                              : locked
                                ? "border-dashed border-border text-muted-foreground"
                                : "border-border",
                        )}
                      >
                        {isDone ? <Check className="size-3" strokeWidth={3} /> : locked ? <Lock className="size-2.5" /> : null}
                      </span>
                      <span className="min-w-0">
                        <span className={cn("line-clamp-2 text-[13.5px] leading-snug", current && "font-semibold text-primary")}>{view.title}</span>
                        <span className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11.5px] text-muted-foreground">
                          <TypeIcon type={view.type} className="size-3" />
                          {t(`type.${view.type}` as OrientationKey)}
                          {locked && <span className="sr-only">· {t("outline.locked")}</span>}
                          {view.isNew && (
                            <span className="rounded-full bg-amber-500/15 px-1.5 text-[10px] font-bold uppercase text-amber-700 dark:text-amber-400">
                              {t("badge.new")}
                            </span>
                          )}
                        </span>
                      </span>
                      <span className="text-xs text-muted-foreground tabular-nums">{t("lesson.minutes", { m: view.minutes })}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}

      {onReset && (
        <Button variant="ghost" size="sm" className="mt-2 w-full gap-1.5 text-muted-foreground" onClick={onReset}>
          <RotateCcw className="size-3.5" />
          {t("outline.reset")}
        </Button>
      )}
    </nav>
  );
}
