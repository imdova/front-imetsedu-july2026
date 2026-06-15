"use client";

import { useTranslations } from "next-intl";
import { Banknote, Hourglass, AlertTriangle, Undo2 } from "lucide-react";

import type { FinanceStats } from "@/lib/db/finance";
import { cn, formatCurrency } from "@/lib/utils";

export function FinanceKpis({ stats }: { stats: FinanceStats }) {
  const t = useTranslations("Finance");
  const tiles = [
    { label: t("kpiCollected"), value: formatCurrency(stats.collected, "EGP"), icon: Banknote, tone: "bg-success/12 text-success" },
    { label: t("kpiOutstanding"), value: formatCurrency(stats.outstanding, "EGP"), icon: Hourglass, tone: "bg-warning/18 text-warning" },
    { label: t("kpiOverdue"), value: formatCurrency(stats.overdue, "EGP"), icon: AlertTriangle, tone: "bg-destructive/12 text-destructive" },
    { label: t("kpiRefunded"), value: formatCurrency(stats.refunded, "EGP"), icon: Undo2, tone: "bg-chart-3/15 text-chart-3" },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {tiles.map((k) => (
        <div key={k.label} className="rounded-xl border border-border/70 bg-card p-5 shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground">
              {k.label}
            </p>
            <span className={cn("grid size-8 place-items-center rounded-lg", k.tone)}>
              <k.icon className="size-4" />
            </span>
          </div>
          <p className="mt-3 font-heading text-2xl font-semibold tabular-nums">{k.value}</p>
        </div>
      ))}
    </div>
  );
}
