"use client";

import * as React from "react";
import {
  Coins, TrendingUp, Users, Target, Trophy, BookOpen, DollarSign, Medal, CalendarClock, Info,
} from "lucide-react";

import { dal } from "@/lib/dal";
import { useStore } from "@/store";
import type { Lead } from "@/lib/db/crm";
import { formatCurrency, cn, getInitials } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { KpiCard } from "@/components/shared/kpi-card";

/* ── commission plan ─────────────────────────────────────── */
/**
 * Fixed commission per enrolled customer, by the sales rep's role.
 * TODO: populate this from your role-based commission plan (to be provided) —
 * or wire it to a settings screen. Amounts are 0 until configured, so the
 * customer list is accurate now and the money fills in once the plan is set.
 */
const ROLE_COMMISSION: Record<string, number> = {
  // "Sales Team Leader": 500,
  // "sales": 300,
};
const commissionFor = (roleName?: string) => ROLE_COMMISSION[roleName ?? ""] ?? 0;

/* ── helpers ─────────────────────────────────────────────── */
type Deal = {
  id: string;
  ownerId: string;
  ownerName: string;
  customerName: string;
  courseName: string;
  commission: number;
  enrolledAt: string; // ISO
  month: string; // YYYY-MM
};

/** Last 12 months as { value: "YYYY-MM", label: "July 2026" }. */
function monthOptions(): { value: string; label: string }[] {
  const out: { value: string; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    out.push({ value, label });
  }
  return out;
}

const money = (n: number) => formatCurrency(n, "EGP");

function fmtDateTime(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", {
    year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function leadToDeal(l: Lead): Deal {
  const iso = l.createdAtISO ?? "";
  return {
    id: l.id,
    ownerId: l.counselorId,
    ownerName: l.counselorName || "Unassigned",
    customerName: l.fullName,
    courseName: l.courseNames?.[0] ?? "",
    commission: commissionFor(l.counselorName), // per-role plan (0 until configured)
    enrolledAt: iso,
    month: iso ? iso.slice(0, 7) : "",
  };
}

/* ── main ────────────────────────────────────────────────── */

export function CommissionManager() {
  const user = useStore((s) => s.user);
  const isSuperAdmin = !!user && !user.staffRole;
  const myId = user?.staffId ?? user?.id ?? "";

  const months = React.useMemo(monthOptions, []);
  const [month, setMonth] = React.useState(months[0].value);
  const [deals, setDeals] = React.useState<Deal[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      // Staff see only their own enrolled leads; super-admins see the whole team.
      const res = await dal.crm.fetchLeads({
        stage: "enrolled",
        counselorId: isSuperAdmin ? undefined : myId || undefined,
      });
      if (!alive) return;
      if (res.ok) {
        setDeals(res.data.filter((l) => l.stageKey === "enrolled").map(leadToDeal));
      }
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [isSuperAdmin, myId]);

  const monthDeals = React.useMemo(() => deals.filter((d) => d.month === month), [deals, month]);
  const myDeals = React.useMemo(() => monthDeals.filter((d) => d.ownerId === myId), [monthDeals, myId]);

  // Aggregations (team-wide for super-admin; scope already limits staff to own).
  const scope = isSuperAdmin ? monthDeals : myDeals;
  const totals = React.useMemo(() => {
    const totalCommission = scope.reduce((s, d) => s + d.commission, 0);
    const reps = new Set(scope.map((d) => d.ownerId));
    return {
      totalCommission,
      totalDeals: scope.length,
      activeReps: reps.size,
      avgPerDeal: scope.length ? Math.round((totalCommission / scope.length) * 100) / 100 : 0,
    };
  }, [scope]);

  const overview = React.useMemo(() => buildOverview(monthDeals, deals), [monthDeals, deals]);
  const mySum = myDeals.reduce((s, d) => s + d.commission, 0);
  const topDeal = myDeals.length ? Math.max(...myDeals.map((d) => d.commission)) : 0;

  return (
    <div className="space-y-6">
      {/* Header + month */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Sales Commission</h1>
          <p className="text-sm text-muted-foreground">
            {isSuperAdmin
              ? "Enrolled leads are added automatically for each sales rep, by month."
              : "Your enrolled customers are added automatically each month."}
          </p>
        </div>
        <div className="w-56">
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {months.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Auto-source note */}
      <div className="flex items-start gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5 text-xs text-primary/90">
        <Info className="mt-0.5 size-4 shrink-0" />
        <span>
          Customers are pulled automatically from leads that reached the <strong>Enrolled</strong> stage and grouped
          under the sales rep who owns them. Commission is a fixed amount per your role-based plan
          {ROLE_COMMISSION && Object.keys(ROLE_COMMISSION).length === 0 ? " (not configured yet, showing 0)" : ""}.
        </span>
      </div>

      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label={isSuperAdmin ? "Total Commission" : "My Commission"} value={money(totals.totalCommission)} icon={Coins} intent="primary" />
        <KpiCard label={isSuperAdmin ? "Enrolled Customers" : "My Customers"} value={totals.totalDeals} icon={Target} intent="info" />
        <KpiCard label="Avg / Customer" value={money(totals.avgPerDeal)} icon={TrendingUp} intent="success" />
        <KpiCard
          label={isSuperAdmin ? "Active Reps" : "Top Commission"}
          value={isSuperAdmin ? totals.activeReps : money(topDeal)}
          icon={isSuperAdmin ? Users : DollarSign}
          intent="warning"
        />
      </div>

      <div className={cn("grid gap-6", isSuperAdmin ? "xl:grid-cols-[1fr_1.1fr]" : "")}>
        <MyCustomers deals={myDeals} sum={mySum} loading={loading} isSuperAdmin={isSuperAdmin} />
        {isSuperAdmin && <TeamInsights overview={overview} currentUserId={myId} loading={loading} />}
      </div>
    </div>
  );
}

/* ── My enrolled customers (read-only, auto) ─────────────── */

function MyCustomers({
  deals, sum, loading, isSuperAdmin,
}: {
  deals: Deal[]; sum: number; loading: boolean; isSuperAdmin: boolean;
}) {
  return (
    <Card>
      <CardContent className="space-y-4 py-5">
        <div className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary"><Coins className="size-4.5" /></span>
          <div>
            <p className="font-semibold leading-tight">My Enrolled Customers</p>
            <p className="text-xs text-muted-foreground">Added automatically from your enrolled leads this month.</p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border/60">
          <table className="w-full min-w-[36rem] text-sm">
            <thead>
              <tr className="border-b border-border/60 text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2.5 text-start font-medium">Customer</th>
                <th className="px-4 py-2.5 text-start font-medium">Course</th>
                <th className="px-4 py-2.5 text-start font-medium">Enrolled at</th>
                <th className="px-4 py-2.5 text-end font-medium">Commission</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Loading…</td></tr>
              ) : deals.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No enrolled customers this month yet.</td></tr>
              ) : (
                deals.map((d) => (
                  <tr key={d.id} className="border-b border-border/40 last:border-0">
                    <td className="px-4 py-2.5 font-medium">{d.customerName}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{d.courseName || "—"}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5"><CalendarClock className="size-3.5" />{fmtDateTime(d.enrolledAt)}</span>
                    </td>
                    <td className="px-4 py-2.5 text-end font-semibold tabular-nums text-emerald-600">{money(d.commission)}</td>
                  </tr>
                ))
              )}
            </tbody>
            {deals.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-border/70 bg-muted/40">
                  <td className="px-4 py-3 font-semibold" colSpan={3}>Total ({deals.length} {deals.length === 1 ? "customer" : "customers"})</td>
                  <td className="px-4 py-3 text-end font-heading text-base font-bold tabular-nums text-primary">{money(sum)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
        {isSuperAdmin && (
          <p className="text-xs text-muted-foreground">You're a super-admin — this table shows customers you personally own; the full team is in the insights panel.</p>
        )}
      </CardContent>
    </Card>
  );
}

/* ── overview aggregation ────────────────────────────────── */

type Overview = {
  byRep: { ownerId: string; ownerName: string; deals: number; commission: number }[];
  byCourse: { courseName: string; deals: number; commission: number }[];
  trend: { month: string; commission: number; deals: number }[];
};

function buildOverview(monthDeals: Deal[], allDeals: Deal[]): Overview {
  const repMap = new Map<string, { ownerName: string; deals: number; commission: number }>();
  for (const d of monthDeals) {
    const cur = repMap.get(d.ownerId) ?? { ownerName: d.ownerName, deals: 0, commission: 0 };
    cur.deals += 1; cur.commission += d.commission;
    repMap.set(d.ownerId, cur);
  }
  const byRep = [...repMap.entries()]
    .map(([ownerId, v]) => ({ ownerId, ...v }))
    .sort((a, b) => b.commission - a.commission || b.deals - a.deals);

  const courseMap = new Map<string, { deals: number; commission: number }>();
  for (const d of monthDeals) {
    if (!d.courseName) continue;
    const cur = courseMap.get(d.courseName) ?? { deals: 0, commission: 0 };
    cur.deals += 1; cur.commission += d.commission;
    courseMap.set(d.courseName, cur);
  }
  const byCourse = [...courseMap.entries()]
    .map(([courseName, v]) => ({ courseName, ...v }))
    .sort((a, b) => b.deals - a.deals)
    .slice(0, 8);

  const trendMap = new Map<string, { commission: number; deals: number }>();
  for (const d of allDeals) {
    if (!d.month) continue;
    const cur = trendMap.get(d.month) ?? { commission: 0, deals: 0 };
    cur.commission += d.commission; cur.deals += 1;
    trendMap.set(d.month, cur);
  }
  const trend = [...trendMap.entries()]
    .map(([month, v]) => ({ month, ...v }))
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-6);

  return { byRep, byCourse, trend };
}

/* ── Team insights (super-admin) ─────────────────────────── */

function TeamInsights({ overview, currentUserId, loading }: { overview: Overview; currentUserId: string; loading: boolean }) {
  const maxRep = Math.max(1, ...overview.byRep.map((r) => r.deals));
  const maxCourse = Math.max(1, ...overview.byCourse.map((c) => c.deals));

  return (
    <div className="space-y-6">
      {/* Leaderboard */}
      <Card>
        <CardContent className="space-y-4 py-5">
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"><Trophy className="size-4.5" /></span>
            <div>
              <p className="font-semibold leading-tight">Team Leaderboard</p>
              <p className="text-xs text-muted-foreground">Enrolled customers by sales rep this month.</p>
            </div>
          </div>
          {loading ? (
            <p className="py-4 text-center text-sm text-muted-foreground">Loading…</p>
          ) : overview.byRep.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">No enrolled customers this month.</p>
          ) : (
            <ol className="space-y-2.5">
              {overview.byRep.map((r, i) => (
                <li key={r.ownerId} className={cn("rounded-xl border p-3", r.ownerId === currentUserId ? "border-primary/40 bg-primary/5" : "border-border/60")}>
                  <div className="flex items-center gap-3">
                    <span className={cn("grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold",
                      i === 0 ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                        : i === 1 ? "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        : i === 2 ? "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300"
                        : "bg-muted text-muted-foreground")}>
                      {i < 3 ? <Medal className="size-3.5" /> : i + 1}
                    </span>
                    <Avatar className="size-8 border"><AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">{getInitials(r.ownerName)}</AvatarFallback></Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{r.ownerName}{r.ownerId === currentUserId && <span className="ms-1.5 text-xs text-primary">(you)</span>}</p>
                      <p className="text-xs text-muted-foreground">{r.deals} {r.deals === 1 ? "customer" : "customers"}</p>
                    </div>
                    <span className="font-heading text-sm font-bold tabular-nums">{money(r.commission)}</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${(r.deals / maxRep) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>

      {/* Monthly trend */}
      <Card>
        <CardContent className="space-y-4 py-5">
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"><TrendingUp className="size-4.5" /></span>
            <div>
              <p className="font-semibold leading-tight">Enrollment Trend</p>
              <p className="text-xs text-muted-foreground">Enrolled customers by month.</p>
            </div>
          </div>
          <TrendChart data={overview.trend} />
        </CardContent>
      </Card>

      {/* Top courses */}
      <Card>
        <CardContent className="space-y-4 py-5">
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400"><BookOpen className="size-4.5" /></span>
            <div>
              <p className="font-semibold leading-tight">Top Courses</p>
              <p className="text-xs text-muted-foreground">Enrolled customers by course.</p>
            </div>
          </div>
          {overview.byCourse.length === 0 ? (
            <p className="py-3 text-center text-sm text-muted-foreground">No course data yet.</p>
          ) : (
            <ul className="space-y-2.5">
              {overview.byCourse.map((c) => (
                <li key={c.courseName} className="space-y-1">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="truncate">{c.courseName}</span>
                    <Badge variant="outline" className="tabular-nums">{c.deals}</Badge>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-violet-500" style={{ width: `${(c.deals / maxCourse) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ── tiny SVG area/line trend chart ──────────────────────── */

function TrendChart({ data }: { data: { month: string; commission: number; deals: number }[] }) {
  if (!data.length) return <p className="py-6 text-center text-sm text-muted-foreground">No trend data yet.</p>;
  const W = 520, H = 140, P = 8;
  const max = Math.max(1, ...data.map((d) => d.deals));
  const pts = data.map((d, i) => {
    const x = data.length === 1 ? W / 2 : P + (i * (W - 2 * P)) / (data.length - 1);
    const y = H - P - (d.deals / max) * (H - 2 * P - 14);
    return { x, y, ...d };
  });
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const area = `${line} L ${pts[pts.length - 1].x.toFixed(1)} ${H - P} L ${pts[0].x.toFixed(1)} ${H - P} Z`;
  const fmtM = (m: string) => {
    const [y, mo] = m.split("-");
    return new Date(Number(y), Number(mo) - 1, 1).toLocaleDateString("en-US", { month: "short" });
  };
  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H + 18}`} className="w-full min-w-[24rem]" role="img" aria-label="Enrollment trend">
        <defs>
          <linearGradient id="commTrend" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary, #1111D4)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--color-primary, #1111D4)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#commTrend)" />
        <path d={line} fill="none" stroke="var(--color-primary, #1111D4)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {pts.map((p) => (
          <g key={p.month}>
            <circle cx={p.x} cy={p.y} r={3} fill="var(--color-primary, #1111D4)" />
            <text x={p.x} y={H + 12} textAnchor="middle" className="fill-muted-foreground text-[10px]">{fmtM(p.month)}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}
