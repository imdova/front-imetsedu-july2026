"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { PlayCircle, CheckCircle2 } from "lucide-react";

import { Link } from "@/i18n/navigation";
import type { EnrolledCourse } from "@/lib/db/student";
import { Button } from "@/components/ui/button";

export function CourseProgressCard({ course }: { course: EnrolledCourse }) {
  const t = useTranslations("Student");
  const done = course.progress >= 100;

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
      <div className="relative aspect-video bg-muted">
        <Image src={course.thumbnailUrl} alt={course.title} fill sizes="(max-width:768px)100vw,33vw" className="object-cover" />
        {done && (
          <span className="absolute end-3 top-3 inline-flex items-center gap-1 rounded-full bg-success px-2 py-0.5 text-xs font-medium text-white">
            <CheckCircle2 className="size-3.5" /> {t("completedLabel")}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="line-clamp-1 font-heading text-base font-semibold">{course.title}</h3>
          <p className="text-sm text-muted-foreground">{course.instructor}</p>
        </div>
        <div className="mt-auto space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{t("lessonsOf", { done: course.completedLessons, total: course.totalLessons })}</span>
            <span className="font-medium text-foreground tabular-nums">{course.progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${course.progress}%` }} />
          </div>
        </div>
        <Button asChild size="sm" className="gap-1.5">
          <Link href={`/student/courses/${course.slug}`}>
            <PlayCircle className="size-4" />
            {done ? t("viewAll") : t("continueBtn")}
          </Link>
        </Button>
      </div>
    </div>
  );
}
