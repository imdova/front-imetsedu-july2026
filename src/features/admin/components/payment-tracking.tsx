"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Users, Wallet, AlertTriangle, CalendarClock, CircleCheck, Search, Filter, List, LayoutGrid, Columns3 } from "lucide-react";

import type { Invoice, Installment } from "@/lib/db/finance";
import { cn, formatCurrency } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const INST_STYLE: Record<string, string> = {
  PAID: "bg-success/15 text-success",
  DUE: "bg-destructive/12 text-destructive",
  SCHEDULED: "bg-muted text-muted-foreground",
};

export function PaymentTracking({ invoices }: { invoices: Invoice[] }) {
  const t = useTranslations("Admin");
  const [tab, setTab] = React.useState<"all" | "overdue" | "upcoming" | "paid">("all");
  const [search, setSearch] = React.useState("");
  const [view, setView] = React.useState<"list" | "grid">("list");

  // Each installment invoice is one payment plan / schedule.
  const plans = invoices.filter((i) => i.installments && i.installments.length > 0);
  const allInst = plans.flatMap((p) => p.installments ?? []);

  const owed = plans.reduce((s, p) => s + (p.amount - p.paid), 0);
  const collected = allInst.filter((i) => i.status === "PAID").reduce((s, i) => s + i.amount, 0);
  const pastDue = allInst.filter((i) => i.status === "DUE");
  const upcoming = allInst.filter((i) => i.status === "SCHEDULED");
  const unpaidCount = allInst.filter((i) => i.status !== "PAID").length;

  const matchTab = (p: Invoice) => {
    const inst = p.installments ?? [];
    if (tab === "overdue") return inst.some((i) => i.status === "DUE");
    if (tab === "upcoming") return inst.some((i) => i.status === "SCHEDULED");
    if (tab === "paid") return inst.every((i) => i.status === "PAID");
    return true;
  };
  const rows = plans.filter(matchTab).filter((p) =>
    !search || p.studentName.toLowerCase().includes(search.toLowerCase()) || (p.group ?? "").toLowerCase().includes(search.toLowerCase()));

  const maxInstall = Math.max(1, ...plans.map((p) => p.installments?.length ?? 0));

  const kpis = [
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
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
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
      </div>

      <div className="space-y-4 rounded-xl border bg-card p-4">
        <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground"><Filter className="size-4" />{t("ptFilters")}</p>
        <div className="grid gap-3 lg:grid-cols-[1fr_repeat(4,minmax(0,160px))]">
          <div className="relative">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("ptSearchPlaceholder")} className="ps-9" />
          </div>
          <StaticSelect label={t("ptAllCourses")} />
          <StaticSelect label={t("ptAllGroups")} />
          <StaticSelect label={t("ptAllTypes")} />
          <StaticSelect label={t("ptAllMethods")} />
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border p-0.5">
            <button onClick={() => setView("list")} className={cn("inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium", view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground")}><List className="size-4" />{t("ptList")}</button>
            <button onClick={() => setView("grid")} className={cn("inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium", view === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground")}><LayoutGrid className="size-4" />{t("ptGrid")}</button>
          </div>
          <Button variant="outline" size="sm" className="h-9 gap-1.5"><Columns3 className="size-4" />{t("columnsBtn")}</Button>
        </div>

        {rows.length === 0 ? (
          <div className="grid place-items-center gap-1.5 rounded-lg border border-dashed py-16 text-center">
            <p className="font-semibold">{t("ptNoMatch")}</p>
            <p className="text-sm text-muted-foreground">{t("ptTryAnother")}</p>
          </div>
        ) : view === "list" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-3 py-2.5 text-start font-semibold">{t("colStudent")}</th>
                  <th className="px-3 py-2.5 text-start font-semibold">{t("colGroup")}</th>
                  <th className="px-3 py-2.5 text-end font-semibold">{t("colFees")}</th>
                  <th className="px-3 py-2.5 text-start font-semibold">{t("colPaymentType")}</th>
                  {Array.from({ length: maxInstall }).map((_, i) => (
                    <th key={i} className="px-3 py-2.5 text-center font-semibold">{t("colInstall", { n: i + 1 })}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="px-3 py-3"><p className="font-medium">{p.studentName}</p><p className="text-xs text-muted-foreground">{p.studentEmail}</p></td>
                    <td className="px-3 py-3 text-muted-foreground">{p.group ?? "—"}</td>
                    <td className="px-3 py-3 text-end font-medium tabular-nums">{formatCurrency(p.amount, p.currency)}</td>
                    <td className="px-3 py-3 text-muted-foreground">{p.type === "installment" ? t("typeInstallment") : t("typeOneOff")}</td>
                    {Array.from({ length: maxInstall }).map((_, i) => {
                      const inst = p.installments?.[i];
                      return (
                        <td key={i} className="px-3 py-3 text-center">
                          {inst ? <InstallCell inst={inst} /> : <span className="text-muted-foreground">—</span>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {rows.map((p) => (
              <div key={p.id} className="space-y-2 rounded-xl border p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{p.studentName}</p>
                  <span className="text-sm font-medium tabular-nums">{formatCurrency(p.amount, p.currency)}</span>
                </div>
                <p className="text-xs text-muted-foreground">{p.group}</p>
                <div className="flex flex-wrap gap-1.5">
                  {(p.installments ?? []).map((inst) => <InstallCell key={inst.index} inst={inst} />)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function InstallCell({ inst }: { inst: Installment }) {
  return (
    <span className={cn("inline-flex flex-col items-center rounded-md px-2 py-1 text-xs tabular-nums", INST_STYLE[inst.status])}>
      <span className="font-medium">{formatCurrency(inst.amount, "EGP")}</span>
      <span className="text-[0.6rem] opacity-80">{inst.dueDate}</span>
    </span>
  );
}

function StaticSelect({ label }: { label: string }) {
  return (
    <Select defaultValue="all">
      <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
      <SelectContent><SelectItem value="all">{label}</SelectItem></SelectContent>
    </Select>
  );
}
