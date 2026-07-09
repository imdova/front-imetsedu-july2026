"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  Wallet, Users, UserPlus, TrendingUp, BookOpen, GraduationCap, Hourglass, BadgeCheck,
  ArrowUpRight, ArrowDownRight, Loader2, type LucideIcon,
} from "lucide-react";

import { dal } from "@/lib/dal";
import type { PlatformStats, PlatformStatsRange } from "@/lib/dal/platform";
import { cn } from "@/lib/utils";

const RANGES: { value: PlatformStatsRange; key: string }[] = [
  { value: "7d", key: "range7d" },
  { value: "30d", key: "range30d" },
  { value: "90d", key: "range90d" },
  { value: "all", key: "rangeAll" },
];

type Tone = "emerald" | "blue" | "violet" | "amber" | "sky" | "indigo" | "rose" | "teal";

const TONE: Record<Tone, string> = {
  emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  violet: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  amber: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  sky: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  indigo: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  rose: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  teal: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
};

const nfmt = (n: number) => n.toLocaleString();
const money = (n: number) => `$${n.toLocaleString()}`;

interface CardModel {
  key: string;
  icon: LucideIcon;
  tone: Tone;
  value: string;
  label: string;
  sub?: string;
  delta?: number | null; // percent, only where meaningful
}

export function PlatformStatsCards({
  initialStats,
  initialRange = "90d",
}: {
  initialStats: PlatformStats | null;
  initialRange?: PlatformStatsRange;
}) {
  const t = useTranslations("Platform");
  const [range, setRange] = React.useState<PlatformStatsRange>(initialRange);
  const [stats, setStats] = React.useState<PlatformStats | null>(initialStats);
  const [loading, setLoading] = React.useState(false);
  const skipInitial = React.useRef(true);

  React.useEffect(() => {
    if (skipInitial.current) { skipInitial.current = false; return; } // SSR already provided the initial range
    let cancelled = false;
    setLoading(true);
    dal.platform.fetchPlatformStats(range).then((res) => {
      if (cancelled) return;
      if (res.ok) setStats(res.data);
      else toast.error(res.error);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [range]);

  const selector = (
    <div className="inline-flex items-center gap-1 rounded-xl bg-muted/60 p-1">
      {loading && <Loader2 className="ms-1 size-3.5 animate-spin text-muted-foreground" />}
      {RANGES.map((r) => (
        <button
          key={r.value}
          onClick={() => setRange(r.value)}
          className={cn(
            "rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
            range === r.value ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {t(r.key)}
        </button>
      ))}
    </div>
  );

  if (!stats) {
    return (
      <div className="space-y-3">
        <div className="flex justify-end">{selector}</div>
        <div className="rounded-2xl border border-dashed border-border/70 py-10 text-center text-sm text-muted-foreground">No stats available for this period.</div>
      </div>
    );
  }

  const cards: CardModel[] = [
    {
      key: "revenue", icon: Wallet, tone: "emerald",
      value: money(stats.revenue.value), label: t("statRevenue"),
      sub: t("statRevenueSub"), delta: stats.revenue.changePercent,
    },
    {
      key: "students", icon: Users, tone: "blue",
      value: nfmt(stats.students.total), label: t("statStudents"),
      sub: t("statStudentsSub", { active: nfmt(stats.students.active), inactive: nfmt(stats.students.inactive) }),
    },
    {
      key: "leads", icon: UserPlus, tone: "violet",
      value: nfmt(stats.newLeads.period), label: t("statNewLeads"),
      sub: t("statNewLeadsSub", { count: nfmt(stats.newLeads.allTime) }),
    },
    {
      key: "conversion", icon: TrendingUp, tone: "amber",
      value: `${stats.conversion.rate}%`, label: t("statConversion"),
      sub: t("statConversionSub", { enrolled: nfmt(stats.conversion.enrolled), total: nfmt(stats.conversion.totalLeads) }),
    },
    {
      key: "courses", icon: BookOpen, tone: "sky",
      value: nfmt(stats.lmsCourses.total), label: t("statActiveCourses"),
      sub: t("statActiveCoursesSub", { count: nfmt(stats.lmsCourses.draft) }),
    },
    {
      key: "enrollments", icon: GraduationCap, tone: "indigo",
      value: nfmt(stats.lmsCourses.enrolled), label: t("statLmsEnrollments"),
      sub: t("statLmsEnrollmentsSub"),
    },
    {
      key: "pending", icon: Hourglass, tone: "rose",
      value: money(stats.pendingPayments.value), label: t("statPendingPayments"),
      sub: t("statPendingPaymentsSub", { count: nfmt(stats.pendingPayments.count) }),
    },
    {
      key: "success", icon: BadgeCheck, tone: "teal",
      value: `${stats.pendingPayments.successRate}%`, label: t("statPaymentSuccess"),
      sub: t("statPaymentSuccessSub"),
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{t("statSectionTitle")}</p>
        {selector}
      </div>
      <div className={cn("grid gap-4 transition-opacity sm:grid-cols-2 xl:grid-cols-4", loading && "pointer-events-none opacity-60")}>
      {cards.map((c) => {
        const hasDelta = c.delta !== null && c.delta !== undefined;
        const up = (c.delta ?? 0) >= 0;
        return (
          <div key={c.key} className="group flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
            <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", TONE[c.tone])}>
              <c.icon className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xl font-bold leading-tight tracking-tight tabular-nums text-foreground">{c.value}</p>
                {hasDelta && (
                  <span className={cn(
                    "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold",
                    up ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                       : "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
                  )}>
                    {up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                    {Math.abs(c.delta as number)}%
                  </span>
                )}
              </div>
              <p className="truncate text-sm font-medium text-foreground">{c.label}</p>
              {c.sub && <p className="truncate text-xs text-muted-foreground">{c.sub}</p>}
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
}
