"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft, LayoutGrid, MoreHorizontal, Plus, Users, Trophy, TrendingUp, DollarSign, CalendarDays, Clock, Video, UserCog, ChevronRight, Search, Mail, Phone, Award, Trash2, Filter,
} from "lucide-react";
import { toast } from "sonner";

import { Link } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import type { GroupDetail, RosterStudent } from "@/lib/db/groups";
import { cn, formatCurrency, getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AddStudentDialog } from "./add-student-dialog";
import { AssignmentsTab } from "./lms-extra-tabs";

type Tab = "overview" | "students" | "lms" | "assignments";
const VALID_TABS: Tab[] = ["overview", "students", "lms", "assignments"];

export function GroupDetailFull({ group, isStaff = false }: { group: GroupDetail; isStaff?: boolean }) {
  const t = useTranslations("Admin");
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const initialTab = (VALID_TABS as string[]).includes(requestedTab ?? "") ? (requestedTab as Tab) : "overview";
  const [tab, setTab] = React.useState<Tab>(initialTab);
  const enrolled = group.roster.length;
  const collectedPct = group.revenueTarget > 0 ? Math.round((group.collected / group.revenueTarget) * 100) : 0;

  const tabs: { key: Tab; label: string; badge: number }[] = [
    { key: "overview", label: t("gdTabOverview"), badge: -1 },
    { key: "students", label: t("gdTabStudents"), badge: enrolled },
    { key: "lms", label: t("gdTabLms"), badge: group.assignedLms },
    { key: "assignments", label: t("gdTabAssignments"), badge: 0 },
  ];

  const kpis = [
    { label: t("gdEnrolled"), value: `${enrolled}`, sub: t("gdEnrolledSub", { active: 0, done: 0 }), icon: Users, tone: "bg-primary/10 text-primary" },
    { label: t("gdCompleted"), value: "0", sub: t("gdCompletedSub", { n: 0 }), icon: Trophy, tone: "bg-success/15 text-success" },
    { label: t("gdAvgProgress"), value: "0%", sub: t("gdAcrossRoster"), icon: TrendingUp, tone: "bg-chart-2/15 text-chart-2" },
    { label: t("gdPaidAmount"), value: formatCurrency(group.collected, "EGP"), sub: t("gdPaidSub", { pct: collectedPct, total: formatCurrency(group.revenueTarget, "EGP") }), icon: DollarSign, tone: "bg-warning/18 text-warning" },
    { label: t("gdRemaining"), value: formatCurrency(group.outstanding, "EGP"), sub: t("gdFullyCollected"), icon: CalendarDays, tone: "bg-chart-3/15 text-chart-3" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start gap-4">
        <span className="grid h-24 w-40 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-chart-2/30 to-primary/20 font-heading text-lg font-bold text-primary">{getInitials(group.title)}</span>
        <div className="min-w-0 flex-1 space-y-2">
          <p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <Link href="/admin/groups" className="hover:text-foreground"><ArrowLeft className="size-4 rtl:rotate-180" /></Link>
            <LayoutGrid className="size-3.5" /> CRM <ChevronRight className="size-3 rtl:rotate-180" />
            <Link href="/admin/groups" className="hover:text-foreground">{t("grpTitle")}</Link>
            <ChevronRight className="size-3 rtl:rotate-180" /><span className="font-medium text-foreground">{group.title}</span>
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-heading text-2xl font-bold tracking-tight">{group.title}</h1>
            <Badge className="border-transparent gap-1 bg-warning/15 text-warning"><Clock className="size-3" />{t("grpStPending")}</Badge>
            <span className="inline-flex items-center gap-1 text-sm text-muted-foreground"><UserCog className="size-3.5" />{t("gdUnassigned")}</span>
          </div>
          <p className="text-sm"><span className="font-semibold">{group.category}</span> <span className="text-muted-foreground">· {group.subcategory}</span></p>
          <p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground"><CalendarDays className="size-3.5 text-primary" />{group.startDate} → {group.endDate}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="size-9"><MoreHorizontal className="size-4" /></Button>
          <AddStudentDialog groupId={group.id} className="gap-1.5"><Plus className="size-4" />{t("gdAddStudent")}</AddStudentDialog>
        </div>
      </div>

      {/* Summary bar */}
      <div className="grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-4">
        {[
          { label: t("gdRevTarget"), value: formatCurrency(group.revenueTarget, "EGP") },
          { label: t("gdCollected"), value: `${formatCurrency(group.collected, "EGP")} (${collectedPct}%)` },
          { label: t("gdOutstanding"), value: formatCurrency(group.outstanding, "EGP") },
          { label: t("gdCreated"), value: group.createdAt },
        ].map((c) => (
          <div key={c.label} className="bg-card p-4"><p className="text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground">{c.label}</p><p className="mt-1 font-heading text-lg font-bold tabular-nums">{c.value}</p></div>
        ))}
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border border-border/70 bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between"><p className="text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground">{k.label}</p><span className={cn("grid size-8 place-items-center rounded-lg", k.tone)}><k.icon className="size-4" /></span></div>
            <p className="mt-3 font-heading text-2xl font-bold tabular-nums">{k.value}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-1 rounded-xl border bg-card p-1">
        {tabs.map((tb) => (
          <button key={tb.key} onClick={() => setTab(tb.key)}
            className={cn("inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors", tab === tb.key ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground")}>
            {tb.label}{tb.badge >= 0 && <span className="grid size-5 place-items-center rounded-full bg-muted text-xs tabular-nums">{tb.badge}</span>}
          </button>
        ))}
      </div>

      {tab === "overview" && <Overview group={group} t={t} />}
      {tab === "students" && <StudentsList groupId={group.id} roster={group.roster} t={t} isStaff={isStaff} />}
      {tab === "assignments" && <AssignmentsTab groupId={group.id} />}
      {tab === "lms" && (
        <div className="grid place-items-center rounded-xl border border-dashed py-20 text-center text-muted-foreground">{t("lmsEmptyTab")}</div>
      )}
    </div>
  );
}

function Overview({ group, t }: { group: GroupDetail; t: (k: string, v?: Record<string, string | number>) => string }) {
  const [view, setView] = React.useState<"schedule" | "zoom">("schedule");
  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-card p-5">
        <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted/40 p-1">
          {(["schedule", "zoom"] as const).map((v) => (
            <button key={v} onClick={() => setView(v)} className={cn("inline-flex items-center justify-center gap-1.5 rounded-md py-2 text-sm font-medium", view === v ? "bg-card shadow-sm" : "text-muted-foreground")}>
              {v === "schedule" ? <CalendarDays className="size-4" /> : <Video className="size-4" />}{v === "schedule" ? t("gdSchedule") : t("gdZoom")}
            </button>
          ))}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label={t("gdProgramStart")} value={group.startDate} />
          <Field label={t("gdProgramEnd")} value={group.endDate} />
        </div>
        <div className="mt-4"><Field label={t("gdRecurringSlot")} value={t("gdSlot", { day: group.lectureDay, start: group.startTime, end: group.endTime })} /></div>
      </div>

      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-center justify-between">
          <div><h3 className="font-heading text-base font-bold">{t("gdRecentStudents")}</h3><p className="text-sm text-muted-foreground">{t("gdRecentSub")}</p></div>
          <button className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">{t("gdOpenRoster")}<ChevronRight className="size-3.5 rtl:rotate-180" /></button>
        </div>
        {group.roster.length === 0 ? (
          <div className="mt-4 grid place-items-center gap-3 rounded-xl border border-dashed py-12 text-center">
            <span className="grid size-12 place-items-center rounded-xl bg-muted"><Users className="size-6 text-muted-foreground" /></span>
            <p className="font-semibold">{t("gdNoStudents")}</p><p className="text-sm text-muted-foreground">{t("gdNoStudentsHint")}</p>
            <AddStudentDialog groupId={group.id} className="gap-1.5"><Plus className="size-4" />{t("gdAddStudent")}</AddStudentDialog>
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            {group.roster.slice(0, 5).map((s) => (
              <div key={s.id} className="flex items-center gap-3 rounded-lg border p-3">
                <span className="grid size-9 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{getInitials(s.name)}</span>
                <div className="min-w-0"><p className="truncate font-medium">{s.name}</p><p className="truncate text-xs text-muted-foreground">{s.email}</p></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StudentsList({ groupId, roster, t, isStaff = false }: { groupId: string; roster: RosterStudent[]; t: (k: string, v?: Record<string, string | number>) => string; isStaff?: boolean }) {
  const [rows, setRows] = React.useState(roster);
  const [search, setSearch] = React.useState("");
  const filtered = rows.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase()));
  const active = rows.filter((s) => s.status === "approved").length;

  const toggleStatus = async (student: RosterStudent) => {
    const nextApproved = student.status !== "approved";
    setRows((p) => p.map((x) => (x.id === student.id ? { ...x, status: nextApproved ? "approved" : "pending" } : x)));
    const res = await dal.groups.updateStudentStatus(groupId, student.id, nextApproved);
    if (!res.ok) {
      setRows((p) => p.map((x) => (x.id === student.id ? { ...x, status: student.status } : x)));
      toast.error(res.error);
    }
  };

  return (
    <div className="rounded-xl border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 p-5">
        <div><h3 className="font-heading text-base font-bold">{t("gdEnrolledStudents")}</h3><p className="text-sm text-muted-foreground">{t("gdRosterSub", { total: rows.length, active, completed: 0, dropped: 0 })}</p></div>
        <AddStudentDialog groupId={groupId} className="gap-1.5"><Plus className="size-4" />{t("gdAddStudent")}</AddStudentDialog>
      </div>
      <div className="flex flex-wrap items-center gap-2 border-t px-5 py-3">
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground"><Filter className="size-4" />{t("gdFilters")}</span>
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("gdSearchStudent")} className="ps-9" />
        </div>
        {[t("gdAllSources"), t("gdAllStatuses"), t("gdAllPayments")].map((label, i) => (
          <Select key={i} defaultValue="all"><SelectTrigger className="w-auto"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">{label}</SelectItem></SelectContent></Select>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-y bg-muted/20 text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-5 py-3 text-start font-semibold">{t("gdColName")}</th>
            <th className="px-3 py-3 text-start font-semibold">{t("gdColEnrolled")}</th>
            <th className="px-3 py-3 text-start font-semibold">{t("gdColCountry")}</th>
            <th className="px-3 py-3 text-start font-semibold">{t("gdColSource")}</th>
            <th className="px-3 py-3 text-start font-semibold">{t("gdColProgress")}</th>
            <th className="px-3 py-3 text-start font-semibold">{t("gdColStatus")}</th>
            <th className="px-3 py-3 text-start font-semibold">{t("gdColPayment")}</th>
            <th className="px-3 py-3 text-start font-semibold">{t("gdColDue")}</th>
            <th className="px-5 py-3 text-end font-semibold">{t("gdColActions")}</th>
          </tr></thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={9} className="py-12 text-center text-muted-foreground">{t("gdNoRoster")}</td></tr>
            ) : filtered.map((s) => (
              <tr key={s.id} className="border-b last:border-0">
                <td className="px-5 py-4"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{getInitials(s.name)}</span><div><p className="font-medium">{s.name}</p><p className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Mail className="size-3" />{s.email}</p><p className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Phone className="size-3" />{s.phone}</p></div></div></td>
                <td className="px-3 py-4 text-muted-foreground tabular-nums">{s.enrolledDate}</td>
                <td className="px-3 py-4 text-muted-foreground">{s.country}</td>
                <td className="px-3 py-4"><Badge variant="secondary" className="text-chart-3">{s.leadSource}</Badge></td>
                <td className="px-3 py-4"><div className="flex items-center gap-2"><div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary" style={{ width: `${s.progress}%` }} /></div><span className="rounded-full bg-warning/15 px-1.5 text-xs text-warning tabular-nums">{s.progress}%</span></div></td>
                <td className="px-3 py-4"><div className="flex items-center gap-2"><Switch checked={s.status === "approved"} disabled={isStaff} onCheckedChange={() => !isStaff && toggleStatus(s)} /><span className={cn("inline-flex items-center gap-1 text-xs", s.status === "approved" ? "text-success" : "text-muted-foreground")}><span className={cn("size-1.5 rounded-full", s.status === "approved" ? "bg-success" : "bg-muted-foreground")} />{t("gdApproved")}</span></div></td>
                <td className="px-3 py-4"><Badge className="border-transparent bg-warning/15 text-warning">{t("gdPaymentPending")}</Badge></td>
                <td className="px-3 py-4 text-muted-foreground">—</td>
                <td className="px-5 py-4"><div className="flex items-center justify-end gap-1"><Button variant="ghost" size="icon" className="size-8"><Award className="size-4" /></Button><Button variant="ghost" size="icon" className="size-8 text-destructive" onClick={() => setRows((p) => p.filter((x) => x.id !== s.id))}><Trash2 className="size-4" /></Button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}
