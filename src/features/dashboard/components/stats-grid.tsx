"use client";

import { useTranslations } from "next-intl";
import { Users, GraduationCap, Banknote, TrendingUp } from "lucide-react";

import type { AdminStats } from "@/types";
import { formatCompact, formatCurrency } from "@/lib/utils";
import { StatCard } from "@/components/shared/stat-card";

/**
 * Client component that owns the icon mapping — lucide components are functions
 * and can't be serialized across the server→client boundary, so the card
 * definitions live here and only the plain `stats` object is passed in.
 */
export function StatsGrid({ stats }: { stats: AdminStats }) {
  const t = useTranslations("Dashboard");
  const cards = [
    {
      label: t("totalStudents"),
      value: formatCompact(stats.allStudents),
      delta: 12.4,
      icon: Users,
    },
    {
      label: t("activeCourses"),
      value: `${stats.activeCourses}`,
      delta: 4.1,
      icon: GraduationCap,
    },
    {
      label: t("totalSales"),
      value: formatCurrency(stats.totalSales, "EGP"),
      delta: 8.6,
      icon: Banknote,
    },
    {
      label: t("netProfit"),
      value: formatCurrency(stats.netProfit, "EGP"),
      delta: -2.3,
      icon: TrendingUp,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((c, i) => (
        <StatCard key={c.label} index={i} deltaLabel={t("vsLastMonth")} {...c} />
      ))}
    </div>
  );
}
