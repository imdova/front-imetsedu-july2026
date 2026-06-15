"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { FileText, Wallet, AlertTriangle, TrendingUp, Search, Layers, ListChecks, Columns3, Receipt } from "lucide-react";

import type { Invoice, FinanceStats } from "@/lib/db/finance";
import { cn, formatCurrency } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { InvoicesTable } from "./invoices-table";

const STATUSES = ["draft", "sent", "paid", "overdue", "cancelled"] as const;

export function InvoicesModule({
  invoices, stats, basePath,
}: {
  invoices: Invoice[];
  stats: FinanceStats;
  basePath: string;
}) {
  const t = useTranslations("Finance");
  const [tab, setTab] = React.useState<"all" | "installments" | "manual">("all");
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState<string | null>(null);

  const byTab = invoices.filter((i) =>
    tab === "all" ? true : tab === "installments" ? i.type === "installment" : i.type === "one-off");

  const filtered = byTab.filter((i) => {
    if (status && i.status !== status) return false;
    if (search) {
      const q = search.toLowerCase();
      return i.number.toLowerCase().includes(q) || i.studentName.toLowerCase().includes(q) || i.studentEmail.toLowerCase().includes(q);
    }
    return true;
  });

  const count = (s: string) => invoices.filter((i) => i.status === s).length;
  const draft = count("draft"), sent = count("sent"), paid = count("paid");
  const unpaid = invoices.filter((i) => i.status !== "paid" && i.status !== "draft").length;
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
        <div className="ms-auto flex items-center gap-2">
          <Select defaultValue="all">
            <SelectTrigger className="h-9 w-32"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">{t("allTime")}</SelectItem></SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="h-9 gap-1.5"><Columns3 className="size-4" />{t("columnsBtn")}</Button>
        </div>
      </div>

      {/* Table or empty state */}
      {filtered.length > 0 ? (
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
