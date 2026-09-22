"use client";

import * as React from "react";
import {
  Banknote,
  CalendarClock,
  GraduationCap,
  Loader2,
  Percent,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react";

import { dal } from "@/lib/dal";
import type { StaffPerformance } from "@/lib/dal/staff-insights";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "@/components/shared/kpi-card";
import { BarList, DonutStat, TrendChart } from "./insight-charts";

const RANGES = [30, 90, 365] as const;

const num = (n: number) => n.toLocaleString("en-US");
const egp = (n: number) => `EGP ${Math.round(n).toLocaleString("en-US")}`;
const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";

/**
 * The Performance tab: this person's CRM results, money, training and a daily
 * trend, over a window the admin picks. Everything is derived from records
 * that already name them (leads by counselor, their leads' payments, their
 * commission deals, their orientation progress).
 */
export function UserPerformance({ userId, initial }: { userId: string; initial: StaffPerformance | null }) {
  const [days, setDays] = React.useState<number>(initial?.range.days ?? 90);
  const [data, setData] = React.useState<StaffPerformance | null>(initial);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(initial ? null : "Couldn't load performance data.");

  const load = async (next: number) => {
    setDays(next);
    setLoading(true);
    const res = await dal.staffInsights.fetchStaffPerformance(userId, next);
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setError(null);
    setData(res.data);
  };

  if (!data) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">{error ?? "No data."}</CardContent>
      </Card>
    );
  }

  const { leads, revenue, commission, followUps, activity, orientation, series } = data;
  const trend = series.map((p) => ({ date: p.date, leads: p.leads, activities: p.activities, collected: p.collected }));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-full border border-border/70 bg-muted p-1">
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              aria-pressed={days === r}
              onClick={() => load(r)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                days === r ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {r === 365 ? "12 months" : `${r} days`}
            </button>
          ))}
        </div>
        {loading && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
        {error && <span className="text-xs text-destructive">{error}</span>}
        <span className="ms-auto text-xs text-muted-foreground">
          Totals are all-time; the chart and “new leads” follow the window.
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Leads assigned" value={num(leads.total)} icon={Target} helperText={`${num(leads.inRange)} new in this window`} />
        <KpiCard
          label="Enrolled"
          value={num(leads.enrolled)}
          icon={GraduationCap}
          intent="success"
          helperText={`${leads.conversionRate}% conversion · ${num(leads.open)} still open`}
        />
        <KpiCard label="Collected" value={egp(revenue.collected)} icon={Banknote} intent="info" helperText={`${num(revenue.payments)} payment records`} />
        <KpiCard
          label="Outstanding"
          value={egp(revenue.outstanding)}
          icon={Wallet}
          intent={revenue.outstanding > 0 ? "warning" : "primary"}
          helperText={`${num(revenue.invoices)} invoices`}
        />
        <KpiCard label="Commission" value={egp(commission.total)} icon={Percent} helperText={`${num(commission.deals)} deals recorded`} />
        <KpiCard
          label="Follow-ups due"
          value={num(followUps.overdue + followUps.today)}
          icon={CalendarClock}
          intent={followUps.overdue > 0 ? "destructive" : "primary"}
          helperText={`${num(followUps.overdue)} overdue · ${num(followUps.today)} today · ${num(followUps.upcoming)} upcoming`}
        />
        <KpiCard
          label="Lead activity logged"
          value={num(activity.total)}
          icon={TrendingUp}
          helperText={`${num(activity.inRange)} in this window`}
        />
        <KpiCard
          label="Pipeline value"
          value={egp(leads.estimatedValue)}
          icon={Banknote}
          helperText={`${egp(leads.enrolledValue)} of it enrolled`}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Activity trend</CardTitle>
        </CardHeader>
        <CardContent>
          <TrendChart
            data={trend}
            series={[
              { key: "leads", label: "New leads", color: "var(--primary)", area: true },
              { key: "activities", label: "Logged actions", color: "var(--chart-4, #10b981)" },
              { key: "collected", label: "Collected", color: "var(--warning, #f59e0b)", format: egp },
            ]}
          />
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pipeline stages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <DonutStat percent={leads.conversionRate} label="conversion" sublabel={`${num(leads.enrolled)} of ${num(leads.total)} leads enrolled`} />
            </div>
            <BarList items={leads.byStage} emptyLabel="No leads assigned" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Lead sources</CardTitle>
          </CardHeader>
          <CardContent>
            <BarList items={leads.bySource.slice(0, 8)} color="var(--chart-4, #10b981)" emptyLabel="No leads assigned" />
            <p className="mt-4 mb-2 text-xs font-semibold text-muted-foreground">Priority</p>
            <BarList items={leads.byPriority} color="var(--warning, #f59e0b)" emptyLabel="—" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">What they log</CardTitle>
          </CardHeader>
          <CardContent>
            <BarList
              items={activity.byAction.slice(0, 8)}
              emptyLabel="No lead actions recorded under this user yet"
            />
            {commission.months.length > 0 && (
              <>
                <p className="mt-4 mb-2 text-xs font-semibold text-muted-foreground">Commission by month</p>
                <BarList
                  items={commission.months.slice(-6).map((m) => ({ name: m.month, value: m.amount }))}
                  color="var(--info, #0ea5e9)"
                  format={egp}
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sales Orientation</CardTitle>
        </CardHeader>
        <CardContent>
          {!orientation ? (
            <p className="text-sm text-muted-foreground">Hasn&apos;t started the orientation.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
              <DonutStat percent={orientation.percent} label="complete" color="var(--chart-4, #10b981)" />
              <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                <Row label="Lessons">{`${num(orientation.completed)} of ${num(orientation.total || 0)}`}</Row>
                <Row label="XP earned">{num(orientation.xp)}</Row>
                <Row label="Knowledge check">
                  {orientation.quizScore !== null ? `${orientation.quizScore}/${orientation.quizTotal}` : "—"}
                </Row>
                <Row label="Started">{fmtDate(orientation.startedAt)}</Row>
                <Row label="Finished">{fmtDate(orientation.completedAt)}</Row>
                <Row label="Signed off">{fmtDate(orientation.signedOffAt)}</Row>
              </dl>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-border/40 pb-1.5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium tabular-nums">{children}</dd>
    </div>
  );
}
