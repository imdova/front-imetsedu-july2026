"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { FileText, Wallet, AlertTriangle, TrendingUp, Search, Layers, ListChecks, Columns3, Receipt } from "lucide-react";

import type { Invoice, FinanceStats } from "@/lib/db/finance";
import { mapInvoice, mapFinanceStats } from "@/lib/finance/map-finance";
import { getInvoices } from "@integration/services/invoices";
import { dal } from "@/lib/dal";
import { cn, formatCurrency } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { InvoicesTable } from "./invoices-table";

const EMPTY_STATS: FinanceStats = { collected: 0, outstanding: 0, overdue: 0, refunded: 0 };
const STATUSES = ["pending", "paid"] as const;
const RANGES = ["all", "today", "7_days", "month", "year"] as const;
type Range = (typeof RANGES)[number];

/** Client-side date-range test against the invoice's ISO issue date. */
function invInRange(iso: string | undefined, range: Range): boolean {
  if (range === "all") return true;
  if (!iso) return false;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  const day = 86_400_000;
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const ts = d.getTime();
  switch (range) {
    case "today": return ts >= startOfToday;
    case "7_days": return ts >= startOfToday - 6 * day;
    case "month": return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    case "year": return d.getFullYear() === now.getFullYear();
    default: return true;
  }
}

export function InvoicesModule({
  invoices: serverInvoices = [],
  stats: serverStats = EMPTY_STATS,
  basePath,
  counselorId,
}: {
  invoices?: Invoice[];
  stats?: FinanceStats;
  basePath: string;
  /** Staff users only see invoices for their own leads. */
  counselorId?: string;
}) {
  const t = useTranslations("Finance");
  const [invoices, setInvoices] = React.useState<Invoice[]>(serverInvoices);
  const [stats, setStats] = React.useState<FinanceStats>(serverStats);
  const [isLoading, setIsLoading] = React.useState(true);
  const [tab, setTab] = React.useState<"all" | "installments" | "manual">("all");
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState<string | null>(null);
  const [range, setRange] = React.useState<Range>("all");
  const [agent, setAgent] = React.useState<string>("all");

  React.useEffect(() => {
    let active = true;
    async function load() {
      setIsLoading(true);
      try {
        // Leads carry the assigned agent (counselor); the invoices endpoint
        // doesn't. Fetch them (scoped for staff, all for super-admin) to enrich
        // + narrow the list. Keyed by leadId (= invoice.studentId).
        const [res, leadsRes] = await Promise.all([
          getInvoices({ limit: 200 }),
          dal.crm.fetchLeads(counselorId ? { counselorId } : {}),
        ]);
        if (!active) return;
        if (res.ok && res.data) {
          const agentByStudent = new Map<string, { id: string; name: string }>();
          if (leadsRes.ok) for (const l of leadsRes.data) agentByStudent.set(l.id, { id: l.counselorId, name: l.counselorName });
          let mapped = (res.data.data ?? []).map(mapInvoice).map((inv) => {
            const a = inv.studentId ? agentByStudent.get(inv.studentId) : undefined;
            return a && a.name ? { ...inv, agentId: a.id, agentName: a.name } : inv;
          });
          // Staff: narrow to their own leads.
          if (counselorId && leadsRes.ok) {
            const ownIds = new Set(leadsRes.data.map((l) => l.id));
            mapped = mapped.filter((inv) => ownIds.has(inv.studentId ?? ""));
          }
          setInvoices(mapped);
          setStats(mapFinanceStats(res.data.stats));
        }
      } catch {
      } finally {
        if (active) setIsLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [counselorId]);

  const byTab = invoices.filter((i) =>
    tab === "all" ? true : tab === "installments" ? i.type === "installment" : i.type === "one-off");

  const agents = Array.from(new Set(invoices.map((i) => i.agentName).filter(Boolean))) as string[];

  const filtered = byTab.filter((i) => {
    if (status && i.status !== status) return false;
    if (agent !== "all" && i.agentName !== agent) return false;
    if (!invInRange(i.issuedAtISO, range)) return false;
    if (search) {
      const q = search.toLowerCase();
      return i.number.toLowerCase().includes(q) || i.studentName.toLowerCase().includes(q) || i.studentEmail.toLowerCase().includes(q);
    }
    return true;
  });

  const count = (s: string) => invoices.filter((i) => i.status === s).length;
  const draft = count("draft"), sent = count("sent"), paid = count("paid");
  const unpaid = count("pending");
  const overdueCount = count("overdue");

  const tabs = [
    { key: "all" as const, label: t("invTabAll"), icon: ListChecks, count: invoices.length },
    { key: "installments" as const, label: t("invTabInstallments"), icon: Layers, count: invoices.filter((i) => i.type === "installment").length },
    { key: "manual" as const, label: t("invTabManual"), icon: FileText, count: invoices.filter((i) => i.type === "one-off").length },
  ];

  const kpis = [
    { label: t("kpiTotalInvoices"), value: `${invoices.length}`, sub: t("kpiTotalInvoicesSub", { draft, sent, paid }), icon: FileText, tone: "bg-primary/12 text-primary" },
    { label: t("kpiOutstanding"), value: formatCurrency(stats.outstanding, "EGP"), sub: t("kpiUnpaidSub", { count: unpaid }), icon: Wallet, tone: "bg-warning/18 text-warning" },
    { label: t("kpiOverdue"), value: `${overdueCount}`, sub: t("kpiPastDueSub", { amount: formatCurrency(stats.overdue, "EGP") }), icon: AlertTriangle, tone: "bg-destructive/12 text-destructive" },
    { label: t("kpiCollectedLabel"), value: formatCurrency(stats.collected, "EGP"), sub: t("kpiPaidSub", { count: paid }), icon: TrendingUp, tone: "bg-success/15 text-success" },
  ];

  return (
    <div className="space-y-5">
      {/* Type tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {tabs.map((tb) => (
          <button key={tb.key} onClick={() => setTab(tb.key)}
            className={cn("inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              tab === tb.key ? "bg-primary text-primary-foreground" : "border text-muted-foreground hover:bg-muted")}>
            <tb.icon className="size-4" />{tb.label}
            <span className={cn("rounded-full px-1.5 text-xs tabular-nums", tab === tb.key ? "bg-white/20" : "bg-muted")}>{tb.count}</span>
          </button>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

      {/* Search */}
      <div className="relative">
        <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("searchInvoices")} className="ps-9" />
      </div>

      {/* Status chips + date range + columns */}
      <div className="flex flex-wrap items-center gap-2">
        {STATUSES.map((s) => {
          const n = count(s);
          const active = status === s;
          return (
            <button key={s} onClick={() => setStatus(active ? null : s)}
              className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium transition-colors",
                active ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted")}>
              {t(`status${s[0].toUpperCase()}${s.slice(1)}` as never)}
              <span className="rounded-full bg-muted px-1.5 text-xs tabular-nums">{n}</span>
            </button>
          );
        })}
        <div className="ms-auto flex flex-wrap items-center gap-2">
          <Select value={agent} onValueChange={setAgent}>
            <SelectTrigger className="h-9 w-44"><SelectValue placeholder={t("invAllAgents")} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("invAllAgents")}</SelectItem>
              {agents.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={range} onValueChange={(v) => setRange(v as Range)}>
            <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              {RANGES.map((r) => <SelectItem key={r} value={r}>{t(`invRange_${r}` as never)}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="h-9 gap-1.5"><Columns3 className="size-4" />{t("columnsBtn")}</Button>
        </div>
      </div>

      {/* Table or empty state */}
      {isLoading ? (
        <div className="grid place-items-center gap-1.5 py-16 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
          <p className="text-sm text-muted-foreground">{t("loadingInvoices")}</p>
        </div>
      ) : filtered.length > 0 ? (
        <InvoicesTable initialData={filtered} basePath={basePath} />
      ) : (
        <div className="grid place-items-center gap-2 rounded-xl border border-dashed py-20 text-center">
          <Receipt className="size-10 text-muted-foreground/40" />
          <p className="font-medium">{t("noInvoicesYet")}</p>
          <button className="text-sm font-medium text-primary hover:underline">{t("createFirstInvoice")}</button>
        </div>
      )}
    </div>
  );
}
