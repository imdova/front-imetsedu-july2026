"use client";

import { useTranslations } from "next-intl";
import {
  GraduationCap, Wallet, Receipt, AlertTriangle, Bell, ArrowUpRight, Info, Users, Globe, Layers,
} from "lucide-react";

import type {
  TopCourse, DashCounselor, RecentTxn, PipelineRow, DashAlert, LmsOverview, CountryStat, ActiveBatch,
} from "@/lib/db/platform";
import { cn, formatCurrency, getInitials } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STAGE_ACCENT, STAGE_LABEL_KEY } from "@/features/crm/lib/maps";

/* ── Top courses by revenue ── */
export function TopCoursesCard({ courses }: { courses: TopCourse[] }) {
  const t = useTranslations("Platform");
  const max = Math.max(...courses.map((c) => c.revenue), 1);
  return (
    <Card>
      <CardHeader><CardTitle className="inline-flex items-center gap-2 text-base"><GraduationCap className="size-4 text-primary" />{t("dashTopCourses")}</CardTitle></CardHeader>
      <CardContent className="space-y-3.5">
        {courses.length === 0 ? <Empty label={t("dashNoData")} /> : courses.map((c, i) => (
          <div key={i} className="space-y-1.5">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="line-clamp-1 font-medium">{c.name}</span>
              <span className="shrink-0 tabular-nums font-semibold">{formatCurrency(c.revenue, "EGP")}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-gradient-to-r from-primary to-[oklch(0.62_0.19_286)]" style={{ width: `${Math.round((c.revenue / max) * 100)}%` }} />
            </div>
            <p className="text-xs text-muted-foreground">{t("dashEnrollments", { n: c.enrollments })}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/* ── Lead pipeline distribution ── */
export function LeadPipelineCard({ rows }: { rows: PipelineRow[] }) {
  const t = useTranslations("Platform");
  const tc = useTranslations("Crm");
  const max = Math.max(...rows.map((r) => r.count), 1);
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">{t("dashPipeline")}</CardTitle></CardHeader>
      <CardContent className="space-y-3.5">
        {rows.map((r) => (
          <div key={r.key} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="inline-flex items-center gap-2">
                <span className={cn("size-2 rounded-full", STAGE_ACCENT[r.key])} />
                {tc(STAGE_LABEL_KEY[r.key] as never)}
              </span>
              <span className="tabular-nums text-muted-foreground">{r.count} · {r.percentage}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-muted">
              <div className={cn("h-full rounded-full", STAGE_ACCENT[r.key])} style={{ width: `${Math.round((r.count / max) * 100)}%` }} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

const TXN_STYLE: Record<string, string> = {
  paid: "bg-success/15 text-success", sent: "bg-chart-3/15 text-chart-3",
  overdue: "bg-destructive/12 text-destructive", partial: "bg-warning/18 text-warning",
  draft: "bg-muted text-muted-foreground", cancelled: "bg-muted text-muted-foreground",
};

/* ── Recent transactions ── */
export function RecentTransactionsCard({ txns }: { txns: RecentTxn[] }) {
  const t = useTranslations("Platform");
  return (
    <Card>
      <CardHeader><CardTitle className="inline-flex items-center gap-2 text-base"><Receipt className="size-4 text-primary" />{t("dashRecentTxns")}</CardTitle></CardHeader>
      <CardContent>
        {txns.length === 0 ? <Empty label={t("dashNoData")} /> : (
          <ul className="divide-y divide-border/60">
            {txns.map((x) => (
              <li key={x.id || x.number} className="flex items-center gap-3 py-2.5 first:pt-0">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground"><Wallet className="size-4" /></span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{x.customer}</p>
                  <p className="truncate font-mono text-xs text-muted-foreground">{x.number}</p>
                </div>
                <div className="text-end">
                  <p className="text-sm font-semibold tabular-nums">{formatCurrency(x.amount, x.currency as "EGP")}</p>
                  <Badge className={cn("mt-0.5 border-transparent text-[0.6rem] capitalize", TXN_STYLE[x.status] ?? "bg-muted")}>{x.status}</Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

/* ── Top counselors leaderboard ── */
export function TopCounselorsCard({ counselors }: { counselors: DashCounselor[] }) {
  const t = useTranslations("Platform");
  return (
    <Card>
      <CardHeader><CardTitle className="inline-flex items-center gap-2 text-base"><Users className="size-4 text-primary" />{t("dashTopCounselors")}</CardTitle></CardHeader>
      <CardContent>
        {counselors.length === 0 ? <Empty label={t("dashNoData")} /> : (
          <ul className="divide-y divide-border/60">
            {counselors.map((c, i) => (
              <li key={i} className="flex items-center gap-3 py-2.5 first:pt-0">
                <Avatar className="size-9 border"><AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">{getInitials(c.name)}</AvatarFallback></Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{t("dashLeadsCount", { n: c.totalLeads })} · {t("dashEnrollments", { n: c.enrolled })}</p>
                </div>
                <span className="text-sm font-semibold tabular-nums text-success">{c.conversionRate}%</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

/* ── Priority alerts / AI insights ── */
export function AlertsCard({ alerts }: { alerts: DashAlert[] }) {
  const t = useTranslations("Platform");
  return (
    <Card>
      <CardHeader><CardTitle className="inline-flex items-center gap-2 text-base"><Bell className="size-4 text-primary" />{t("dashAlerts")}</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {alerts.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">{t("dashNoAlerts")}</p>
        ) : alerts.map((a, i) => {
          const urgent = a.type === "action_required";
          return (
            <div key={i} className={cn("rounded-xl border p-3", urgent ? "border-destructive/30 bg-destructive/[0.05]" : "border-warning/30 bg-warning/[0.05]")}>
              <p className={cn("inline-flex items-center gap-1.5 text-sm font-semibold", urgent ? "text-destructive" : "text-warning")}>
                {urgent ? <AlertTriangle className="size-4" /> : <Info className="size-4" />}{a.title}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{a.description}</p>
              {a.action && (
                <Link href={a.link} className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                  {a.action}<ArrowUpRight className="size-3 rtl:-scale-x-100" />
                </Link>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

/* ── LMS courses overview ── */
export function LmsOverviewCard({ data }: { data: LmsOverview }) {
  const t = useTranslations("Platform");
  const total = Math.max(data.active + data.draft, 1);
  const activePct = Math.round((data.active / total) * 100);
  return (
    <Card>
      <CardHeader><CardTitle className="inline-flex items-center gap-2 text-base"><GraduationCap className="size-4 text-primary" />{t("dashLmsOverview")}</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="font-heading text-3xl font-semibold tabular-nums">{data.totalStudents}</p>
            <p className="text-xs text-muted-foreground">{t("dashEnrolledStudents")}</p>
          </div>
          <div className="text-end">
            <p className="text-sm font-semibold tabular-nums text-success">{data.avgCompletion}%</p>
            <p className="text-xs text-muted-foreground">{t("dashAvgCompletion")}</p>
          </div>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary" style={{ width: `${activePct}%` }} />
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary" />{t("dashActiveCourses", { n: data.active })}</span>
          <span className="inline-flex items-center gap-1.5 text-muted-foreground"><span className="size-2 rounded-full bg-muted-foreground/40" />{t("dashDraftCourses", { n: data.draft })}</span>
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Students by country ── */
export function StudentsByCountryCard({ rows }: { rows: CountryStat[] }) {
  const t = useTranslations("Platform");
  const max = Math.max(...rows.map((r) => r.count), 1);
  return (
    <Card>
      <CardHeader><CardTitle className="inline-flex items-center gap-2 text-base"><Globe className="size-4 text-primary" />{t("dashByCountry")}</CardTitle></CardHeader>
      <CardContent className="space-y-3.5">
        {rows.length === 0 ? <Empty label={t("dashNoData")} /> : rows.map((r) => (
          <div key={r.country} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{r.country}</span>
              <span className="tabular-nums text-muted-foreground">{r.count}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-chart-2" style={{ width: `${Math.round((r.count / max) * 100)}%` }} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/* ── Active batches ── */
export function ActiveBatchesCard({ batches }: { batches: ActiveBatch[] }) {
  const t = useTranslations("Platform");
  return (
    <Card>
      <CardHeader><CardTitle className="inline-flex items-center gap-2 text-base"><Layers className="size-4 text-primary" />{t("dashActiveBatches")}</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {batches.length === 0 ? <Empty label={t("dashNoData")} /> : batches.map((b, i) => {
          const pct = b.capacity > 0 ? Math.min(100, Math.round((b.enrolled / b.capacity) * 100)) : 0;
          return (
            <div key={i} className="space-y-1.5">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="line-clamp-1 font-medium">{b.title}</span>
                <span className="shrink-0 tabular-nums text-muted-foreground">{b.enrolled}/{b.capacity}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className={cn("h-full rounded-full", pct >= 90 ? "bg-destructive" : "bg-success")} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function Empty({ label }: { label: string }) {
  return <p className="py-6 text-center text-sm text-muted-foreground">{label}</p>;
}
