"use client";

import { useTranslations } from "next-intl";
import { Users, GraduationCap, Star, Wallet, ClipboardList, CalendarDays } from "lucide-react";

import type { InstructorStats, InstructorEvent, CoursePerformance } from "@/lib/db/instructor";
import type { RevenuePoint } from "@/lib/db/platform";
import { formatCompact, formatCurrency } from "@/lib/utils";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RevenueChart } from "@/features/dashboard/components/revenue-chart";
import { EventsList } from "./events-list";

export function InstructorDashboard({
  stats,
  revenue,
  events,
  performance,
}: {
  stats: InstructorStats;
  revenue: RevenuePoint[];
  events: InstructorEvent[];
  performance: CoursePerformance[];
}) {
  const t = useTranslations("Instructor");

  const cards = [
    { label: t("statStudents"), value: formatCompact(stats.students), delta: 9.2, icon: Users },
    { label: t("statCourses"), value: `${stats.activeCourses}`, delta: 0, icon: GraduationCap },
    { label: t("statRating"), value: stats.avgRating.toFixed(1), delta: 1.4, icon: Star },
    { label: t("statEarnings"), value: formatCurrency(stats.monthlyEarnings, "EGP"), delta: 12.8, icon: Wallet },
    { label: t("statPending"), value: `${stats.pendingGrading}`, icon: ClipboardList },
    { label: t("statEvents"), value: `${stats.upcomingEvents}`, icon: CalendarDays },
  ];

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-primary">{t("dashTitle")}</h1>
        <p className="text-sm text-muted-foreground">{t("dashSubtitle")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((c, i) => (
          <StatCard key={c.label} index={i} deltaLabel={t("vsLastMonth")} {...c} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-2">
          <h2 className="font-heading text-base font-semibold">{t("revenueTitle")}</h2>
          <RevenueChart data={revenue} />
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("upcomingEventsTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <EventsList items={events.filter((e) => e.status !== "ended").slice(0, 4)} compact />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("topCoursesTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/70 text-start text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-6 py-2.5 text-start font-semibold">{t("colCourse")}</th>
                  <th className="px-6 py-2.5 text-end font-semibold">{t("colStudents")}</th>
                  <th className="px-6 py-2.5 text-end font-semibold">{t("colCompletion")}</th>
                  <th className="px-6 py-2.5 text-end font-semibold">{t("colRating")}</th>
                  <th className="px-6 py-2.5 text-end font-semibold">{t("colRevenue")}</th>
                </tr>
              </thead>
              <tbody>
                {performance.map((p) => (
                  <tr key={p.id} className="border-b border-border/50 last:border-0">
                    <td className="px-6 py-3 font-medium">{p.course}</td>
                    <td className="px-6 py-3 text-end tabular-nums">{formatCompact(p.students)}</td>
                    <td className="px-6 py-3 text-end tabular-nums">{p.completion}%</td>
                    <td className="px-6 py-3 text-end tabular-nums">
                      <span className="inline-flex items-center gap-1">
                        <Star className="size-3.5 fill-warning text-warning" />
                        {p.rating.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-end font-medium tabular-nums">{formatCurrency(p.revenue, "EGP")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
