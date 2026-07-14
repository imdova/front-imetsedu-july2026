"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  DndContext, DragOverlay, PointerSensor, KeyboardSensor, useSensor, useSensors,
  useDroppable, closestCorners, type DragStartEvent, type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  LayoutGrid, Table2, TrendingUp, Filter, GraduationCap, MapPin, Phone, MessageCircle, Mail, ArrowUpRight, SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";

import { useRouter } from "@/i18n/navigation";
import type { Lead, PipelineStage } from "@/lib/db/crm";
import type { GroupCategoryRow, GroupSubcategoryRow } from "@/lib/dal/groups";
import { dal } from "@/lib/dal";
import { cn, formatCurrency, getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { PriorityBadge } from "./lead-badges";
import { LeadTransitionModal, type TransitionLogData } from "./lead-transition-modal";
import { useCrmVariables } from "@/hooks/use-crm-variables";
import { usePipelineStages } from "@/hooks/use-pipeline-stages";
import { usePermission } from "@/hooks/use-permission";
import { STAGE_ACCENT, STAGE_LABEL_KEY } from "../lib/maps";

type Board = Record<string, Lead[]>;
type GatedStage = "contacted" | "enrolled" | "lost";
const GATED: GatedStage[] = ["contacted", "enrolled", "lost"];

function groupByStage(leads: Lead[], stages: PipelineStage[]): Board {
  const board: Board = {};
  stages.forEach((s) => (board[s.key] = []));
  leads.forEach((l) => (board[l.stageKey] ??= []).push(l));
  return board;
}

function parseAge(s: string): number {
  if (/just now|today/i.test(s)) return 0;
  const m = s.match(/(\d+)/);
  return m ? Math.min(parseInt(m[1], 10), 30) / 10 : 0.5;
}

const STAGE_PROBABILITY: Record<string, number> = {
  new: 0.1, contacted: 0.35, waiting_payment: 0.7, enrolled: 1, lost: 0,
};

export function PipelineBoard({
  leads, stages, basePath, groupOptions = [], categories = [], subcategories = [], courseNameById = {},
}: {
  leads: Lead[];
  stages: PipelineStage[];
  basePath: string;
  /** Real groups for the "enrolled" transition modal's group selector. */
  groupOptions?: { value: string; label: string; categoryId?: string; subcategoryId?: string }[];
  /** Group categories/sub-categories, for the "enrolled" modal's cascading pickers. */
  categories?: GroupCategoryRow[];
  subcategories?: GroupSubcategoryRow[];
  /** Map of course id → display name, fetched server-side. */
  courseNameById?: Record<string, string>;
}) {
  const t = useTranslations("Crm");
  const tr = t as unknown as (k: string) => string;
  const router = useRouter();
  const { getOptionsById, isMounted: varsMounted } = useCrmVariables();
  const { stages: crmStages, getDisplayName } = usePipelineStages(stages);

  const [view, setView] = React.useState<"kanban" | "table" | "forecast">("kanban");
  const [course, setCourse] = React.useState("all");
  const [specialty, setSpecialty] = React.useState("all");
  const [source, setSource] = React.useState("all");
  const [stageFilter, setStageFilter] = React.useState("all");

  const [board, setBoard] = React.useState<Board>(() => groupByStage(leads, stages));
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [mounted, setMounted] = React.useState(false);
  const [pending, setPending] = React.useState<{ lead: Lead; from: string; to: GatedStage } | null>(null);
  React.useEffect(() => setMounted(true), []);

  const courses = React.useMemo(() => {
    const map = new Map<string, string>();
    leads.forEach((l) => {
      l.coursesOfInterest.forEach((id, i) => {
        if (id && !map.has(id)) {
          map.set(id, courseNameById[id] || l.courseNames?.[i] || id);
        }
      });
    });
    return Array.from(map.entries()).map(([value, label]) => ({ value, label }));
  }, [leads, courseNameById]);
  const specialties = React.useMemo(() => {
    if (!varsMounted) return [];
    return getOptionsById("6a05e1f537c10d66e58aff55");
  }, [getOptionsById, varsMounted]);

  const sources = React.useMemo(() => {
    if (!varsMounted) return [];
    return getOptionsById("6a05eda937c10d66e58b0154");
  }, [getOptionsById, varsMounted]);

  const matches = React.useCallback((l: Lead) =>
    (course === "all" || l.coursesOfInterest.includes(course)) &&
    (specialty === "all" || l.specialty === specialty) &&
    (source === "all" || l.source === source), [course, specialty, source]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  );

  const findContainer = (id: string) =>
    board[id] ? id : Object.keys(board).find((k) => board[k].some((l) => l.id === id));

  const activeLead = activeId ? Object.values(board).flat().find((l) => l.id === activeId) : null;

  const commitMove = async (lead: Lead, from: string, to: string, logData?: TransitionLogData) => {
    setBoard((prev) => ({
      ...prev,
      [from]: prev[from].filter((l) => l.id !== lead.id),
      [to]: [{ ...lead, stageKey: to }, ...prev[to]],
    }));
    // Persist the modal selections (group, course, nationality) in the stage history.
    const res = await dal.crm.updateLeadStage(lead.id, to, logData);
    if (res.ok) {
      toast.success(t("stageMoved", { stage: getDisplayName(to) }));
      // Enrolling adds the lead to the chosen group's roster.
      if (to === "enrolled" && logData?.groupId) {
        const r = await dal.groups.addLeadToGroup(logData.groupId, lead.id);
        if (r.ok) toast.success(t("addedToGroup"));
        else toast.error(r.error);
      }
    }
  };

  const canMoveStage = usePermission("crm.pipelines.view");

  async function onDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    const from = findContainer(String(active.id));
    const to = findContainer(String(over.id));
    if (!from || !to || from === to) return;

    if (!canMoveStage) {
      toast.error(t("noPermissionToMoveLeads") || "You do not have permission to move leads between stages");
      return;
    }

    const lead = board[from].find((l) => l.id === active.id);
    if (!lead) return;
    if (GATED.includes(to as GatedStage)) {
      setPending({ lead, from, to: to as GatedStage }); // gate behind a qualification modal
      return;
    }
    void commitMove(lead, from, to);
  }

  const visibleStages = crmStages.filter((s) => stageFilter === "all" || s.key === stageFilter);

  return (
    <div className="space-y-5">
      {/* Toolbar: view toggle + filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-lg border p-0.5">
          {([["kanban", LayoutGrid, t("viewKanban")], ["table", Table2, t("viewTable")], ["forecast", TrendingUp, t("viewForecast")]] as const).map(([v, Icon, label]) => (
            <button key={v} onClick={() => setView(v)}
              className={cn("inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                view === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
              <Icon className="size-4" />{label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <FilterSelect icon label={t("filterStageLabel")} value={stageFilter} onChange={setStageFilter}
            all={t("allStages")} options={crmStages.map((s) => ({ value: s.key, label: s.name }))} />
          <FilterSelect label={t("filterCourse")} value={course} onChange={setCourse} all={t("filterCourse")}
            options={courses} />
          <FilterSelect label={t("filterSpecialty")} value={specialty} onChange={setSpecialty} all={t("filterSpecialty")}
            options={specialties.map((s) => ({ value: s, label: s }))} />
          <FilterSelect label={t("filterSourceChip")} value={source} onChange={setSource} all={t("filterSourceChip")}
            options={sources.map((s) => ({ value: s, label: s }))} />
        </div>
      </div>

      {view === "kanban" && (
        <KanbanView
          stages={visibleStages} board={board} matches={matches} mounted={mounted} sensors={sensors}
          onDragStart={(e: DragStartEvent) => setActiveId(String(e.active.id))} onDragEnd={onDragEnd}
          activeLead={activeLead} basePath={basePath} router={router} t={t} tr={tr} courseNameById={courseNameById}
          getDisplayName={getDisplayName}
        />
      )}
      {view === "table" && <TableView leads={Object.values(board).flat().filter(matches)} t={t} tr={tr} basePath={basePath} router={router} courseNameById={courseNameById} />}
      {view === "forecast" && <ForecastView stages={stages} board={board} t={t} tr={tr} />}

      {pending && (
        <LeadTransitionModal
          lead={pending.lead}
          targetStage={pending.to}
          groupOptions={groupOptions}
          categories={categories}
          subcategories={subcategories}
          onConfirm={(data) => { void commitMove(pending.lead, pending.from, pending.to, data); setPending(null); }}
          onCancel={() => setPending(null)}
        />
      )}
    </div>
  );
}

/* ───────────────────────── Kanban ───────────────────────── */
function KanbanView({ stages, board, matches, mounted, sensors, onDragStart, onDragEnd, activeLead, basePath, router, t, tr, courseNameById, getDisplayName }: any) {
  const columns = (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {stages.map((stage: any) => {
        const rows: Lead[] = (board[stage.key] ?? []).filter(matches);
        return (
          <Column key={stage.key} stage={stage} rows={rows} droppable={mounted} t={t} tr={tr}>
            {mounted ? (
              <SortableContext items={rows.map((l) => l.id)} strategy={verticalListSortingStrategy}>
                {rows.map((lead) => (
                  <DraggableCard key={lead.id} lead={lead} t={t} tr={tr} courseNameById={courseNameById} onOpen={() => router.push(`${basePath}/leads/${lead.id}`)} getDisplayName={getDisplayName} />
                ))}
              </SortableContext>
            ) : (
              rows.map((lead) => <LeadCardInner key={lead.id} lead={lead} t={t} tr={tr} courseNameById={courseNameById} onOpen={() => router.push(`${basePath}/leads/${lead.id}`)} getDisplayName={getDisplayName} />)
            )}
          </Column>
        );
      })}
    </div>
  );

  if (!mounted) return columns;
  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      {columns}
      <DragOverlay>{activeLead ? <LeadCardInner lead={activeLead} t={t} tr={tr} courseNameById={courseNameById} getDisplayName={getDisplayName} dragging /> : null}</DragOverlay>
    </DndContext>
  );
}

function Column({ stage, rows, droppable, t, tr, children }: any) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.key, disabled: !droppable });
  const count = rows.length;
  const total = rows.reduce((s: number, l: Lead) => s + (l.paymentPlan?.totalAmount ?? 0), 0);
  const avgAge = count ? (rows.reduce((s: number, l: Lead) => s + parseAge(l.createdAt), 0) / count).toFixed(1) : "0.0";

  return (
    <div className="flex w-80 shrink-0 flex-col">
      <div className="mb-2.5 rounded-t-xl border border-b-0 border-border/70 bg-card p-3">
        <div className="flex items-center gap-2">
          <span className={cn("size-2 rounded-full", STAGE_ACCENT[stage.key])} />
          <span className="text-xs uppercase tracking-wide text-muted-foreground">Circle</span>
          <span className="truncate text-sm font-semibold uppercase">{stage.name}</span>
          <span className="ms-auto rounded-full bg-muted px-2 py-0.5 text-xs font-medium tabular-nums">{count}</span>
        </div>
        <div className="mt-1.5 text-xs text-muted-foreground">
          {total > 0 ? t("colTotal", { amount: formatCurrency(total, "EGP") }) : t("noTotal")}
        </div>
        <div className="mt-0.5 flex items-center justify-between text-xs text-muted-foreground">
          <span>{t("avgAge", { days: avgAge })}</span>
          {count > 0 && <span className="inline-flex items-center gap-1"><span className="size-1.5 rounded-full bg-success" />{count}/{count}</span>}
        </div>
      </div>
      <div ref={setNodeRef}
        className={cn("flex min-h-40 flex-1 flex-col gap-2.5 rounded-b-xl border border-t-0 border-border/70 bg-muted/30 p-2.5 transition-colors",
          isOver && "ring-2 ring-primary/40")}>
        {count === 0 ? (
          <div className="grid flex-1 place-items-center rounded-lg border border-dashed py-10 text-center text-xs text-muted-foreground">{t("dropHere")}</div>
        ) : children}
      </div>
    </div>
  );
}

function DraggableCard({ lead, t, tr, onOpen, courseNameById, getDisplayName }: { lead: Lead; t: any; tr: any; onOpen: () => void; courseNameById?: Record<string, string>; getDisplayName?: (key: string) => string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: lead.id });
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(isDragging && "opacity-40")} {...attributes} {...listeners}>
      <LeadCardInner lead={lead} t={t} tr={tr} onOpen={onOpen} courseNameById={courseNameById} getDisplayName={getDisplayName} />
    </div>
  );
}

function LeadCardInner({ lead, t, tr, dragging, onOpen, courseNameById = {}, getDisplayName }: { lead: Lead; t: any; tr: any; dragging?: boolean; onOpen?: () => void; courseNameById?: Record<string, string>; getDisplayName?: (key: string) => string }) {
  const isEnrolled = lead.stageKey === "enrolled";
  const isWaiting = lead.stageKey === "waiting_payment";

  return (
    <div className={cn("rounded-lg border border-border/70 border-s-2 border-s-primary/60 bg-card p-3 shadow-sm",
      dragging && "shadow-lg ring-1 ring-primary/30")}>
      <div className="flex items-start gap-2.5">
        <Avatar className="size-8 border"><AvatarFallback className="bg-primary/10 text-[10px] font-medium text-primary">{getInitials(lead.fullName)}</AvatarFallback></Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{lead.fullName}</p>
          <p className="truncate text-xs text-muted-foreground tabular-nums" dir="ltr">{lead.phone}</p>
        </div>
      </div>

      {lead.coursesOfInterest[0] && (
        <p className="mt-2.5 inline-flex items-center gap-1.5 text-sm font-medium">
          <GraduationCap className="size-4 text-muted-foreground" />
          {courseNameById[lead.coursesOfInterest[0]] || lead.courseNames?.[0] || lead.coursesOfInterest[0]}
        </p>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <PriorityBadge priority={lead.priority} />
        {lead.gender && <Badge variant="outline" className="uppercase">{lead.gender === "female" ? "Female" : "Male"}</Badge>}
        <Badge variant="secondary" className="tabular-nums">{lead.score}</Badge>
      </div>

      {lead.specialty && <p className="mt-2 inline-flex items-center gap-1.5 text-sm"><span className="size-1.5 rounded-full bg-foreground/60" />{lead.specialty}</p>}
      <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin className="size-3" />{lead.country} · {lead.createdAt}</p>
      <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground"><span aria-hidden>📍</span>{lead.source}</p>

      {(isWaiting || isEnrolled) && (
        <div className="mt-2.5 space-y-1.5 rounded-lg bg-primary/[0.06] p-2.5">
          <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">{t("lastTransition", { stage: getDisplayName ? getDisplayName(lead.stageKey) : (tr(STAGE_LABEL_KEY[lead.stageKey]) || lead.stageKey) })}</p>
          <div className="flex flex-wrap gap-1">
            <Badge variant="outline" className="text-[0.65rem]">{t("pipelineName", { name: "CPHQ 2" })}</Badge>
            {isEnrolled && <>
              <Badge variant="outline" className="text-[0.65rem]">{t("paymentVerified")}</Badge>
              <Badge variant="outline" className="text-[0.65rem]">{t("dealValue", { value: lead.paymentPlan?.totalAmount ?? 1000 })}</Badge>
              <Badge variant="outline" className="text-[0.65rem]">{t("currencyLabel", { cur: "EGP" })}</Badge>
              <Badge variant="outline" className="text-[0.65rem]">{t("groupLabel", { group: "CPHQ-G42" })}</Badge>
            </>}
          </div>
        </div>
      )}

      <div className="mt-2.5 flex items-center justify-between border-t pt-2 text-xs">
        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
          <span className="grid size-4 place-items-center rounded-full bg-chart-2/20 text-[0.55rem] font-semibold text-chart-2">{getInitials(lead.counselorName)}</span>
          {lead.counselorName}
        </span>
        <Badge className="border-transparent bg-warning/15 text-[0.6rem] uppercase text-warning">{t("slaBadge")}</Badge>
      </div>

      <div className="mt-2.5 flex items-center gap-1.5">
        <Button size="sm" className="h-8 flex-1" onClick={onOpen}>{isEnrolled ? t("openProfile") : t("viewProfile")}</Button>
        <Button asChild size="icon" variant="outline" className="size-8"><a href={`tel:${lead.phone}`} onClick={(e) => e.stopPropagation()}><Phone className="size-3.5" /></a></Button>
        <Button asChild size="icon" variant="outline" className="size-8"><a href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}><MessageCircle className="size-3.5" /></a></Button>
        <Button asChild size="icon" variant="outline" className="size-8"><a href={`mailto:${lead.email}`} onClick={(e) => e.stopPropagation()}><Mail className="size-3.5" /></a></Button>
      </div>
    </div>
  );
}

/* ───────────────────────── Table ───────────────────────── */
const TABLE_COLS = ["stage", "priority", "course", "specialty", "source", "counselor", "deal", "created"] as const;
type TableCol = (typeof TABLE_COLS)[number];
const COL_END: Record<string, boolean> = { deal: true };
const TABLE_COLS_LS = "crm:pipeline-table-cols-v1";

function TableView({ leads, t, tr, basePath, router, courseNameById = {} }: any) {
  const { getDisplayName } = usePipelineStages();
  const rows: Lead[] = leads;
  // Column visibility (persisted). Lead + open columns are always shown.
  const [visible, setVisible] = React.useState<Record<TableCol, boolean>>(
    () => Object.fromEntries(TABLE_COLS.map((c) => [c, true])) as Record<TableCol, boolean>,
  );
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(TABLE_COLS_LS);
      if (raw) setVisible((prev) => ({ ...prev, ...JSON.parse(raw) }));
    } catch { /* ignore */ }
  }, []);
  const setCol = (c: TableCol, on: boolean) =>
    setVisible((prev) => {
      const next = { ...prev, [c]: on };
      try { localStorage.setItem(TABLE_COLS_LS, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  const resetCols = () => {
    const all = Object.fromEntries(TABLE_COLS.map((c) => [c, true])) as Record<TableCol, boolean>;
    setVisible(all);
    try { localStorage.removeItem(TABLE_COLS_LS); } catch { /* ignore */ }
  };

  const label: Record<TableCol, string> = {
    stage: t("colStage"), priority: t("colPriority"), course: t("sumCourse"), specialty: t("fSpecialty"),
    source: t("sumSource"), counselor: t("colCounselor"), deal: t("colDeal"), created: t("colCreated"),
  };
  const shown = TABLE_COLS.filter((c) => visible[c]);

  const cell = (c: TableCol, l: Lead) => {
    switch (c) {
      case "stage":
        return <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium"><span className={cn("size-2 rounded-full", STAGE_ACCENT[l.stageKey])} />{getDisplayName(l.stageKey)}</span>;
      case "priority":
        return <div className="flex items-center gap-1.5"><PriorityBadge priority={l.priority} /><span className="rounded bg-muted px-1.5 text-xs font-semibold tabular-nums">{l.score}</span></div>;
      case "course":
        return <span className="line-clamp-1 max-w-[180px] text-muted-foreground">{courseNameById[l.coursesOfInterest[0]] || l.courseNames?.[0] || l.coursesOfInterest[0] || "—"}</span>;
      case "specialty":
        return <span className="text-muted-foreground">{l.specialty || "—"}</span>;
      case "source":
        return l.source ? <Badge variant="secondary" className="font-normal">{l.source}</Badge> : <span className="text-muted-foreground">—</span>;
      case "counselor":
        return <span className="inline-flex items-center gap-1.5 text-muted-foreground"><span className="grid size-5 place-items-center rounded-full bg-chart-2/20 text-[0.55rem] font-semibold text-chart-2">{getInitials(l.counselorName)}</span>{l.counselorName}</span>;
      case "deal":
        return l.paymentPlan?.totalAmount
          ? <span className="font-medium tabular-nums">{formatCurrency(l.paymentPlan.totalAmount, l.paymentPlan.currency ?? "EGP")}</span>
          : <span className="text-muted-foreground">—</span>;
      case "created":
        return <span className="text-xs text-muted-foreground">{l.createdAt}</span>;
    }
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">{t("tableCount", { n: rows.length })}</p>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 gap-1.5"><SlidersHorizontal className="size-4" />{t("columnsBtn")}</Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-56 p-2">
            <div className="flex items-center justify-between px-1 pb-1.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("columnsBtn")}</p>
              <button onClick={resetCols} className="text-xs font-medium text-primary hover:underline">{t("resetColumns")}</button>
            </div>
            <div className="space-y-0.5">
              {TABLE_COLS.map((c) => (
                <label key={c} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted">
                  <Checkbox checked={visible[c]} onCheckedChange={(v) => setCol(c, v === true)} />
                  {label[c]}
                </label>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm" style={{ minWidth: `${320 + shown.length * 130}px` }}>
          <thead>
            <tr className="border-b bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 text-start font-semibold">{t("colLead")}</th>
              {shown.map((c) => (
                <th key={c} className={cn("px-4 py-3 font-semibold", COL_END[c] ? "text-end" : "text-start")}>{label[c]}</th>
              ))}
              <th className="px-4 py-3 text-end font-semibold"><span className="sr-only">{t("colOpen")}</span></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((l: Lead) => (
              <tr key={l.id} className="group cursor-pointer border-b last:border-0 hover:bg-muted/30" onClick={() => router.push(`${basePath}/leads/${l.id}`)}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar className="size-8 border"><AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">{getInitials(l.fullName)}</AvatarFallback></Avatar>
                    <div className="min-w-0">
                      <p className="truncate font-medium leading-tight">{l.fullName}</p>
                      <p className="truncate text-xs text-muted-foreground tabular-nums" dir="ltr">{l.phoneCountryCode}{l.phone}</p>
                    </div>
                  </div>
                </td>
                {shown.map((c) => (
                  <td key={c} className={cn("px-4 py-3", COL_END[c] && "text-end")}>{cell(c, l)}</td>
                ))}
                <td className="px-4 py-3 text-end">
                  <ArrowUpRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 rtl:-scale-x-100" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ───────────────────────── Forecast ───────────────────────── */
function ForecastView({ stages, board, t, tr }: any) {
  const { getDisplayName } = usePipelineStages(stages);
  const VALUE = 9900;
  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-4 py-3 text-start font-semibold">{t("forecastStage")}</th>
            <th className="px-4 py-3 text-center font-semibold">{t("forecastLeads")}</th>
            <th className="px-4 py-3 text-center font-semibold">{t("forecastProbability")}</th>
            <th className="px-4 py-3 text-end font-semibold">{t("forecastWeighted")}</th>
          </tr>
        </thead>
        <tbody>
          {stages.filter((s: PipelineStage) => s.key !== "lost" && s.key !== "dead").map((s: PipelineStage) => {
            const count = (board[s.key] ?? []).length;
            const prob = STAGE_PROBABILITY[s.key] ?? 0;
            return (
              <tr key={s.key} className="border-b last:border-0">
                <td className="px-4 py-3 font-medium">{getDisplayName(s.key)}</td>
                <td className="px-4 py-3 text-center tabular-nums">{count}</td>
                <td className="px-4 py-3 text-center tabular-nums">{Math.round(prob * 100)}%</td>
                <td className="px-4 py-3 text-end font-medium tabular-nums">{formatCurrency(Math.round(count * VALUE * prob), "EGP")}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function FilterSelect({ icon, label, value, onChange, all, options }: {
  icon?: boolean; label: string; value: string; onChange: (v: string) => void; all: string;
  options: { value: string; label: string }[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9 w-auto gap-1.5">
        {icon && <Filter className="size-3.5 text-muted-foreground" />}
        <span className="text-muted-foreground">{label}:</span>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{all}</SelectItem>
        {options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}
