"use client";

import { useTranslations } from "next-intl";
import { Info, Lightbulb, Cloud } from "lucide-react";

import { cn } from "@/lib/utils";

const TIPS = [
  {
    key: "validationTip",
    icon: Info,
    className: "border-violet-200 bg-violet-50 text-violet-900 dark:border-violet-900/40 dark:bg-violet-950/30 dark:text-violet-100",
    iconClassName: "text-violet-600",
  },
  {
    key: "bestPractice",
    icon: Lightbulb,
    className: "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100",
    iconClassName: "text-amber-600",
  },
  {
    key: "autosave",
    icon: Cloud,
    className: "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-100",
    iconClassName: "text-emerald-600",
  },
] as const;

export function FormTips() {
  const t = useTranslations("CourseForm");

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {TIPS.map(({ key, icon: Icon, className, iconClassName }) => (
        <div
          key={key}
          className={cn("rounded-xl border p-4", className)}
        >
          <div className="mb-2 flex items-center gap-2">
            <Icon className={cn("size-4 shrink-0", iconClassName)} />
            <p className="text-sm font-semibold">{t(`${key}Title`)}</p>
          </div>
          <p className="text-sm leading-relaxed opacity-90">{t(`${key}Desc`)}</p>
        </div>
      ))}
    </div>
  );
}
