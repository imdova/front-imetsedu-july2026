"use client";

import * as React from "react";
import {
  Coins, Users, Award, CalendarClock, LayoutDashboard,
  Percent, GraduationCap, Download, Eye, Loader2, Trophy,
  BarChart3, LineChart, TrendingUp, TrendingDown, Activity,
} from "lucide-react";
import { toast } from "sonner";

import { dal } from "@/lib/dal";
import { useStore } from "@/store";
import { Link } from "@/i18n/navigation";
import type { Lead } from "@/lib/db/crm";
import type { CommissionPlan, CommissionRoleTier } from "@/lib/db/commission";
import { downloadInvoicePdf } from "@integration/services/invoices";
import { formatCurrency, cn, getInitials } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { KpiCard } from "@/components/shared/kpi-card";

/* ── models ──────────────────────────────────────────────── */
type Region = "egypt" | "arab";
type Enrollment = {
  leadId: string;
  student: string;
  course: string;
  group: string;
  enrolledAtISO: string;
  amount: number;
  currency: string;
  region: Region;
};
type StaffAgg = {
  id: string;
  name: string;
  roleLabel: string;
  tier: CommissionRoleTier | null;
  totalLeads: number;      // all-time
  enrolledAll: number;     // all-time
  lostAll: number;         // all-time
  conversion: number;      // enrolledAll / totalLeads
  enrolledDates: string[]; // all-time enrolled dates (for the trend chart)
  monthEnrollments: Enrollment[]; // selected month
  commission: OwnerCommission;    // selected month
};
type OwnerCommission = {
  count: number; threshold: number; base: number; extras: number; total: number;
  extraByLead: Map<string, number>;
};

/* ── plan helpers ────────────────────────────────────────── */
function pickTier(plan: CommissionPlan | null, roleLabel?: string): CommissionRoleTier | null {
  const roles = plan?.roles ?? [];
  if (!roles.length) return null;
  const lc = (roleLabel || "").toLowerCase().trim();
  const exact = roles.find((r) => r.label.toLowerCase().trim() === lc);
  if (exact) return exact;
  if (/leader|manager|lead|قائد|مدير/.test(lc)) return roles.find((r) => r.key === "teamLeader") ?? roles[0];
  return roles.find((r) => r.key === "salesRep") ?? roles[roles.length - 1];
}
function regionOf(country?: string): Region {
  const c = (country || "").trim().toLowerCase();
  return c === "egypt" || c === "eg" || c === "مصر" || c.includes("egypt") ? "egypt" : "arab";
}
function programAmount(plan: CommissionPlan | null, courseName: string, region: Region): number {
  const cn = (courseName || "").toLowerCase();
  if (!cn) return 0;
  const prog = (plan?.programs ?? []).find((p) => {
    const pn = (p.name || "").toLowerCase().trim();
    return pn && (cn.includes(pn) || pn.includes(cn));
  });
  if (!prog) return 0;
  return region === "egypt" ? prog.egypt || 0 : prog.arab || 0;
}
function ownerCommission(monthEnr: Enrollment[], tier: CommissionRoleTier | null, plan: CommissionPlan | null): OwnerCommission {
  const sorted = [...monthEnr].sort((a, b) => (a.enrolledAtISO || "").localeCompare(b.enrolledAtISO || ""));
  const count = sorted.length;
  let base = 0;
  let threshold = count;
  if (count >= 6) { base = tier?.amountAt6 ?? 0; threshold = 6; }
  else if (count === 5) { base = tier?.amountAt5 ?? 0; threshold = 5; }
  const extraByLead = new Map<string, number>();
  let extras = 0;
  sorted.forEach((e, idx) => {
    const x = idx >= threshold ? programAmount(plan, e.course, e.region) : 0;
    extraByLead.set(e.leadId, x);
    extras += x;
  });
  return { count, threshold, base, extras, total: base + extras, extraByLead };
}

/* ── misc helpers ────────────────────────────────────────── */
function monthOptions(): { value: string; label: string }[] {
  const out: { value: string; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({
      value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    });
  }
  return out;
}
const money = (n: number, ccy = "EGP") => formatCurrency(n, ccy as "EGP");
const pct = (n: number) => `${Math.round(n * 100)}%`;
function fmtDateTime(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}
function enrolledInfo(l: Lead): { iso: string; groupId?: string } {
  const e = [...(l.pipelineHistory ?? [])].reverse().find((h) => h.stage === "enrolled");
  return { iso: e?.at || l.createdAtISO || "", groupId: (e?.logData as { groupId?: string } | undefined)?.groupId };
}

/* ── main ────────────────────────────────────────────────── */
export function CommissionManager() {
  const user = useStore((s) => s.user);
  const isSuperAdmin = !!user && !user.staffRole;
  const myId = user?.staffId ?? user?.id ?? "";

  const months = React.useMemo(() => monthOptions(), []);
  const [month, setMonth] = React.useState(months[0].value);
  const [tab, setTab] = React.useState<string>("overview"); // "overview" | staffId
  const [leads, setLeads] = React.useState<Lead[]>([]);
  const [plan, setPlan] = React.useState<CommissionPlan | null>(null);
  const [roleMap, setRoleMap] = React.useState<Map<string, string>>(new Map());
  const [groupMap, setGroupMap] = React.useState<Map<string, string>>(new Map());
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const [leadsRes, planRes, usersRes, groupsRes] = await Promise.all([
        dal.crm.fetchLeads(isSuperAdmin ? {} : { counselorId: myId || undefined }),
        dal.commission.fetchPlan(),
        dal.userManagement.fetchUmUsers(),
        dal.groups.fetchGroups(),
      ]);
      if (!alive) return;
      if (leadsRes.ok) setLeads(leadsRes.data);
      if (planRes.ok) setPlan(planRes.data);
      const rm = new Map<string, string>();
      if (usersRes.ok) for (const u of usersRes.data) rm.set(u.id, u.role);
      if (myId && user?.staffRole?.title) rm.set(myId, user.staffRole.title);
      setRoleMap(rm);
      const gm = new Map<string, string>();
      if (groupsRes.ok) for (const g of groupsRes.data) gm.set(g.id, g.title);
      setGroupMap(gm);
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [isSuperAdmin, myId, user?.staffRole?.title]);

  const staffAggs = React.useMemo<StaffAgg[]>(() => {
    const byOwner = new Map<string, Lead[]>();
    for (const l of leads) {
      const oid = l.counselorId;
      if (!oid) continue;
      if (!byOwner.has(oid)) byOwner.set(oid, []);
      byOwner.get(oid)!.push(l);
    }
    const aggs: StaffAgg[] = [];
    for (const [id, own] of byOwner) {
      const enrolled = own.filter((l) => l.stageKey === "enrolled");
      const monthEnrollments: Enrollment[] = enrolled
        .map((l) => {
          const info = enrolledInfo(l);
          return {
            leadId: l.id,
            student: l.fullName,
            course: l.paymentPlan?.courseName || l.courseNames?.[0] || "",
            group: (info.groupId && groupMap.get(info.groupId)) || "",
            enrolledAtISO: info.iso,
            amount: l.paymentPlan?.totalAmount ?? 0,
            currency: l.paymentPlan?.currency ?? "EGP",
            region: regionOf(l.country),
          } as Enrollment;
        })
        .filter((e) => e.enrolledAtISO.slice(0, 7) === month);
      const roleLabel = roleMap.get(id) || "";
      const tier = pickTier(plan, roleLabel);
      const totalLeads = own.length;
      const enrolledAll = enrolled.length;
      const lostAll = own.filter((l) => l.stageKey === "lost").length;
      aggs.push({
        id,
        name: own[0].counselorName || "Unassigned",
        roleLabel,
        tier,
        totalLeads,
        enrolledAll,
        lostAll,
        conversion: totalLeads ? enrolledAll / totalLeads : 0,
        enrolledDates: enrolled.map((l) => enrolledInfo(l).iso).filter(Boolean),
        monthEnrollments,
        commission: ownerCommission(monthEnrollments, tier, plan),
      });
    }
    return aggs.sort((a, b) => b.monthEnrollments.length - a.monthEnrollments.length || b.enrolledAll - a.enrolledAll);
  }, [leads, plan, roleMap, groupMap, month]);

  const active = tab === "overview" ? null : staffAggs.find((s) => s.id === tab) ?? null;

  return (
    <div className="space-y-5">
      {/* Header + month */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Sales Commission &amp; Performance</h1>
          <p className="text-sm text-muted-foreground">Enrollment conversion, staff comparison, and per-rep commission — auto-sourced from enrolled leads.</p>
        </div>
        <div className="w-56">
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{months.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
        {/* Left tab column */}
        <nav className="flex flex-row flex-wrap gap-1 rounded-xl border border-border/70 bg-card p-1.5 shadow-sm lg:flex-col lg:flex-nowrap">
          <TabButton active={tab === "overview"} onClick={() => setTab("overview")} icon={<LayoutDashboard className="size-4" />} label="Overview" />
          <div className="my-1 hidden h-px bg-border/60 lg:block" />
          {loading && staffAggs.length === 0 ? (
            <p className="px-3 py-2 text-xs text-muted-foreground">Loading staff…</p>
          ) : staffAggs.map((s) => (
            <TabButton
              key={s.id}
              active={tab === s.id}
              onClick={() => setTab(s.id)}
              icon={<Avatar className="size-5 border"><AvatarFallback className="bg-primary/10 text-[9px] font-semibold text-primary">{getInitials(s.name)}</AvatarFallback></Avatar>}
              label={s.name}
              badge={s.monthEnrollments.length || undefined}
            />
          ))}
        </nav>

        {/* Right panel */}
        <div className="min-w-0">
          {tab === "overview"
            ? <OverviewPanel staffAggs={staffAggs} loading={loading} onOpenStaff={setTab} />
            : active
              ? <StaffPanel agg={active} />
              : <p className="py-16 text-center text-sm text-muted-foreground">Select a staff member.</p>}
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label, badge }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; badge?: number }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors lg:w-full",
        active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {icon}
      <span className="min-w-0 flex-1 truncate text-start">{label}</span>
      {badge != null && <span className={cn("rounded-full px-1.5 text-[0.65rem] font-semibold tabular-nums", active ? "bg-white/20" : "bg-muted")}>{badge}</span>}
    </button>
  );
}

/* ── Overview ────────────────────────────────────────────── */
function OverviewPanel({ staffAggs, loading, onOpenStaff }: { staffAggs: StaffAgg[]; loading: boolean; onOpenStaff: (id: string) => void }) {
  const chartSeries = React.useMemo(() => staffAggs.map((a) => ({ id: a.id, name: a.name, dates: a.enrolledDates })), [staffAggs]);
  const totalEnrollMonth = staffAggs.reduce((s, a) => s + a.monthEnrollments.length, 0);
  const totalLeads = staffAggs.reduce((s, a) => s + a.totalLeads, 0);
  const totalEnrolledAll = staffAggs.reduce((s, a) => s + a.enrolledAll, 0);
  const totalCommission = staffAggs.reduce((s, a) => s + a.commission.total, 0);
  const avgConversion = totalLeads ? totalEnrolledAll / totalLeads : 0;
  const activeStaff = staffAggs.filter((a) => a.monthEnrollments.length > 0).length;

  const maxEnroll = Math.max(1, ...staffAggs.map((a) => a.monthEnrollments.length));
  const ranked = [...staffAggs].sort((a, b) => b.monthEnrollments.length - a.monthEnrollments.length || b.conversion - a.conversion);

  if (loading && staffAggs.length === 0) return <p className="py-16 text-center text-sm text-muted-foreground">Loading insights…</p>;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Enrollments (month)" value={totalEnrollMonth} icon={GraduationCap} intent="primary" />
        <KpiCard label="Avg Conversion (all-time)" value={pct(avgConversion)} icon={Percent} intent="success" />
        <KpiCard label="Total Commission (month)" value={money(totalCommission)} icon={Coins} intent="info" />
        <KpiCard label="Active Reps (month)" value={activeStaff} icon={Users} intent="warning" />
      </div>

      <EnrollmentChart series={chartSeries} />

      <Card>
        <CardContent className="space-y-4 py-5">
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"><Trophy className="size-4.5" /></span>
            <div>
              <p className="font-semibold leading-tight">Staff Performance Comparison</p>
              <p className="text-xs text-muted-foreground">Ranked by enrollments this month. Conversion is all-time (enrolled ÷ total leads).</p>
            </div>
          </div>
          <div className="overflow-x-auto rounded-xl border border-border/60">
            <table className="w-full min-w-[46rem] text-sm">
              <thead>
                <tr className="border-b border-border/60 text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-3 py-2.5 text-start font-medium">#</th>
                  <th className="px-3 py-2.5 text-start font-medium">Staff</th>
                  <th className="px-3 py-2.5 text-start font-medium">Enrollments (mo)</th>
                  <th className="px-3 py-2.5 text-end font-medium">Leads</th>
                  <th className="px-3 py-2.5 text-end font-medium">Enrolled</th>
                  <th className="px-3 py-2.5 text-end font-medium">Conversion</th>
                  <th className="px-3 py-2.5 text-end font-medium">Commission (mo)</th>
                </tr>
              </thead>
              <tbody>
                {ranked.length === 0 ? (
                  <tr><td colSpan={7} className="px-3 py-8 text-center text-muted-foreground">No staff activity yet.</td></tr>
                ) : ranked.map((a, i) => (
                  <tr key={a.id} className="cursor-pointer border-b border-border/40 last:border-0 hover:bg-muted/30" onClick={() => onOpenStaff(a.id)}>
                    <td className="px-3 py-2.5 text-muted-foreground tabular-nums">{i + 1}</td>
                    <td className="px-3 py-2.5">
                      <span className="inline-flex items-center gap-2">
                        <Avatar className="size-7 border"><AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">{getInitials(a.name)}</AvatarFallback></Avatar>
                        <span className="min-w-0">
                          <span className="block truncate font-medium">{a.name}</span>
                          {a.roleLabel && <span className="block truncate text-xs text-muted-foreground">{a.roleLabel}</span>}
                        </span>
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-6 tabular-nums">{a.monthEnrollments.length}</span>
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${(a.monthEnrollments.length / maxEnroll) * 100}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-end tabular-nums text-muted-foreground">{a.totalLeads}</td>
                    <td className="px-3 py-2.5 text-end tabular-nums text-muted-foreground">{a.enrolledAll}</td>
                    <td className="px-3 py-2.5 text-end">
                      <Badge variant="outline" className={cn("tabular-nums", a.conversion >= 0.3 ? "border-emerald-300 text-emerald-600" : a.conversion >= 0.15 ? "border-amber-300 text-amber-600" : "text-muted-foreground")}>{pct(a.conversion)}</Badge>
                    </td>
                    <td className="px-3 py-2.5 text-end font-semibold tabular-nums text-primary">{money(a.commission.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground">Tip: click a row (or a name on the left) to open that staff member&apos;s enrollments.</p>
        </CardContent>
      </Card>
    </div>
  );
}

/* ── Enrollment trend chart (period comparison, line/bar) ── */
type PeriodKey = "this_month" | "last_month" | "last_3_months" | "this_year" | "previous_year";
const PERIODS: { key: PeriodKey; label: string }[] = [
  { key: "this_month", label: "This month" },
  { key: "last_month", label: "Last month" },
  { key: "last_3_months", label: "Last 3 months" },
  { key: "this_year", label: "This year" },
  { key: "previous_year", label: "Previous year" },
];

type ChartSeries = { id: string; name: string; dates: string[] };
const SERIES_COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#db2777", "#7c3aed", "#0891b2", "#dc2626", "#65a30d", "#ea580c", "#4f46e5", "#0d9488", "#c026d3"];

function periodWindows(period: PeriodKey) {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  let start: Date, end: Date, prevStart: Date, prevEnd: Date, gran: "day" | "month";
  if (period === "this_month") { start = new Date(y, m, 1); end = new Date(y, m + 1, 1); prevStart = new Date(y, m - 1, 1); prevEnd = start; gran = "day"; }
  else if (period === "last_month") { start = new Date(y, m - 1, 1); end = new Date(y, m, 1); prevStart = new Date(y, m - 2, 1); prevEnd = start; gran = "day"; }
  else if (period === "last_3_months") { start = new Date(y, m - 2, 1); end = new Date(y, m + 1, 1); prevStart = new Date(y, m - 5, 1); prevEnd = start; gran = "month"; }
  else if (period === "this_year") { start = new Date(y, 0, 1); end = new Date(y + 1, 0, 1); prevStart = new Date(y - 1, 0, 1); prevEnd = start; gran = "month"; }
  else { start = new Date(y - 1, 0, 1); end = new Date(y, 0, 1); prevStart = new Date(y - 2, 0, 1); prevEnd = start; gran = "month"; }

  const windows: { start: Date; end: Date; label: string }[] = [];
  if (gran === "day") {
    const days = Math.round((end.getTime() - start.getTime()) / 86_400_000);
    for (let i = 0; i < days; i++) {
      const ds = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      const de = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i + 1);
      windows.push({ start: ds, end: de, label: String(ds.getDate()) });
    }
  } else {
    let cur = new Date(start);
    while (cur < end) {
      const ns = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
      windows.push({ start: new Date(cur), end: ns, label: cur.toLocaleDateString("en-US", { month: "short" }) });
      cur = ns;
    }
  }
  return { windows, prevStart, prevEnd };
}

/** A "nice" round step so the Y-axis ticks land on 1/2/5·10ⁿ. */
function niceStep(x: number): number {
  if (x <= 1) return 1;
  const pow = Math.pow(10, Math.floor(Math.log10(x)));
  const n = x / pow;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * pow;
}

function EnrollmentChart({ series }: { series: ChartSeries[] }) {
  const [period, setPeriod] = React.useState<PeriodKey>("this_month");
  const [view, setView] = React.useState<"bar" | "line">("bar");
  const [hover, setHover] = React.useState<number | null>(null);
  const [hidden, setHidden] = React.useState<Set<string>>(new Set());
  const multi = series.length > 1;

  const { windows, prevStart, prevEnd } = React.useMemo(() => periodWindows(period), [period]);
  const parsed = React.useMemo(
    () => series.map((s, idx) => ({
      ...s,
      color: multi ? SERIES_COLORS[idx % SERIES_COLORS.length] : "var(--color-primary, #1111D4)",
      pts: s.dates.map((d) => new Date(d)).filter((d) => !Number.isNaN(d.getTime())),
    })),
    [series, multi],
  );
  const visible = parsed.filter((s) => !hidden.has(s.id));

  // counts[seriesIdx][bucketIdx]
  const counts = React.useMemo(
    () => visible.map((s) => windows.map((w) => s.pts.filter((d) => d >= w.start && d < w.end).length)),
    [visible, windows],
  );
  const n = windows.length || 1;
  const bucketTotals = windows.map((_, bi) => counts.reduce((sum, c) => sum + (c[bi] || 0), 0));
  const rawMax = Math.max(1, view === "bar" ? Math.max(...bucketTotals, 0) : Math.max(...counts.flat(), 0));
  const step = niceStep(rawMax / 4);
  const top = Math.max(step, Math.ceil(rawMax / step) * step);
  const ticks: number[] = [];
  for (let v = 0; v <= top + 0.001; v += step) ticks.push(v);

  const total = counts.reduce((s, c) => s + c.reduce((a, b) => a + b, 0), 0);
  const prevTotal = visible.reduce((s, ser) => s + ser.pts.filter((d) => d >= prevStart && d < prevEnd).length, 0);
  const delta = prevTotal > 0 ? Math.round(((total - prevTotal) / prevTotal) * 100) : total > 0 ? 100 : 0;
  const up = total >= prevTotal;

  const W = 640, H = 210, padL = 26, padR = 8, padTop = 12, padBottom = 26;
  const innerW = W - padL - padR;
  const innerH = H - padTop - padBottom;
  const slot = innerW / n;
  const xLine = (i: number) => (n <= 1 ? padL + innerW / 2 : padL + (i * innerW) / (n - 1));
  const yOf = (v: number) => padTop + innerH - (v / top) * innerH;
  const labelEvery = n > 16 ? Math.ceil(n / 12) : 1;
  const barW = Math.min(28, slot * 0.62);

  return (
    <Card>
      <CardContent className="space-y-4 py-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"><Activity className="size-4.5" /></span>
            <div>
              <p className="font-semibold leading-tight">Enrollment Trend{multi ? " · by staff" : ""}</p>
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground tabular-nums">{total}</span> enrollments ·{" "}
                <span className={cn("inline-flex items-center gap-0.5 font-medium", up ? "text-emerald-600" : "text-rose-500")}>
                  {up ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}{Math.abs(delta)}%
                </span>{" "}
                vs previous
              </p>
            </div>
          </div>
          <div className="inline-flex rounded-lg border p-0.5">
            <button type="button" onClick={() => setView("bar")} className={cn("inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium", view === "bar" ? "bg-primary text-primary-foreground" : "text-muted-foreground")}><BarChart3 className="size-3.5" />Bar</button>
            <button type="button" onClick={() => setView("line")} className={cn("inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium", view === "line" ? "bg-primary text-primary-foreground" : "text-muted-foreground")}><LineChart className="size-3.5" />Line</button>
          </div>
        </div>

        {/* Period chips */}
        <div className="flex flex-wrap gap-1.5">
          {PERIODS.map((p) => (
            <button key={p.key} type="button" onClick={() => setPeriod(p.key)}
              className={cn("rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                period === p.key ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted")}>
              {p.label}
            </button>
          ))}
        </div>

        {/* Chart */}
        <div className="relative">
          {total === 0 ? (
            <p className="py-14 text-center text-sm text-muted-foreground">No enrollments in this period.</p>
          ) : (
            <>
              <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Enrollment trend">
                {/* Y grid + measures */}
                {ticks.map((v, i) => (
                  <g key={i}>
                    <line x1={padL} y1={yOf(v)} x2={W - padR} y2={yOf(v)} stroke="var(--color-border, #e5e7eb)" strokeWidth={v === 0 ? 1 : 0.5} strokeDasharray={v === 0 ? undefined : "3 3"} />
                    <text x={padL - 5} y={yOf(v) + 3} textAnchor="end" className="fill-muted-foreground" style={{ fontSize: 9 }}>{v}</text>
                  </g>
                ))}
                {/* hover guide */}
                {hover !== null && <line x1={padL + hover * slot + slot / 2} y1={padTop} x2={padL + hover * slot + slot / 2} y2={padTop + innerH} stroke="var(--color-border, #cbd5e1)" strokeWidth={1} />}

                {view === "bar"
                  ? // stacked bars: each staff a colored segment
                  windows.map((_, bi) => {
                    let acc = 0;
                    const bx = padL + bi * slot + (slot - barW) / 2;
                    return (
                      <g key={bi} opacity={hover === null || hover === bi ? 1 : 0.6}>
                        {visible.map((s, si) => {
                          const val = counts[si][bi] || 0;
                          if (val === 0) return null;
                          const y0 = yOf(acc); const y1 = yOf(acc + val); acc += val;
                          return <rect key={s.id} x={bx} y={y1} width={barW} height={Math.max(0, y0 - y1)} fill={s.color} />;
                        })}
                      </g>
                    );
                  })
                  : // multi-line: one colored line per staff
                  visible.map((s, si) => {
                    const line = counts[si].map((v, i) => `${i === 0 ? "M" : "L"} ${xLine(i).toFixed(1)} ${yOf(v).toFixed(1)}`).join(" ");
                    return (
                      <g key={s.id}>
                        <path d={line} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
                        {counts[si].map((v, i) => <circle key={i} cx={xLine(i)} cy={yOf(v)} r={hover === i ? 3.5 : 1.8} fill={s.color} />)}
                      </g>
                    );
                  })}

                {/* x labels */}
                {windows.map((w, i) => (i % labelEvery === 0 ? (
                  <text key={i} x={view === "bar" ? padL + i * slot + slot / 2 : xLine(i)} y={H - 6} textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: 9 }}>{w.label}</text>
                ) : null))}
                {/* hover capture */}
                {windows.map((_, i) => (
                  <rect key={i} x={padL + i * slot} y={padTop} width={slot} height={innerH} fill="transparent" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} />
                ))}
              </svg>
              {hover !== null && (
                <div className="pointer-events-none absolute top-0 z-10 max-w-[220px] -translate-x-1/2 rounded-lg border bg-popover px-2.5 py-1.5 text-xs shadow-md" style={{ left: `${((hover + 0.5) / n) * 100}%` }}>
                  <p className="mb-0.5 font-semibold">{windows[hover].label} · {bucketTotals[hover]}</p>
                  {multi && visible.map((s, si) => (counts[si][hover] > 0 ? (
                    <p key={s.id} className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full" style={{ background: s.color }} />
                      <span className="truncate">{s.name}</span>
                      <span className="ms-auto font-medium tabular-nums">{counts[si][hover]}</span>
                    </p>
                  ) : null))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Legend (click to toggle a staff on/off) */}
        {multi && (
          <div className="flex flex-wrap gap-x-3 gap-y-1.5 border-t pt-3">
            {parsed.map((s) => {
              const off = hidden.has(s.id);
              return (
                <button key={s.id} type="button"
                  onClick={() => setHidden((prev) => { const next = new Set(prev); if (next.has(s.id)) next.delete(s.id); else next.add(s.id); return next; })}
                  className={cn("inline-flex items-center gap-1.5 text-xs transition-opacity", off && "opacity-40")}>
                  <span className="size-2.5 rounded-full" style={{ background: s.color }} />
                  <span className={cn("truncate", off && "line-through")}>{s.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ── Per-staff ───────────────────────────────────────────── */
function StaffPanel({ agg }: { agg: StaffAgg }) {
  const c = agg.commission;
  const sorted = React.useMemo(() => [...agg.monthEnrollments].sort((a, b) => (a.enrolledAtISO || "").localeCompare(b.enrolledAtISO || "")), [agg.monthEnrollments]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-4 py-5">
          <Avatar className="size-14 border"><AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">{getInitials(agg.name)}</AvatarFallback></Avatar>
          <div className="min-w-0 flex-1">
            <p className="font-heading text-lg font-bold leading-tight">{agg.name}</p>
            <p className="text-sm text-muted-foreground">{agg.roleLabel || "Sales"}{agg.tier ? ` · ${agg.tier.label} tier` : ""}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Enrollments (month)" value={c.count} icon={GraduationCap} intent="primary" />
        <KpiCard label="Conversion (all-time)" value={pct(agg.conversion)} icon={Percent} intent="success" />
        <KpiCard label="Commission (month)" value={money(c.total)} icon={Coins} intent="info" />
        <KpiCard label="Base Bonus" value={money(c.base)} icon={Award} intent="warning" />
      </div>

      <EnrollmentChart series={[{ id: agg.id, name: agg.name, dates: agg.enrolledDates }]} />

      <Card>
        <CardContent className="space-y-4 py-5">
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary"><GraduationCap className="size-4.5" /></span>
            <div>
              <p className="font-semibold leading-tight">Enrollments this month</p>
              <p className="text-xs text-muted-foreground">{agg.totalLeads} total leads · {agg.enrolledAll} enrolled all-time · {agg.lostAll} lost</p>
            </div>
          </div>
          <div className="overflow-x-auto rounded-xl border border-border/60">
            <table className="w-full min-w-[52rem] text-sm">
              <thead>
                <tr className="border-b border-border/60 text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-3 py-2.5 text-start font-medium">#</th>
                  <th className="px-3 py-2.5 text-start font-medium">Student</th>
                  <th className="px-3 py-2.5 text-start font-medium">Course</th>
                  <th className="px-3 py-2.5 text-start font-medium">Group</th>
                  <th className="px-3 py-2.5 text-start font-medium">Enrolled at</th>
                  <th className="px-3 py-2.5 text-end font-medium">Amount</th>
                  <th className="px-3 py-2.5 text-start font-medium">Currency</th>
                  <th className="px-3 py-2.5 text-center font-medium">Invoice</th>
                </tr>
              </thead>
              <tbody>
                {sorted.length === 0 ? (
                  <tr><td colSpan={8} className="px-3 py-8 text-center text-muted-foreground">No enrollments this month.</td></tr>
                ) : sorted.map((e, i) => (
                  <tr key={e.leadId} className="border-b border-border/40 last:border-0">
                    <td className="px-3 py-2.5 text-muted-foreground tabular-nums">{i + 1}</td>
                    <td className="px-3 py-2.5 font-medium" dir="auto">{e.student}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{e.course || "—"}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{e.group || "—"}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5"><CalendarClock className="size-3.5" />{fmtDateTime(e.enrolledAtISO)}</span>
                    </td>
                    <td className="px-3 py-2.5 text-end font-semibold tabular-nums">{e.amount ? money(e.amount, e.currency) : "—"}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{e.currency}</td>
                    <td className="px-3 py-2.5">
                      <InvoiceCell leadId={e.leadId} hasPlan={e.amount > 0} />
                    </td>
                  </tr>
                ))}
              </tbody>
              {sorted.length > 0 && (
                <tfoot className="border-t-2 border-border/70">
                  <tr className="bg-muted/30">
                    <td className="px-3 py-2 text-xs text-muted-foreground" colSpan={7}>
                      Base bonus ({c.count} {c.count === 1 ? "customer" : "customers"}{c.threshold >= 5 ? `, reached ${c.threshold}` : ", below 5 — no base"}) + extras {money(c.extras)}
                    </td>
                    <td className="px-3 py-2 text-end font-heading text-base font-bold tabular-nums text-primary">{money(c.total)}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* Invoice view + download for one enrollment (compound id leadId-0-0). */
function InvoiceCell({ leadId, hasPlan }: { leadId: string; hasPlan: boolean }) {
  const [downloading, setDownloading] = React.useState(false);
  const id = `${leadId}-0-0`;
  if (!hasPlan) return <span className="block text-center text-xs text-muted-foreground">—</span>;
  const onDownload = async () => {
    setDownloading(true);
    const res = await downloadInvoicePdf(id, `invoice-${id}.pdf`);
    setDownloading(false);
    if (!res.ok) toast.error(res.error);
  };
  return (
    <div className="flex items-center justify-center gap-1">
      <Button asChild variant="ghost" size="icon" className="size-7" title="View invoice">
        <Link href={`/admin/crm/invoices/${id}`}><Eye className="size-3.5" /></Link>
      </Button>
      <Button variant="ghost" size="icon" className="size-7" title="Download invoice" disabled={downloading} onClick={onDownload}>
        {downloading ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
      </Button>
    </div>
  );
}
