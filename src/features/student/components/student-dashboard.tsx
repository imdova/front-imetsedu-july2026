"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { BookOpen, TrendingUp, Award, CalendarDays, PlayCircle, ArrowRight } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { ROUTES } from "@integration/constants";
import type { EnrolledCourse, Grade, ScheduleEvent } from "@/lib/db/student";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface DashboardData {
  stats: { enrolled: number; avgProgress: number; certificates: number; upcoming: number };
  continueCourse: EnrolledCourse;
  upcomingEvents: ScheduleEvent[];
  recentGrades: Grade[];
}

const KIND_KEY: Record<string, string> = {
  "live-class": "kindLiveClass", deadline: "kindDeadline", exam: "kindExam",
  "office-hours": "kindOfficeHours", workshop: "kindWorkshop",
};

export function StudentDashboard({ data }: { data: DashboardData }) {
  const t = useTranslations("Student");
  const tr = t as unknown as (k: string) => string;
  const c = data.continueCourse;

  const stats = [
    { label: t("statEnrolled"), value: `${data.stats.enrolled}`, icon: BookOpen, tone: "bg-primary/10 text-primary" },
    { label: t("statProgress"), value: `${data.stats.avgProgress}%`, icon: TrendingUp, tone: "bg-success/12 text-success" },
    { label: t("statCertificates"), value: `${data.stats.certificates}`, icon: Award, tone: "bg-warning/18 text-warning" },
    { label: t("statUpcoming"), value: `${data.stats.upcoming}`, icon: CalendarDays, tone: "bg-chart-3/15 text-chart-3" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-border/70 bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground">{s.label}</p>
              <span className={cn("grid size-8 place-items-center rounded-lg", s.tone)}><s.icon className="size-4" /></span>
            </div>
            <p className="mt-3 font-heading text-2xl font-semibold tabular-nums">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Continue learning */}
      <Card className="overflow-hidden">
        <div className="grid md:grid-cols-[260px_1fr]">
          <div className="relative aspect-video md:aspect-auto">
            <Image src={c.thumbnailUrl} alt={c.title} fill sizes="260px" className="object-cover" />
          </div>
          <CardContent className="flex flex-col justify-center gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">{t("continueLearning")}</p>
            <h2 className="font-heading text-xl font-bold">{c.title}</h2>
            <p className="text-sm text-muted-foreground">{c.instructor}</p>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{t("lessonsOf", { done: c.completedLessons, total: c.totalLessons })}</span>
                <span className="font-medium text-foreground tabular-nums">{c.progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: `${c.progress}%` }} />
              </div>
            </div>
            <Button asChild className="mt-1 w-fit gap-1.5">
              <Link href={ROUTES.STUDENT.COURSE_OVERVIEW(c.id)}><PlayCircle className="size-4" />{t("resume")}</Link>
            </Button>
          </CardContent>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t("upcomingEvents")}</CardTitle>
              <Button asChild variant="ghost" size="sm" className="gap-1.5">
                <Link href="/student/schedule">{t("viewAll")}<ArrowRight className="size-4 rtl:rotate-180" /></Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border/60">
              {data.upcomingEvents.map((e) => (
                <li key={e.id} className="flex items-center gap-3 py-3 first:pt-0">
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-muted text-center text-xs font-semibold leading-tight">
                    {e.day}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{e.title}</p>
                    <p className="text-xs text-muted-foreground">{e.time} · {e.courseCode}</p>
                  </div>
                  <Badge variant="secondary" className="text-[0.7rem]">{tr(KIND_KEY[e.kind] ?? "kindLiveClass")}</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t("recentGrades")}</CardTitle>
              <Button asChild variant="ghost" size="sm" className="gap-1.5">
                <Link href="/student/grades">{t("viewAll")}<ArrowRight className="size-4 rtl:rotate-180" /></Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border/60">
              {data.recentGrades.map((g) => (
                <li key={g.id} className="flex items-center gap-3 py-3 first:pt-0">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{g.item}</p>
                    <p className="truncate text-xs text-muted-foreground">{g.course}</p>
                  </div>
                  <span className="font-heading text-sm font-semibold tabular-nums text-success">
                    {g.score}/{g.max}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
