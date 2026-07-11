"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  Users, Wallet, AlertTriangle, CalendarClock, CircleCheck, Search, Layers,
  List, LayoutGrid, Check, Clock, AlertCircle, X, Bell, Download, Receipt, Trash2, SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";

import type { Invoice, Installment } from "@/lib/db/finance";
import { mapLeadPaymentPlanToInvoice } from "@/lib/finance/map-finance";
import { getPayments } from "@integration/services/payments";
import { dal } from "@/lib/dal";
import { useAuth } from "@/store";
import { useConfirm } from "@/hooks/use-confirm";
import { useRouter } from "@/i18n/navigation";
import { cn, formatCurrency, getInitials } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/** Per-installment visual treatment. */
const INST_STYLE: Record<Installment["status"], { box: string; icon: React.ElementType; dot: string }> = {
  PAID: { box: "border-success/40 bg-success/8 text-success", icon: Check, dot: "bg-success" },
  DUE: { box: "border-destructive bg-destructive/15 text-destructive", icon: AlertCircle, dot: "bg-destructive" },
  SCHEDULED: { box: "border-border bg-muted/40 text-muted-foreground", icon: Clock, dot: "bg-muted-foreground/50" },
};

type PlanStatus = "active" | "overdue" | "completed";

/** Derive a plan-level status from its installments. */
function planStatusOf(inst: Installment[]): PlanStatus {
  if (inst.length && inst.every((i) => i.status === "PAID")) return "completed";
  if (inst.some((i) => i.status === "DUE")) return "overdue";
  return "active";
}

const PLAN_STATUS_STYLE: Record<PlanStatus, string> = {
  active: "border-primary/30 bg-primary/10 text-primary",
  overdue: "border-destructive/30 bg-destructive/10 text-destructive",
  completed: "border-success/30 bg-success/10 text-success",
};

/** Toggleable table columns for the column manager (Student is always shown). */
const PLAN_COLUMNS: { key: string; labelKey: string }[] = [
  { key: "agent", labelKey: "ptColAgent" },
  { key: "group", labelKey: "colGroup" },
  { key: "enrolledAt", labelKey: "ptColEnrolledAt" },
  { key: "total", labelKey: "ptColTotal" },
  { key: "progress", labelKey: "ptProgress" },
  { key: "status", labelKey: "colStatus" },
  { key: "installments", labelKey: "ptColInstallments" },
];
/** localStorage key persisting the payment-tracking column visibility selection. */
const PT_COLS_STORAGE_KEY = "crm:payment-tracking-cols-v1";

/** Split a timestamp into a date line and a time line ("Jul 9, 2026" / "06:22 PM"). */
function fmtDateParts(iso?: string): { date: string; time: string } {
  if (!iso) return { date: "—", time: "" };
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { date: "—", time: "" };
  return {
    date: d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    time: d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
  };
}

/** Upcoming-installment time windows shown to the right of the tabs. */
const UPCOMING_WINDOWS: { key: string; labelKey: string }[] = [
  { key: "all", labelKey: "ptUpAll" },
  { key: "this_week", labelKey: "ptUpThisWeek" },
  { key: "next_week", labelKey: "ptUpNextWeek" },
  { key: "this_month", labelKey: "ptUpThisMonth" },
  { key: "next_month", labelKey: "ptUpNextMonth" },
];

/** Monday-start week boundary (local midnight) for a given date. */
function startOfWeek(d: Date): number {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dow = (x.getDay() + 6) % 7; // 0 = Monday
  x.setDate(x.getDate() - dow);
  return x.getTime();
}

/** Whether an installment's (display-formatted) due date falls in a window. */
function dueInWindow(dueStr: string | undefined, window: string): boolean {
  if (!dueStr || dueStr === "—") return false;
  const d = new Date(dueStr);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  const day = 86_400_000;
  const sow = startOfWeek(now);
  const ts = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  switch (window) {
    case "this_week": return ts >= sow && ts < sow + 7 * day;
    case "next_week": return ts >= sow + 7 * day && ts < sow + 14 * day;
    case "this_month": return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    case "next_month": {
      const nm = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      return d.getFullYear() === nm.getFullYear() && d.getMonth() === nm.getMonth();
    }
    default: return true;
  }
}

export function PaymentTracking({ invoices: serverInvoices = [], counselorId }: { invoices?: Invoice[]; counselorId?: string }) {
  const t = useTranslations("Admin");
  const { user } = useAuth();
  const canManage = !user?.staffRole; // super-admin only
  const { confirm, Confirmation } = useConfirm();
  const [tab, setTab] = React.useState<"all" | "overdue" | "upcoming" | "paid">("all");
  const [upcomingRange, setUpcomingRange] = React.useState<"all" | "this_week" | "next_week" | "this_month" | "next_month">("all");
  const [search, setSearch] = React.useState("");
  const [view, setView] = React.useState<"list" | "grid">("list");

  // Persisted table column visibility (remembers the user's last selection).
  const [columnVis, setColumnVis] = React.useState<Record<string, boolean>>({});
  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(PT_COLS_STORAGE_KEY);
      if (raw) setColumnVis(JSON.parse(raw));
    } catch { /* ignore malformed / unavailable storage */ }
  }, []);
  const toggleColumn = React.useCallback((key: string, visible: boolean) => {
    setColumnVis((prev) => {
      const next = { ...prev, [key]: visible };
      try { window.localStorage.setItem(PT_COLS_STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);
  const isColVisible = React.useCallback((key: string) => columnVis[key] !== false, [columnVis]);

  const [course, setCourse] = React.useState("all");
  const [group, setGroup] = React.useState("all");
  const [agent, setAgent] = React.useState("all");
  const [ptype, setPtype] = React.useState("all");
  const [pstatus, setPstatus] = React.useState("all");
  const [invoices, setInvoices] = React.useState<Invoice[]>(serverInvoices);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let active = true;
    async function load() {
      setIsLoading(true);
      try {
        // Always pull leads too: they carry the assigned agent (counselor) and
        // the pipeline history we need for "Enrolled at" — neither is in the
        // payments response. Doubles as the staff-scoping source (the payments
        // endpoint's own counselor filter can't be trusted).
        const [res, leadsRes, groupsRes] = await Promise.all([
          getPayments({ limit: 5000 } as any),
          dal.crm.fetchLeads(counselorId ? { counselorId } : {}),
          dal.groups.fetchGroups(),
        ]);
        if (!active) return;
        if (res.ok && res.data) {
          // groupId → title, to resolve the enrolled group name below.
          const groupNameById = new Map<string, string>();
          if (groupsRes.ok) for (const g of groupsRes.data) groupNameById.set(g.id, g.title);
          // leadId → { agent, moved-to-enrolled date, enrolled group } from the leads endpoint.
          const leadInfo = new Map<string, { agentId: string; agentName: string; enrolledAtISO: string; groupName: string }>();
          if (leadsRes.ok) {
            for (const l of leadsRes.data) {
              const enrolledEntry = [...(l.pipelineHistory ?? [])].reverse().find((h) => h.stage === "enrolled");
              const gid = enrolledEntry?.logData?.groupId;
              leadInfo.set(l.id, {
                agentId: l.counselorId || "",
                agentName: l.counselorId ? l.counselorName : "",
                enrolledAtISO: enrolledEntry?.at || "",
                groupName: gid ? (groupNameById.get(gid) || "") : "",
              });
            }
          }
          let rows: any[] = (res.data as any)?.leadPayments?.data ?? [];
          if (counselorId && leadsRes.ok) {
            rows = rows.filter((lead: any) => leadInfo.has(lead?._id ?? lead?.id));
          }
          const plans = rows.filter(
            (lead: any) => Array.isArray(lead?.paymentPlan?.installments) && lead.paymentPlan.installments.length > 0,
          );
          setInvoices(plans.map((lead: any, idx: number) => {
            const info = leadInfo.get(lead._id ?? lead.id ?? "");
            const mapped = mapLeadPaymentPlanToInvoice(lead);
            return {
              ...mapped,
              id: `${lead._id ?? idx}-${idx}`,
              studentId: lead._id,
              agentId: info?.agentId || "",
              agentName: info?.agentName || "",
              enrolledAtISO: info?.enrolledAtISO || "",
              // Real group: plan/backend lookup first, else the lead's enrolled group.
              group: mapped.group || info?.groupName || undefined,
            };
          }));
        }
      } catch {
      } finally {
        if (active) setIsLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [counselorId]);

  // Each installment invoice is one payment plan / schedule.
  const plans = invoices.filter((i) => i.installments && i.installments.length > 0);
  const allInst = plans.flatMap((p) => p.installments ?? []);

  const owed = plans.reduce((s, p) => s + (p.amount - p.paid), 0);
  const collected = allInst.filter((i) => i.status === "PAID").reduce((s, i) => s + i.amount, 0);
  const pastDue = allInst.filter((i) => i.status === "DUE");
  const upcoming = allInst.filter((i) => i.status === "SCHEDULED");
  const unpaidCount = allInst.filter((i) => i.status !== "PAID").length;

  // Distinct courses / groups / agents for the filter dropdowns.
  const courses = Array.from(new Set(plans.map((p) => p.courseTitle).filter(Boolean))) as string[];
  const groups = Array.from(new Set(plans.map((p) => p.group).filter(Boolean))) as string[];
  const agents = Array.from(new Set(plans.map((p) => p.agentName).filter(Boolean))) as string[];

  const matchTab = (p: Invoice) => {
    const inst = p.installments ?? [];
    if (tab === "overdue") return inst.some((i) => i.status === "DUE");
    if (tab === "upcoming") return inst.some((i) => i.status === "SCHEDULED");
    if (tab === "paid") return inst.every((i) => i.status === "PAID");
    return true;
  };

  const rows = plans
    .filter(matchTab)
    .filter((p) => course === "all" || p.courseTitle === course)
    .filter((p) => group === "all" || p.group === group)
    .filter((p) => agent === "all" || p.agentName === agent)
    .filter((p) => upcomingRange === "all" || (p.installments ?? []).some((i) => i.status === "SCHEDULED" && dueInWindow(i.dueDate, upcomingRange)))
    .filter((p) => {
      if (ptype === "all") return true;
      const n = p.installments?.length ?? 0;
      return ptype === "4plus" ? n >= 4 : String(n) === ptype;
    })
    .filter((p) => pstatus === "all" || planStatusOf(p.installments ?? []) === pstatus)
    .filter((p) =>
      !search ||
      p.studentName.toLowerCase().includes(search.toLowerCase()) ||
      p.studentEmail.toLowerCase().includes(search.toLowerCase()) ||
      (p.group ?? "").toLowerCase().includes(search.toLowerCase()));

  const filtersActive = course !== "all" || group !== "all" || agent !== "all" || ptype !== "all" || pstatus !== "all" || upcomingRange !== "all" || !!search;
  const clearFilters = () => { setCourse("all"); setGroup("all"); setAgent("all"); setPtype("all"); setPstatus("all"); setUpcomingRange("all"); setSearch(""); };

  // ─── Multi-select + bulk actions ───
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const toggleOne = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const visibleIds = rows.map((p) => p.id);
  const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selected.has(id));
  const someSelected = visibleIds.some((id) => selected.has(id)) && !allSelected;
  const toggleAll = () =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) visibleIds.forEach((id) => next.delete(id));
      else visibleIds.forEach((id) => next.add(id));
      return next;
    });
  const selectedPlans = rows.filter((p) => selected.has(p.id));

  const sendReminders = () => {
    const emails = Array.from(new Set(selectedPlans.map((p) => p.studentEmail).filter(Boolean)));
    if (!emails.length) { toast.error(t("ptNoEmails")); return; }
    const subject = encodeURIComponent(t("ptReminderSubject"));
    const body = encodeURIComponent(t("ptReminderBody"));
    window.open(`mailto:?bcc=${encodeURIComponent(emails.join(","))}&subject=${subject}&body=${body}`, "_self");
    toast.success(t("ptRemindersSent", { n: emails.length }));
  };

  const removePlan = async (p: Invoice) => {
    if (!p.studentId) { toast.error(t("ptPlanMissingRef")); return; }
    const okToDelete = await confirm({
      title: t("ptDeletePlan"),
      description: t("ptDeletePlanConfirm", { name: p.studentName }),
      confirmText: t("ptDeletePlan"),
      variant: "destructive",
    });
    if (!okToDelete) return;
    const res = await dal.crm.deletePaymentPlan(p.studentId, 0);
    if (res.ok) {
      setInvoices((prev) => prev.filter((x) => x.id !== p.id));
      setSelected((prev) => { const next = new Set(prev); next.delete(p.id); return next; });
      toast.success(t("ptPlanDeleted"));
    } else {
      toast.error(res.error);
    }
  };

  const exportCsv = () => {
    const head = ["Student", "Email", "Group", "Total", "Paid", "Remaining", "Status", "Installments"];
    const cell = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
    const lines = selectedPlans.map((p) => {
      const inst = p.installments ?? [];
      const paid = inst.filter((i) => i.status === "PAID").reduce((s, i) => s + i.amount, 0);
      return [p.studentName, p.studentEmail, p.group ?? "", p.amount, paid, p.amount - paid, planStatusOf(inst), inst.length].map(cell).join(",");
    });
    const csv = [head.map(cell).join(","), ...lines].join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a");
    a.href = url; a.download = "payment-plans.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success(t("ptExported", { n: selectedPlans.length }));
  };

  const kpis = [
    { label: t("ptPaymentPlans"), value: `${plans.length}`, sub: t("ptPaymentPlansSub"), icon: Layers, tone: "bg-primary/12 text-primary" },
    { label: t("ptScheduled"), value: `${plans.length}`, sub: t("ptScheduledSub"), icon: Users, tone: "bg-success/15 text-success" },
    { label: t("ptOwed"), value: formatCurrency(owed, "EGP"), sub: t("ptOwedSub", { count: unpaidCount }), icon: Wallet, tone: "bg-chart-3/15 text-chart-3" },
    { label: t("ptPastDue"), value: `${pastDue.length}`, sub: t("ptPastDueSub", { amount: formatCurrency(pastDue.reduce((s, i) => s + i.amount, 0), "EGP"), count: plans.filter((p) => (p.installments ?? []).some((i) => i.status === "DUE")).length }), icon: AlertTriangle, tone: "bg-warning/18 text-warning" },
    { label: t("ptDueSoon"), value: `${upcoming.length}`, sub: t("ptDueSoonSub", { amount: formatCurrency(upcoming.reduce((s, i) => s + i.amount, 0), "EGP") }), icon: CalendarClock, tone: "bg-primary/12 text-primary" },
    { label: t("ptCollected"), value: `${allInst.filter((i) => i.status === "PAID").length}`, sub: t("ptCollectedSub", { amount: formatCurrency(collected, "EGP") }), icon: CircleCheck, tone: "bg-success/15 text-success" },
  ];

  const tabs = [
    { key: "all" as const, label: t("ptTabAll") },
    { key: "overdue" as const, label: t("ptTabOverdue") },
    { key: "upcoming" as const, label: t("ptTabUpcoming") },
    { key: "paid" as const, label: t("ptTabPaid") },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border border-border/70 bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground">{k.label}</p>
              <span className={cn("grid size-8 place-items-center rounded-lg", k.tone)}><k.icon className="size-4" /></span>
            </div>
            <p className="mt-3 font-heading text-2xl font-semibold tabular-nums">{k.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {tabs.map((tb) => (
          <button key={tb.key} onClick={() => setTab(tb.key)}
            className={cn("rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              tab === tb.key ? "bg-primary text-primary-foreground" : "border text-muted-foreground hover:bg-muted")}>
            {tb.label}
          </button>
        ))}
        {/* Upcoming-installment time windows */}
        <div className="flex flex-wrap items-center gap-1.5 lg:ms-auto">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("ptUpcomingLabel")}:</span>
          {UPCOMING_WINDOWS.map((w) => (
            <button key={w.key} onClick={() => setUpcomingRange((prev) => (prev === w.key ? "all" : (w.key as typeof upcomingRange)))}
              className={cn("rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                upcomingRange === w.key ? "border-primary bg-primary/5 text-primary" : "text-muted-foreground hover:bg-muted/40")}>
              {t(w.labelKey)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4 rounded-xl border bg-card p-4">
        {filtersActive && (
          <div className="flex items-center justify-end">
            <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-muted-foreground" onClick={clearFilters}>
              <X className="size-3.5" />{t("ptClearFilters")}
            </Button>
          </div>
        )}
        <div className="grid items-start gap-3 lg:grid-cols-[1fr_repeat(5,minmax(0,150px))_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("ptSearchPlaceholder")} className="ps-9" />
          </div>
          <Select value={course} onValueChange={setCourse}>
            <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("ptAllCourses")}</SelectItem>
              {courses.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={group} onValueChange={setGroup}>
            <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("ptAllGroups")}</SelectItem>
              {groups.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={agent} onValueChange={setAgent}>
            <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("ptAllAgents")}</SelectItem>
              {agents.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={ptype} onValueChange={setPtype}>
            <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("ptAllTypes")}</SelectItem>
              <SelectItem value="2">{t("ptType2")}</SelectItem>
              <SelectItem value="3">{t("ptType3")}</SelectItem>
              <SelectItem value="4plus">{t("ptType4plus")}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={pstatus} onValueChange={setPstatus}>
            <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("ptAllStatuses")}</SelectItem>
              <SelectItem value="active">{t("ptStatusActive")}</SelectItem>
              <SelectItem value="overdue">{t("ptStatusOverdue")}</SelectItem>
              <SelectItem value="completed">{t("ptStatusCompleted")}</SelectItem>
            </SelectContent>
          </Select>
          {/* Column manager + list/grid view toggle — same row as search & filters */}
          <div className="flex items-center gap-2 lg:justify-end">
            {view === "list" && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-10 gap-1.5">
                    <SlidersHorizontal className="size-4" />
                    <span className="hidden sm:inline">{t("ptColumns")}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel>{t("ptToggleColumns")}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {PLAN_COLUMNS.map((c) => (
                    <DropdownMenuCheckboxItem
                      key={c.key}
                      checked={isColVisible(c.key)}
                      onCheckedChange={(v) => toggleColumn(c.key, !!v)}
                      onSelect={(e) => e.preventDefault()}
                    >
                      {t(c.labelKey)}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <div className="inline-flex rounded-lg border p-0.5">
              <button onClick={() => setView("list")} className={cn("inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium", view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground")}><List className="size-4" />{t("ptList")}</button>
              <button onClick={() => setView("grid")} className={cn("inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium", view === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground")}><LayoutGrid className="size-4" />{t("ptGrid")}</button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid place-items-center gap-1.5 py-16 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
            <p className="text-sm text-muted-foreground">Loading payment plans…</p>
          </div>
        ) : rows.length === 0 ? (
          <div className="grid place-items-center gap-1.5 rounded-lg border border-dashed py-16 text-center">
            <p className="font-semibold">{t("ptNoMatch")}</p>
            <p className="text-sm text-muted-foreground">{t("ptTryAnother")}</p>
          </div>
        ) : (
          view === "grid" ? (
            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {rows.map((p) => (
                <PlanCard key={p.id} plan={p} t={t} selected={selected.has(p.id)} onToggle={() => toggleOne(p.id)} activeTab={tab} canManage={canManage} onDelete={removePlan} />
              ))}
            </div>
          ) : (
            <PlanTable
              rows={rows} t={t} selected={selected} onToggle={toggleOne}
              allSelected={allSelected} someSelected={someSelected} toggleAll={toggleAll} activeTab={tab}
              canManage={canManage} onDelete={removePlan} show={isColVisible}
            />
          )
        )}
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="sticky bottom-4 z-30 mx-auto flex w-fit flex-wrap items-center gap-2 rounded-full border bg-card/95 px-3 py-2 shadow-lg backdrop-blur">
          <span className="ps-1 text-sm font-medium">{t("ptSelectedCount", { n: selected.size })}</span>
          <span className="h-5 w-px bg-border" />
          <Button size="sm" className="h-8 gap-1.5" onClick={sendReminders}><Bell className="size-3.5" />{t("ptSendReminders")}</Button>
          <Button size="sm" variant="outline" className="h-8 gap-1.5" onClick={exportCsv}><Download className="size-3.5" />{t("ptExportSelected")}</Button>
          <Button size="sm" variant="ghost" className="h-8 gap-1.5 text-muted-foreground" onClick={() => setSelected(new Set())}><X className="size-3.5" />{t("ptClearSelection")}</Button>
        </div>
      )}
      {Confirmation}
    </div>
  );
}

/** Tabular payment-plans view (à la the old project): one row per plan with the
 * student, course/group, fees, progress, status and per-installment cells. */
function PlanTable({
  rows, t, selected, onToggle, allSelected, someSelected, toggleAll, activeTab, canManage, onDelete, show,
}: {
  rows: Invoice[];
  t: (k: string, vals?: Record<string, string | number>) => string;
  selected: Set<string>;
  onToggle: (id: string) => void;
  allSelected: boolean;
  someSelected: boolean;
  toggleAll: () => void;
  activeTab: "all" | "overdue" | "upcoming" | "paid";
  canManage: boolean;
  onDelete: (p: Invoice) => void;
  show: (key: string) => boolean;
}) {
  const maxInstall = Math.max(1, ...rows.map((p) => p.installments?.length ?? 0));
  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full text-sm" style={{ minWidth: `${990 + maxInstall * 120}px` }}>
        <thead>
          <tr className="border-b bg-blue-600 text-xs uppercase tracking-wide text-white [&_th]:text-white">
            <th className="w-10 px-3 py-3"><Checkbox checked={allSelected ? true : someSelected ? "indeterminate" : false} onCheckedChange={toggleAll} /></th>
            <th className="px-3 py-3 text-start font-semibold">{t("colStudent")}</th>
            {show("agent") && <th className="px-3 py-3 text-start font-semibold">{t("ptColAgent")}</th>}
            {show("group") && <th className="px-3 py-3 text-start font-semibold">{t("colGroup")}</th>}
            {show("enrolledAt") && <th className="px-3 py-3 text-start font-semibold">{t("ptColEnrolledAt")}</th>}
            {show("total") && <th className="px-3 py-3 text-end font-semibold">{t("ptColTotal")}</th>}
            {show("progress") && <th className="px-3 py-3 text-start font-semibold">{t("ptProgress")}</th>}
            {show("status") && <th className="px-3 py-3 text-start font-semibold">{t("colStatus")}</th>}
            {show("installments") && Array.from({ length: maxInstall }).map((_, i) => (
              <th key={i} className="px-3 py-3 text-center font-semibold">{t("colInstall", { n: i + 1 })}</th>
            ))}
            {canManage && <th className="w-10 px-3 py-3" />}
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => {
            const inst = p.installments ?? [];
            const visibleInst = activeTab === "overdue" ? inst.filter((i) => i.status === "DUE") : inst;
            const paid = inst.filter((i) => i.status === "PAID").reduce((s, i) => s + i.amount, 0);
            const pct = p.amount > 0 ? Math.min(100, Math.round((paid / p.amount) * 100)) : 0;
            const status = planStatusOf(inst);
            const isSel = selected.has(p.id);
            return (
              <tr key={p.id} className={cn("border-b last:border-0 hover:bg-muted/20", isSel && "bg-primary/[0.04]", status === "overdue" && "bg-destructive/[0.03]")}>
                <td className="px-3 py-3"><Checkbox checked={isSel} onCheckedChange={() => onToggle(p.id)} /></td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar className="size-8 border"><AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">{getInitials(p.studentName)}</AvatarFallback></Avatar>
                    <div className="min-w-0">
                      <p className="truncate font-medium leading-tight">{p.studentName}</p>
                      <p className="truncate text-xs text-muted-foreground">{p.studentEmail}</p>
                    </div>
                  </div>
                </td>
                {show("agent") && (
                  <td className="px-3 py-3">
                    {p.agentName ? (
                      <span className="inline-flex items-center gap-2 text-sm">
                        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-chart-2/20 text-[0.6rem] font-semibold text-chart-2">{getInitials(p.agentName)}</span>
                        <span className="truncate">{p.agentName}</span>
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">{t("ptUnassigned")}</span>
                    )}
                  </td>
                )}
                {show("group") && <td className="px-3 py-3 text-muted-foreground">{p.group ?? "—"}</td>}
                {show("enrolledAt") && (
                  <td className="px-3 py-3">
                    {(() => {
                      const { date, time } = fmtDateParts(p.enrolledAtISO);
                      if (date === "—") return <span className="text-xs text-muted-foreground">—</span>;
                      return (
                        <div className="text-xs leading-tight text-muted-foreground">
                          <div className="whitespace-nowrap">{date}</div>
                          {time && <div className="whitespace-nowrap">{time}</div>}
                        </div>
                      );
                    })()}
                  </td>
                )}
                {show("total") && <td className="px-3 py-3 text-end font-medium tabular-nums">{formatCurrency(p.amount, p.currency)}</td>}
                {show("progress") && (
                  <td className="px-3 py-3">
                    <div className="flex min-w-[120px] items-center gap-2">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                        <div className={cn("h-full rounded-full", status === "overdue" ? "bg-destructive" : status === "completed" ? "bg-success" : "bg-primary")} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs font-semibold tabular-nums text-muted-foreground">{pct}%</span>
                    </div>
                  </td>
                )}
                {show("status") && (
                  <td className="px-3 py-3">
                    <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-medium", PLAN_STATUS_STYLE[status])}>
                      {t(status === "active" ? "ptStatusActive" : status === "overdue" ? "ptStatusOverdue" : "ptStatusCompleted")}
                    </span>
                  </td>
                )}
                {show("installments") && Array.from({ length: maxInstall }).map((_, i) => {
                  const it = visibleInst[i];
                  return (
                    <td key={i} className="px-3 py-3">
                      {it ? <InstallChip inst={it} t={t} /> : <span className="grid place-items-center text-muted-foreground">—</span>}
                    </td>
                  );
                })}
                {canManage && (
                  <td className="px-3 py-3">
                    <Button variant="ghost" size="icon" className="size-8" title={t("ptDeletePlan")} onClick={() => onDelete(p)}>
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function PlanCard({
  plan, t, selected, onToggle, activeTab, canManage, onDelete,
}: {
  plan: Invoice;
  t: (k: string, vals?: Record<string, string | number>) => string;
  selected: boolean;
  onToggle: () => void;
  activeTab: "all" | "overdue" | "upcoming" | "paid";
  canManage: boolean;
  onDelete: (p: Invoice) => void;
}) {
  const inst = plan.installments ?? [];
  const visibleInst = activeTab === "overdue" ? inst.filter((i) => i.status === "DUE") : inst;
  const paid = inst.filter((i) => i.status === "PAID").reduce((s, i) => s + i.amount, 0);
  const pct = plan.amount > 0 ? Math.min(100, Math.round((paid / plan.amount) * 100)) : 0;
  const remaining = Math.max(0, plan.amount - paid);
  const status = planStatusOf(inst);
  const statusLabel = t(status === "active" ? "ptStatusActive" : status === "overdue" ? "ptStatusOverdue" : "ptStatusCompleted");

  return (
    <div className={cn(
      "space-y-3 rounded-xl border bg-card p-4 shadow-sm transition-colors hover:border-primary/30",
      selected && "border-primary/50 ring-1 ring-primary/30",
      status === "overdue" && "border-destructive/40",
    )}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <Checkbox checked={selected} onCheckedChange={onToggle} className="shrink-0" />
          <Avatar className="size-9 border"><AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">{getInitials(plan.studentName)}</AvatarFallback></Avatar>
          <div className="min-w-0">
            <p className="truncate font-medium leading-tight">{plan.studentName}</p>
            <p className="truncate text-xs text-muted-foreground">{plan.group || plan.studentEmail}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-medium", PLAN_STATUS_STYLE[status])}>{statusLabel}</span>
          {canManage && (
            <Button variant="ghost" size="icon" className="size-7" title={t("ptDeletePlan")} onClick={() => onDelete(plan)}>
              <Trash2 className="size-3.5 text-destructive" />
            </Button>
          )}
        </div>
      </div>

      {/* Agent + enrolled-at */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="font-medium">{t("ptColAgent")}:</span>
          {plan.agentName || t("ptUnassigned")}
        </span>
        {(() => {
          const { date, time } = fmtDateParts(plan.enrolledAtISO);
          if (date === "—") return null;
          return (
            <span className="inline-flex items-center gap-1.5">
              <span className="font-medium">{t("ptColEnrolledAt")}:</span>
              {date}{time ? ` · ${time}` : ""}
            </span>
          );
        })()}
      </div>

      {/* Amounts */}
      <div className="grid grid-cols-3 gap-2 rounded-lg bg-muted/40 p-2.5 text-center">
        <Stat label={t("ptColTotal")} value={formatCurrency(plan.amount, plan.currency)} />
        <Stat label={t("ptColPaid")} value={formatCurrency(paid, plan.currency)} tone="text-success" />
        <Stat label={t("ptColRemaining")} value={formatCurrency(remaining, plan.currency)} tone={remaining > 0 ? "text-warning" : "text-muted-foreground"} />
      </div>

      {/* Progress */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-muted-foreground">{t("ptProgress")}</span>
          <span className="font-semibold tabular-nums">{pct}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div className={cn("h-full rounded-full transition-all", status === "overdue" ? "bg-destructive" : status === "completed" ? "bg-success" : "bg-primary")} style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Installment timeline */}
      <div className="flex flex-wrap gap-2">
        {visibleInst.map((i) => <InstallChip key={i.index} inst={i} t={t} />)}
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="min-w-0">
      <p className="truncate text-[0.62rem] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={cn("truncate text-sm font-semibold tabular-nums", tone)}>{value}</p>
    </div>
  );
}

function InstallChip({ inst, t }: { inst: Installment; t: (k: string, vals?: Record<string, string | number>) => string }) {
  const router = useRouter();
  const s = INST_STYLE[inst.status];
  const hasInvoice = inst.status === "PAID" && !!inst.invoiceId;
  return (
    <div className="relative">
      {inst.status === "PAID" && (
        <button
          onClick={() => hasInvoice ? router.push(`/admin/crm/invoices/${inst.invoiceId}`) : undefined}
          disabled={!hasInvoice}
          title={hasInvoice ? "View invoice details" : "No invoice available"}
          className={cn(
            "absolute -top-2.5 -inset-e-2.5 z-10 flex size-6 items-center justify-center rounded-full border-2 bg-white shadow-md transition-all",
            hasInvoice
              ? "border-success text-success hover:bg-success hover:text-white cursor-pointer"
              : "border-muted-foreground/30 text-muted-foreground/50 cursor-not-allowed",
          )}
        >
          <Receipt className="size-3.5" strokeWidth={2.5} />
        </button>
      )}
      <div className={cn("flex items-center gap-2 rounded-lg border px-2.5 py-1.5", s.box)}>
        <s.icon className="size-3.5 shrink-0" />
        <div className="min-w-0 leading-tight">
          <p className="text-xs font-semibold tabular-nums">{formatCurrency(inst.amount, "EGP")}</p>
          <p className="truncate text-[0.62rem] opacity-80">{t("ptInstallShort", { n: inst.index })} · {inst.paidDate || inst.dueDate}</p>
        </div>
      </div>
    </div>
  );
}
