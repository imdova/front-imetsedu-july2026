"use client";

import { useTranslations } from "next-intl";

import type { CoursePerformance } from "@/lib/db/instructor";
import type { RevenuePoint } from "@/lib/db/platform";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RevenueChart } from "@/features/dashboard/components/revenue-chart";

export function AnalyticsView({
  revenue,
  performance,
}: {
  revenue: RevenuePoint[];
  performance: CoursePerformance[];
}) {
  const t = useTranslations("Instructor");

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="font-heading text-base font-semibold">{t("enrollmentTrend")}</h2>
        <RevenueChart data={revenue} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("completionByCourse")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {performance.map((p) => (
            <div key={p.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="truncate pe-3 font-medium">{p.course}</span>
                <span className="shrink-0 tabular-nums text-muted-foreground">{p.completion}%</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: `${p.completion}%` }} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
