"use client";

import { useTranslations } from "next-intl";
import { Mail, CalendarDays, Star, Users, GraduationCap } from "lucide-react";

import type { InstructorDetail as InstructorDetailModel } from "@/lib/db/admin";
import { formatCompact } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminStatusBadge } from "./admin-status-badge";

export function InstructorDetail({ instructor }: { instructor: InstructorDetailModel }) {
  const t = useTranslations("Admin");

  const stats = [
    { label: t("totalStudents"), value: formatCompact(instructor.totalStudents), icon: Users },
    { label: t("colCourses"), value: `${instructor.courses}`, icon: GraduationCap },
    { label: t("colRating"), value: instructor.rating > 0 ? instructor.rating.toFixed(1) : "—", icon: Star },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      <Card className="h-fit">
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-center gap-3">
            <Avatar className="size-14 border">
              <AvatarFallback className="bg-primary/10 font-medium text-primary">{instructor.initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate font-heading text-lg font-semibold">{instructor.name}</p>
              <p className="truncate text-sm text-muted-foreground">{instructor.titleEn}</p>
              <div className="mt-1"><AdminStatusBadge value={instructor.status} /></div>
            </div>
          </div>
          <dl className="space-y-2.5 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground"><Mail className="size-4" />{instructor.email}</div>
            <div className="flex items-center gap-2 text-muted-foreground"><CalendarDays className="size-4" />{t("joinedLabel")}: {instructor.joinedAt}</div>
          </dl>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("bioLabel")}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{instructor.bio}</p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {stats.map((s) => (
            <Card key={s.label}>
              <CardContent className="space-y-2 pt-5">
                <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary"><s.icon className="size-[18px]" /></span>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="font-heading text-2xl font-semibold tabular-nums">{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">{t("sectionCoursesTaught")}</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {instructor.courseList.map((c) => (
              <div key={c.title} className="flex items-center justify-between gap-3 border-b border-border/50 py-2.5 text-sm last:border-0">
                <span className="min-w-0 truncate font-medium">{c.title}</span>
                <div className="flex shrink-0 items-center gap-4 text-muted-foreground">
                  <span className="inline-flex items-center gap-1 tabular-nums"><Users className="size-3.5" />{formatCompact(c.students)}</span>
                  <span className="inline-flex items-center gap-1 tabular-nums"><Star className="size-3.5 fill-warning text-warning" />{c.rating.toFixed(1)}</span>
                  <AdminStatusBadge value={c.status} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
