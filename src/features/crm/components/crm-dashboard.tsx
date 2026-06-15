"use client";

import { useTranslations } from "next-intl";
import { Users, UserPlus, TrendingUp, Wallet, CalendarClock, Flame, Activity, GraduationCap } from "lucide-react";

import type { CrmStats, Lead } from "@/lib/db/crm";
import { cn, formatCompact, formatCurrency, getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { STAGE_ACCENT, STAGE_LABEL_KEY } from "../lib/maps";

export function CrmDashboard({ stats }: { stats: CrmStats }) {
  const t = useTranslations("Crm");
  const tr = t as unknown as (k: string) => string;
  const maxStage = Math.max(...stats.byStage.map((s) => s.count), 1);
  const maxSource = Math.max(...stats.bySource.map((s) => s.count), 1);
  const recentLeads = stats.recentLeads ?? [];

  const kpis = [
    { label: t("kpiTotalLeads"), value: `${stats.totalLeads}`, icon: Users, tone: "bg-primary/10 text-primary" },
    { label: t("kpiNewThisWeek"), value: `${stats.newThisWeek}`, icon: UserPlus, tone: "bg-chart-3/15 text-chart-3" },
    { label: t("kpiHotLeads"), value: `${stats.hotLeads ?? 0}`, icon: Flame, tone: "bg-destructive/12 text-destructive" },
    { label: t("kpiInFlight"), value: `${stats.inFlight ?? 0}`, icon: Activity, tone: "bg-chart-2/15 text-chart-2" },
    { label: t("kpiConversion"), value: `${stats.conversionRate}%`, icon: TrendingUp, tone: "bg-success/12 text-success" },
    { label: t("kpiPipelineValue"), value: formatCurrency(stats.pipelineValue, "EGP"), icon: Wallet, tone: "bg-warning/18 text-warning" },
    { label: t("kpiOverdue"), value: `${stats.overdueFollowUps}`, icon: CalendarClock, tone: "bg-destructive/12 text-destructive" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {kpis.map((k) => (
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

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("leadsByStage")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3.5">
            {stats.byStage.map((s) => (
              <div key={s.key} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="inline-flex items-center gap-2">
                    <span className={cn("size-2 rounded-full", STAGE_ACCENT[s.key])} />
                    {tr(STAGE_LABEL_KEY[s.key])}
                  </span>
                  <span className="tabular-nums text-muted-foreground">{s.count}</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                  <div className={cn("h-full rounded-full", STAGE_ACCENT[s.key])}
                    style={{ width: `${Math.round((s.count / maxStage) * 100)}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("leadsBySource")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3.5">
            {stats.bySource.map((s) => (
              <div key={s.source} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span>{s.source}</span>
                  <span className="tabular-nums text-muted-foreground">{s.count}</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-gradient-to-r from-primary to-[oklch(0.62_0.19_286)]"
                    style={{ width: `${Math.round((s.count / maxSource) * 100)}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("counselorPerformance")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-border/60">
            {stats.byCounselor.map((c) => (
              <li key={c.name} className="flex items-center gap-3 py-3 first:pt-0">
                <Avatar className="size-9 border">
                  <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                    {c.initials}
                  </AvatarFallback>
                </Avatar>
                <span className="flex-1 text-sm font-medium">{c.name}</span>
                {c.hot ? (
                  <Badge className="gap-1 border-transparent bg-destructive/12 text-[0.65rem] text-destructive">
                    <Flame className="size-3" />{t("hotCount", { n: c.hot })}
                  </Badge>
                ) : null}
                <span className="text-sm text-muted-foreground">
                  {formatCompact(c.leads)} {t("leadsCol")}
                </span>
                <span className="w-16 text-end text-sm font-medium tabular-nums text-success">
                  {c.conversion}%
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Recent leads activity */}
      <Card>
        <CardHeader>
          <CardTitle>{t("recentLeadsTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          {recentLeads.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">{t("recentLeadsEmpty")}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-sm">
                <thead>
                  <tr className="border-b text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-3 py-2.5 text-start font-semibold">{t("colLead")}</th>
                    <th className="px-3 py-2.5 text-start font-semibold">{t("colStage")}</th>
                    <th className="px-3 py-2.5 text-start font-semibold">{t("sumCourse")}</th>
                    <th className="px-3 py-2.5 text-start font-semibold">{t("sumSource")}</th>
                    <th className="px-3 py-2.5 text-end font-semibold">{t("colCreated")}</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLeads.map((l: Lead) => (
                    <tr key={l.id} className="border-b last:border-0">
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="size-8 border"><AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">{getInitials(l.fullName)}</AvatarFallback></Avatar>
                          <div className="min-w-0">
                            <p className="truncate font-medium leading-tight">{l.fullName}</p>
                            <p className="truncate text-xs text-muted-foreground tabular-nums" dir="ltr">{l.phoneCountryCode}{l.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium">
                          <span className={cn("size-2 rounded-full", STAGE_ACCENT[l.stageKey])} />
                          {tr(STAGE_LABEL_KEY[l.stageKey])}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                          <GraduationCap className="size-3.5 shrink-0" />
                          <span className="line-clamp-1 max-w-[180px]">{l.courseNames?.[0] ?? "—"}</span>
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-muted-foreground">{l.source || "—"}</td>
                      <td className="px-3 py-2.5 text-end text-xs text-muted-foreground">{l.createdAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
