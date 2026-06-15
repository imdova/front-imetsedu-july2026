"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  Users, Layers, UserPlus, Award, Download, Search, Columns3, Calendar,
  ChevronLeft, ChevronRight, Mail, Phone, MoreHorizontal, UsersRound, Trash2,
} from "lucide-react";
import { toast } from "sonner";

import type { SmStudent, SmStats, SmPayment } from "@/lib/db/students-mgmt";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BulkActionButton,
  BulkActionsBar,
} from "@/components/shared/data-table/bulk-actions-bar";

const PAGE_SIZE = 10;
const TODAY = "2026-06-14";
const RANGES = ["all", "today", "yesterday", "week", "month", "d30", "d90", "year", "custom"] as const;
type Range = (typeof RANGES)[number];

function inRange(iso: string, r: Range): boolean {
  if (r === "all" || r === "custom") return true;
  if (r === "today") return iso === TODAY;
  if (r === "yesterday") return iso === "2026-06-13";
  if (r === "week") return iso >= "2026-06-08";
  if (r === "month") return iso.startsWith("2026-06");
  if (r === "d30") return iso >= "2026-05-15";
  if (r === "d90") return iso >= "2026-03-16";
  if (r === "year") return iso.startsWith("2026");
  return true;
}

function PaymentBadge({ payment, label }: { payment: SmPayment; label: string }) {
  const styles: Record<SmPayment, string> = {
    paid: "bg-success/10 text-success ring-success/20",
    partial: "bg-primary/10 text-primary ring-primary/20",
    pending: "bg-warning/10 text-warning ring-warning/20",
    unpaid: "bg-destructive/10 text-destructive ring-destructive/20",
  };
  return <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset", styles[payment])}>{label}</span>;
}

function Kpi({ label, value, sub, icon, tone }: { label: string; value: number; sub: string; icon: React.ReactNode; tone: string }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
        <span className={cn("grid size-10 place-items-center rounded-xl text-white", tone)}>{icon}</span>
      </div>
      <p className="mt-3 text-3xl font-bold tabular-nums">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

export function StudentsManagement({ students, stats }: { students: SmStudent[]; stats: SmStats }) {
  const t = useTranslations("Admin");
  const tc = useTranslations("Common");
  const [rows, setRows] = React.useState(students);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(() => new Set());
  const [range, setRange] = React.useState<Range>("all");
  const [search, setSearch] = React.useState("");
  const [country, setCountry] = React.useState("all");
  const [gender, setGender] = React.useState("all");
  const [specialty, setSpecialty] = React.useState("all");
  const [source, setSource] = React.useState("all");
  const [agent, setAgent] = React.useState("all");
  const [group, setGroup] = React.useState("all");
  const [payment, setPayment] = React.useState("all");
  const [page, setPage] = React.useState(0);

  React.useEffect(() => setRows(students), [students]);

  const uniq = (vals: (string | null)[]) => Array.from(new Set(vals.filter(Boolean) as string[])).sort();
  const countries = React.useMemo(() => uniq(rows.map((s) => s.country)), [rows]);
  const specialties = React.useMemo(() => uniq(rows.map((s) => s.specialty)), [rows]);
  const sources = React.useMemo(() => uniq(rows.map((s) => s.leadSource)), [rows]);
  const agents = React.useMemo(() => uniq(rows.map((s) => s.salesAgent)), [rows]);
  const groups = React.useMemo(() => uniq(rows.map((s) => s.assignedGroup)), [rows]);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((s) => {
      if (!inRange(s.joinedAt, range)) return false;
      if (country !== "all" && s.country !== country) return false;
      if (gender !== "all" && s.gender !== gender) return false;
      if (specialty !== "all" && s.specialty !== specialty) return false;
      if (source !== "all" && s.leadSource !== source) return false;
      if (agent !== "all" && (s.salesAgent ?? "") !== agent) return false;
      if (group !== "all" && (s.assignedGroup ?? "") !== group) return false;
      if (payment !== "all" && s.payment !== payment) return false;
      if (q && ![s.name, s.email, s.phone].some((f) => f.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [rows, range, search, country, gender, specialty, source, agent, group, payment]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount - 1);
  const pageRows = filtered.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);
  const pageIds = pageRows.map((s) => s.id);
  const allPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));
  const somePageSelected =
    pageIds.some((id) => selectedIds.has(id)) && !allPageSelected;
  const selectedCount = selectedIds.size;

  React.useEffect(() => setPage(0), [range, search, country, gender, specialty, source, agent, group, payment]);

  const toggleAllPage = (checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      pageIds.forEach((id) => (checked ? next.add(id) : next.delete(id)));
      return next;
    });
  };

  const toggleOne = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const bulkRemove = () => {
    setRows((prev) => prev.filter((s) => !selectedIds.has(s.id)));
    toast.success(t("smBulkRemoved", { count: selectedCount }));
    clearSelection();
  };

  const genderLabel = (g: SmStudent["gender"]) => g === "male" ? t("smGenderMale") : g === "female" ? t("smGenderFemale") : t("smGenderNone");

  const filterSelect = (value: string, onChange: (v: string) => void, allLabel: string, options: { v: string; l: string }[]) => (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="min-w-[150px]"><SelectValue>{value === "all" ? allLabel : options.find((o) => o.v === value)?.l ?? allLabel}</SelectValue></SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{allLabel}</SelectItem>
        {options.map((o) => <SelectItem key={o.v} value={o.v}>{o.l}</SelectItem>)}
      </SelectContent>
    </Select>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-bold tracking-tight">{t("smTitle")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("smSubtitle")}</p>
        </div>
        <Button variant="outline" className="gap-2 shrink-0" onClick={() => toast.success(t("smExport"))}><Download className="size-4" />{t("smExport")}</Button>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label={t("smKpiTotal")} value={stats.total} sub={t("smKpiTotalSub")} tone="bg-primary" icon={<Users className="size-5" />} />
        <Kpi label={t("smKpiInGroups")} value={stats.inGroups} sub={t("smKpiInGroupsSub")} tone="bg-violet-500" icon={<Layers className="size-5" />} />
        <Kpi label={t("smKpiNew")} value={stats.newThisMonth} sub={t("smKpiNewSub")} tone="bg-orange-500" icon={<UserPlus className="size-5" />} />
        <Kpi label={t("smKpiCerts")} value={stats.certificates} sub={t("smKpiCertsSub")} tone="bg-emerald-500" icon={<Award className="size-5" />} />
      </div>

      <div className="space-y-4 rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
        {/* Date range tabs */}
        <div className="flex flex-wrap items-center gap-1 rounded-xl bg-muted/40 p-1">
          {RANGES.map((r) => (
            <button key={r} type="button" onClick={() => setRange(r)}
              className={cn("inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                range === r ? (r === "all" ? "bg-success text-white" : "bg-card text-foreground shadow-sm") : "text-muted-foreground hover:text-foreground")}>
              {r === "custom" && <Calendar className="size-3.5" />}
              {t(("sm" + (r === "all" ? "All" : r === "today" ? "Today" : r === "yesterday" ? "Yesterday" : r === "week" ? "ThisWeek" : r === "month" ? "ThisMonth" : r === "d30" ? "30Days" : r === "d90" ? "90Days" : r === "year" ? "Year" : "Custom")) as never)}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[230px] flex-1">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("smSearch")} className="ps-9" />
          </div>
          {filterSelect(country, setCountry, t("smAllCountries"), countries.map((c) => ({ v: c, l: c })))}
          {filterSelect(gender, setGender, t("smAllGenders"), [{ v: "male", l: t("smGenderMale") }, { v: "female", l: t("smGenderFemale") }])}
          {filterSelect(specialty, setSpecialty, t("smAllSpecialties"), specialties.map((c) => ({ v: c, l: c })))}
          {filterSelect(source, setSource, t("smAllSources"), sources.map((c) => ({ v: c, l: c })))}
          {filterSelect(agent, setAgent, t("smAllAgents"), agents.map((c) => ({ v: c, l: c })))}
          {filterSelect(group, setGroup, t("smAllGroups"), groups.map((c) => ({ v: c, l: c })))}
          {filterSelect(payment, setPayment, t("smAllPayments"), (["paid", "partial", "pending", "unpaid"] as SmPayment[]).map((p) => ({ v: p, l: t(("smPay" + p[0].toUpperCase() + p.slice(1)) as never) })))}
          <Button variant="outline" className="gap-2"><Columns3 className="size-4" />{t("smColumns")}<span className="grid size-5 place-items-center rounded-full bg-primary text-[0.7rem] font-semibold text-primary-foreground">3</span></Button>
        </div>

        {selectedCount > 0 && (
          <BulkActionsBar
            countLabel={tc("selectedCount", { count: selectedCount })}
            clearLabel={tc("clear")}
            onClear={clearSelection}
          >
            <BulkActionButton
              onClick={() => {
                toast.success(t("smBulkAssigned", { count: selectedCount }));
                clearSelection();
              }}
            >
              <UsersRound className="size-4" />
              {t("smBulkAssign")}
            </BulkActionButton>
            <BulkActionButton
              onClick={() => {
                toast.success(t("smBulkEmailed", { count: selectedCount }));
                clearSelection();
              }}
            >
              <Mail className="size-4" />
              {t("smBulkEmail")}
            </BulkActionButton>
            <BulkActionButton onClick={() => toast.success(tc("csvExported"))}>
              <Download className="size-4" />
              {tc("exportCsv")}
            </BulkActionButton>
            <BulkActionButton tone="destructive" onClick={bulkRemove}>
              <Trash2 className="size-4" />
              {tc("delete")}
            </BulkActionButton>
          </BulkActionsBar>
        )}

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-border/70">
          <table className="w-full min-w-[1100px] text-sm">
            <thead className="bg-muted/40">
              <tr className="border-b border-border/70 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="w-10 px-3 py-3">
                  <Checkbox
                    checked={allPageSelected || (somePageSelected && "indeterminate")}
                    onCheckedChange={(v) => toggleAllPage(!!v)}
                    aria-label="Select all"
                  />
                </th>
                <th className="px-3 py-3 text-start">{t("smColStudent")}</th>
                <th className="px-3 py-3 text-start">{t("smColCountry")}</th>
                <th className="px-3 py-3 text-start">{t("smColGender")}</th>
                <th className="px-3 py-3 text-start">{t("smColSpecialty")}</th>
                <th className="px-3 py-3 text-start">{t("smColSource")}</th>
                <th className="px-3 py-3 text-start">{t("smColAgent")}</th>
                <th className="px-3 py-3 text-start">{t("smColGroup")}</th>
                <th className="px-3 py-3 text-start">{t("smColPayment")}</th>
                <th className="px-3 py-3 text-start">{t("smColTotal")}</th>
                <th className="px-3 py-3 text-end">{t("smColActions")}</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr><td colSpan={11} className="px-3 py-16 text-center text-sm text-muted-foreground">{t("smNoStudents")}</td></tr>
              ) : pageRows.map((s) => (
                <tr
                  key={s.id}
                  data-state={selectedIds.has(s.id) ? "selected" : undefined}
                  className={cn(
                    "border-b border-border/50 last:border-0 hover:bg-muted/40",
                    selectedIds.has(s.id) && "bg-primary/5",
                  )}
                >
                  <td className="px-3 py-3">
                    <Checkbox
                      checked={selectedIds.has(s.id)}
                      onCheckedChange={(v) => toggleOne(s.id, !!v)}
                      aria-label={`Select ${s.name}`}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9 border"><AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">{s.initials}</AvatarFallback></Avatar>
                      <div className="min-w-0">
                        <p className="font-semibold text-primary">{s.name}</p>
                        <p className="flex items-center gap-1 text-xs text-muted-foreground"><Mail className="size-3" />{s.email}</p>
                        <p className="flex items-center gap-1 text-xs text-muted-foreground"><Phone className="size-3" />{s.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3"><span className="inline-flex rounded-md bg-muted px-2 py-0.5 text-xs font-medium">{s.country}</span></td>
                  <td className="px-3 py-3 text-muted-foreground">{genderLabel(s.gender)}</td>
                  <td className="px-3 py-3">{s.specialty}</td>
                  <td className="px-3 py-3"><span className="inline-flex rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{s.leadSource}</span></td>
                  <td className="px-3 py-3">{s.salesAgent ?? <span className="italic text-muted-foreground">{t("smUnassigned")}</span>}</td>
                  <td className="px-3 py-3">{s.assignedGroup ? <span className="inline-flex rounded-md bg-violet-500/10 px-2 py-0.5 text-xs font-medium text-violet-600">{s.assignedGroup}</span> : <span className="text-muted-foreground">{t("smNoData")}</span>}</td>
                  <td className="px-3 py-3"><PaymentBadge payment={s.payment} label={t(("smPay" + s.payment[0].toUpperCase() + s.payment.slice(1)) as never)} /></td>
                  <td className="px-3 py-3 tabular-nums">{s.totalAmount != null ? `$${s.totalAmount.toLocaleString()}` : <span className="text-muted-foreground">{t("smNoData")}</span>}</td>
                  <td className="px-3 py-3 text-end">
                    <Button variant="ghost" size="icon" className="size-8" onClick={() => toast.info(s.name)}><MoreHorizontal className="size-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-border/70 pt-4">
          <p className="text-sm text-muted-foreground">
            {selectedCount > 0
              ? tc("rowsSelected", { selected: selectedCount, total: filtered.length })
              : filtered.length === 0
                ? t("smShowing", { from: 0, to: 0, total: 0 })
                : t("smShowing", {
                    from: current * PAGE_SIZE + 1,
                    to: current * PAGE_SIZE + pageRows.length,
                    total: filtered.length,
                  })}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="size-9" disabled={current === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}><ChevronLeft className="size-4 rtl:rotate-180" /></Button>
            <span className="grid size-9 place-items-center rounded-md bg-primary text-sm font-medium text-primary-foreground">{current + 1}</span>
            <Button variant="outline" size="icon" className="size-9" disabled={current >= pageCount - 1} onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}><ChevronRight className="size-4 rtl:rotate-180" /></Button>
          </div>
        </div>
      </div>
    </div>
  );
}
