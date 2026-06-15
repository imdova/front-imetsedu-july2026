"use client";

import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { CourseStatus, Difficulty } from "@/types";

const STATUS_STYLES: Record<CourseStatus, string> = {
  published:
    "border-transparent bg-success/15 text-success [a&]:hover:bg-success/25",
  draft: "border-transparent bg-muted text-muted-foreground",
};

export function StatusBadge({ status }: { status: CourseStatus }) {
  const t = useTranslations("Courses");
  return <Badge className={STATUS_STYLES[status]}>{t(status)}</Badge>;
}

const DIFFICULTY_STYLES: Record<Difficulty, string> = {
  Beginner: "border-transparent bg-chart-4/15 text-chart-4",
  Intermediate: "border-transparent bg-chart-3/15 text-chart-3",
  Advanced: "border-transparent bg-primary/15 text-primary",
};

export function DifficultyBadge({ level }: { level: Difficulty }) {
  return <Badge className={DIFFICULTY_STYLES[level]}>{level}</Badge>;
}
