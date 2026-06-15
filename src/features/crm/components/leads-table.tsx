"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Search, ChevronLeft, ChevronRight, Download, UserPlus, ArrowRightLeft, GitBranch, Trash2, X, ChevronDown } from "lucide-react";
import { toast } from "sonner";

import { useRouter } from "@/i18n/navigation";
import type { Lead, PipelineStage, Counselor } from "@/lib/db/crm";
import { SOURCES } from "@/lib/db/crm";
import { dal } from "@/lib/dal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/shared/data-table/data-table";
import { getLeadColumns } from "./lead-columns";

type Option = { value: string; label: string };

interface Props {
  initialData: Lead[];
  stages: PipelineStage[];
  counselors: Counselor[];
  pipelines: Option[];
  courseOptions: Option[];
  /** Real lead-source options from CRM settings (falls back to seeds). */
  sourceOptions?: string[];
  basePath: string;
}

const RANGES = [
  "today", "yesterday", "this_week", "last_week", "this_month", "last_month", "3_months", "custom",
] as const;
type Range = (typeof RANGES)[number] | "all";

/** Monday-start week boundary for a given date (local time). */
function startOfWeek(d: Date): number {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dow = (x.getDay() + 6) % 7; // 0 = Monday
  x.setDate(x.getDate() - dow);
  return x.getTime();
}

/** Client-side date-range test against the lead's ISO created timestamp. */
function inRange(iso: string | undefined, range: Range, custom?: { from: string; to: string }): boolean {
  if (range === "all") return true;
  if (!iso) return false;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  const day = 86_400_000;
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const sow = startOfWeek(now);
  const ts = d.getTime();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  switch (range) {
    case "today": return ts >= startOfToday;
    case "yesterday": return ts >= startOfToday - day && ts < startOfToday;
    case "this_week": return ts >= sow;
    case "last_week": return ts >= sow - 7 * day && ts < sow;
    case "this_month": return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    case "last_month": return d.getFullYear() === lastMonth.getFullYear() && d.getMonth() === lastMonth.getMonth();
    case "3_months": return ts >= startOfToday - 89 * day;
    case "custom": {
      const from = custom?.from ? new Date(`${custom.from}T00:00:00`).getTime() : -Infinity;
      const to = custom?.to ? new Date(`${custom.to}T23:59:59`).getTime() : Infinity;
      return ts >= from && ts <= to;
    }
    default: return true;
  }
}

export function LeadsTable({ initialData, stages, counselors, pipelines, courseOptions, sourceOptions, basePath }: Props) {
  const t = useTranslations("Crm");
  const tc = useTranslations("Common");
  const router = useRouter();

  const [rows, setRows] = React.useState<Lead[]>(initialData);
  const [loading, setLoading] = React.useState(false);
  const [exporting, setExporting] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [stage, setStage] = React.useState("all");
  const [source, setSource] = React.useState("all");
  const [counselorId, setCounselorId] = React.useState("all");
  const [priority, setPriority] = React.useState("all");
  const [specialty, setSpecialty] = React.useState("all");
  const [country, setCountry] = React.useState("all");
  const [courseId, setCourseId] = React.useState("all");
  const [pipeline, setPipeline] = React.useState("all");
  const [range, setRange] = React.useState<Range>("all");
  const [customFrom, setCustomFrom] = React.useState("");
  const [customTo, setCustomTo] = React.useState("");
  const [quickTab, setQuickTab] = React.useState<"all" | "unassigned" | "overdue" | "today">("all");

  // Distinct specialty / country values present in the data (so filter values
  // always match what the backend actually returns).
  const specialtyOptions = React.useMemo(
    () => Array.from(new Set(initialData.map((r) => r.specialty).filter(Boolean))).map((s) => ({ value: s as string, label: s as string })),
    [initialData],
  );
  const countryOptions = React.useMemo(
    () => Array.from(new Set(initialData.map((r) => r.country).filter(Boolean))).map((c) => ({ value: c, label: c })),
    [initialData],
  );
  // Real source options from CRM settings, unioned with any sources present on
  // the leads (so every value in the table is filterable). Falls back to seeds.
  const sourceFilterOptions = React.useMemo(() => {
    const base = sourceOptions?.length ? sourceOptions : SOURCES;
    const present = initialData.map((r) => r.source).filter(Boolean) as string[];
    return Array.from(new Set([...base, ...present])).map((s) => ({ value: s, label: s }));
  }, [sourceOptions, initialData]);

  const counts = React.useMemo(() => ({
    all: rows.length,
    unassigned: rows.filter((r) => !r.counselorId).length,
    overdue: rows.filter((r) => r.followUps.some((f) => f.status === "overdue")).length,
    today: rows.filter((r) => r.followUps.some((f) => f.status === "today")).length,
  }), [rows]);

  const displayRows = React.useMemo(() => {
    let r = rows.filter((row) => inRange(row.createdAtISO, range, { from: customFrom, to: customTo }));
    if (quickTab === "unassigned") r = r.filter((row) => !row.counselorId);
    else if (quickTab === "overdue") r = r.filter((row) => row.followUps.some((f) => f.status === "overdue"));
    else if (quickTab === "today") r = r.filter((row) => row.followUps.some((f) => f.status === "today"));
    return r;
  }, [rows, quickTab, range, customFrom, customTo]);

  const load = React.useCallback(async () => {
    setLoading(true);
    const res = await dal.crm.fetchLeads({ search, stage, source, counselorId, priority, specialty, country, courseId, pipeline });
    if (res.ok) setRows(res.data);
    else toast.error(res.error);
    setLoading(false);
  }, [search, stage, source, counselorId, priority, specialty, country, courseId, pipeline]);

  const active = search || [stage, source, counselorId, priority, specialty, country, courseId, pipeline].some((v) => v !== "all");

  React.useEffect(() => {
    if (!active) {
      setRows(initialData);
      return;
    }
    const id = setTimeout(load, 250);
    return () => clearTimeout(id);
  }, [load, initialData, active]);

  const onExport = async () => {
    setExporting(true);
    const res = await dal.crm.exportLeads();
    setExporting(false);
    if (res.ok) toast.success(t("exportStarted"));
    else toast.error(res.error);
  };

  // Bulk actions on the current row selection.
  const [busy, setBusy] = React.useState(false);
  const [confirmDel, setConfirmDel] = React.useState<{ ids: string[]; reset: () => void } | null>(null);

  const runBulk = async (
    ids: string[],
    action: () => Promise<{ ok: boolean; error?: string }>,
    successMsg: string,
    reset: () => void,
  ) => {
    if (!ids.length) return;
    setBusy(true);
    const res = await action();
    setBusy(false);
    if (res.ok) {
      toast.success(successMsg);
      reset();
      await load();
    } else {
      toast.error(res.error ?? t("bulkFailed"));
    }
  };

  const doDelete = async () => {
    if (!confirmDel) return;
    const { ids, reset } = confirmDel;
    setConfirmDel(null);
    setBusy(true);
    const res = await dal.crm.bulkDeleteLeads(ids);
    setBusy(false);
    if (res.ok) {
      toast.success(t("bulkDeleted", { n: res.data }));
      reset();
      await load();
    } else {
      toast.error(res.error);
    }
  };

  const columns = React.useMemo(
    () => getLeadColumns(
      t,
      (lead) => router.push(`${basePath}/leads/${lead.id}`),
      (lead) => router.push(`${basePath}/leads/${lead.id}/edit`),
    ),
    [t, router, basePath],
  );

  const tabs = [
    { key: "all" as const, label: t("tabAllLeads"), count: counts.all },
    { key: "unassigned" as const, label: t("tabUnassigned"), count: counts.unassigned },
    { key: "overdue" as const, label: t("tabOverdueFollowups"), count: counts.overdue },
    { key: "today" as const, label: t("tabTodayFollowups"), count: counts.today },
  ];

  return (
    <div className="space-y-4">
      {/* Tabs + export */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b">
        <div className="flex flex-wrap items-center gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setQuickTab(tab.key)}
              className={cn(
                "inline-flex items-center gap-2 border-b-2 px-3 py-2 text-sm font-medium transition-colors",
                quickTab === tab.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
              {tab.count > 0 && <span className="rounded-full bg-muted px-1.5 text-xs tabular-nums">{tab.count}</span>}
            </button>
          ))}
        </div>
        <Button variant="outline" size="sm" className="mb-1 gap-1.5" onClick={onExport} disabled={exporting}>
          <Download className="size-4" />
          {t("exportData")}
        </Button>
      </div>

      {/* Date-range chips */}
      <div className="flex flex-wrap items-center gap-1.5">
        {(["all", ...RANGES] as Range[]).map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
              range === r ? "border-primary bg-primary/5 text-primary" : "text-muted-foreground hover:bg-muted/40",
            )}
          >
            {t(`range_${r}` as never)}
          </button>
        ))}
        {range === "custom" && (
          <div className="flex items-center gap-1.5">
            <Input type="date" value={customFrom} max={customTo || undefined} onChange={(e) => setCustomFrom(e.target.value)} className="h-9 w-auto" aria-label={t("rangeFrom")} />
            <span className="text-sm text-muted-foreground">{t("rangeTo")}</span>
            <Input type="date" value={customTo} min={customFrom || undefined} onChange={(e) => setCustomTo(e.target.value)} className="h-9 w-auto" aria-label={t("rangeTo")} />
          </div>
        )}
      </div>

      {/* Filter grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <Filter label={t("filterPriority")} value={priority} onChange={setPriority} all={t("allPriorities")}
          options={[{ value: "hot", label: t("priorityHot") }, { value: "warm", label: t("priorityWarm") }, { value: "cold", label: t("priorityCold") }]} />
        <Filter label={t("filterSource")} value={source} onChange={setSource} all={t("allSources")}
          options={sourceFilterOptions} />
        <Filter label={t("filterCounselor")} value={counselorId} onChange={setCounselorId} all={t("everyone")}
          options={counselors.map((c) => ({ value: c.id, label: c.name }))} />
        <Filter label={t("filterCourse")} value={courseId} onChange={setCourseId} all={t("allCourses")}
          options={courseOptions} />
        <Filter label={t("filterSpecialty")} value={specialty} onChange={setSpecialty} all={t("allSpecialties")}
          options={specialtyOptions} />
        <Filter label={t("filterCountry")} value={country} onChange={setCountry} all={t("allCountries")}
          options={countryOptions} />
        <Filter label={t("filterPipeline")} value={pipeline} onChange={setPipeline} all={t("allPipelines")}
          options={pipelines} />
        <Filter label={t("filterPipelineStatus")} value={stage} onChange={setStage} all={t("allStatuses")}
          options={stages.map((s) => ({ value: s.key, label: s.name }))} />
      </div>

      <DataTable
        columns={columns}
        data={displayRows}
        isLoading={loading}
        pageSize={10}
        bulkBar={(table) => {
          const ids = table.getSelectedRowModel().rows.map((r) => r.original.id);
          const reset = () => table.resetRowSelection();
          return (
            <BulkBar
              count={ids.length}
              busy={busy}
              counselors={counselors}
              stages={stages}
              pipelines={pipelines}
              onAssign={(cid) => runBulk(ids, () => dal.crm.bulkAssignCounselor(ids, cid), t("bulkAssigned"), reset)}
              onStage={(s) => runBulk(ids, () => dal.crm.bulkSetStage(ids, s), t("bulkStageMoved"), reset)}
              onPipeline={(p) => runBulk(ids, () => dal.crm.bulkMovePipeline(ids, p), t("bulkPipelineMoved"), reset)}
              onDelete={() => setConfirmDel({ ids, reset })}
              onClear={reset}
              t={t}
            />
          );
        }}
        toolbar={() => (
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("searchLeads")} className="ps-9" />
          </div>
        )}
        footer={(table) => {
          const selected = table.getFilteredSelectedRowModel().rows.length;
          const total = table.getFilteredRowModel().rows.length;
          return (
            <div className="flex flex-wrap items-center justify-between gap-3 px-1">
              <p className="text-sm text-muted-foreground">{tc("rowsSelected", { selected, total })}</p>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="gap-1">
                  <ChevronLeft className="size-4 rtl:rotate-180" />
                  {tc("previous")}
                </Button>
                <span className="text-sm text-muted-foreground tabular-nums">
                  {tc("page", { page: table.getState().pagination.pageIndex + 1, total: table.getPageCount() || 1 })}
                </span>
                <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="gap-1">
                  {tc("next")}
                  <ChevronRight className="size-4 rtl:rotate-180" />
                </Button>
              </div>
            </div>
          );
        }}
        emptyState={<p className="text-sm text-muted-foreground">{t("noLeads")}</p>}
      />

      <Dialog open={!!confirmDel} onOpenChange={(o) => !o && setConfirmDel(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("confirmDeleteTitle")}</DialogTitle>
            <DialogDescription>
              {t("confirmDeleteDesc", { n: confirmDel?.ids.length ?? 0 })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDel(null)}>{tc("cancel")}</Button>
            <Button variant="destructive" onClick={doDelete} disabled={busy}>{t("bulkDelete")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BulkBar({
  count,
  busy,
  counselors,
  stages,
  pipelines,
  onAssign,
  onStage,
  onPipeline,
  onDelete,
  onClear,
  t,
}: {
  count: number;
  busy: boolean;
  counselors: Counselor[];
  stages: PipelineStage[];
  pipelines: Option[];
  onAssign: (counselorId: string) => void;
  onStage: (stageKey: string) => void;
  onPipeline: (pipelineId: string) => void;
  onDelete: () => void;
  onClear: () => void;
  t: (key: string, values?: Record<string, number | string>) => string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-4 py-2.5">
      <span className="text-sm font-medium text-primary">{t("nSelected", { n: count })}</span>
      <span className="mx-1 h-5 w-px bg-border" />

      <BulkMenu icon={<UserPlus className="size-4" />} label={t("bulkAssign")} busy={busy}
        items={counselors.map((c) => ({ value: c.id, label: c.name }))} onPick={onAssign} empty={t("bulkNoAgents")} />
      <BulkMenu icon={<ArrowRightLeft className="size-4" />} label={t("bulkMoveStage")} busy={busy}
        items={stages.map((s) => ({ value: s.key, label: s.name }))} onPick={onStage} empty="—" />
      <BulkMenu icon={<GitBranch className="size-4" />} label={t("bulkMovePipeline")} busy={busy}
        items={pipelines} onPick={onPipeline} empty={t("bulkNoPipelines")} />

      <Button variant="outline" size="sm" className="gap-1.5 text-destructive hover:text-destructive" disabled={busy} onClick={onDelete}>
        <Trash2 className="size-4" />{t("bulkDelete")}
      </Button>
      <Button variant="ghost" size="sm" className="ms-auto gap-1.5" onClick={onClear}>
        <X className="size-4" />{t("bulkClear")}
      </Button>
    </div>
  );
}

function BulkMenu({
  icon,
  label,
  items,
  onPick,
  busy,
  empty,
}: {
  icon: React.ReactNode;
  label: string;
  items: Option[];
  onPick: (value: string) => void;
  busy: boolean;
  empty: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5" disabled={busy}>
          {icon}{label}<ChevronDown className="size-3.5 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-h-72 overflow-y-auto">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.length ? (
          items.map((it) => (
            <DropdownMenuItem key={it.value} onClick={() => onPick(it.value)}>{it.label}</DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem disabled>{empty}</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Filter({
  label,
  value,
  onChange,
  all,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  all: string;
  options: Option[];
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{all}</SelectItem>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
