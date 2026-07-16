"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import {
  Users, DollarSign, BookOpen, Gauge, Award, Star, Pencil, ArrowUpRight, Plus, Search, Trash2, ChevronLeft, ChevronRight, Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { Link, useRouter } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import type { LmsCourseDetail, AssignedGroupStatus, LmsAssignedGroup } from "@/lib/db/lms";
import { cn, formatCurrency, getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUpload } from "@/components/shared/image-upload";
import { CurriculumBuilder } from "./curriculum-builder";
import { StudyMaterialsTab, AssignmentsTab, StudentsTab } from "./lms-extra-tabs";
import { PickerDialog } from "./lms-picker-dialog";
import { useResetOnChange } from "@/hooks/use-reset-on-change";

type Tab = "overview" | "groups" | "curriculum" | "materials" | "assignments" | "students";
const VALID_TABS: Tab[] = ["overview", "groups", "curriculum", "materials", "assignments", "students"];
type GroupOption = { id: string; name: string };
type CategoryOption = { id: string; name: string };
type SubcategoryOption = CategoryOption & { parentId: string };
export type EnrolledStudent = { id: string; name: string; email: string; country: string; leadSource: string };
export type StudentOption = { id: string; name: string; email: string };

const GROUP_STATUS_OF: Record<string, AssignedGroupStatus> = { pending: "upcoming", inprogress: "active", finished: "completed" };

const GROUP_STATUS: Record<AssignedGroupStatus, { key: string; style: string }> = {
  upcoming: { key: "lmsStUpcoming", style: "bg-chart-3/15 text-chart-3" },
  active: { key: "lmsStActive", style: "bg-success/15 text-success" },
  completed: { key: "lmsStCompleted", style: "bg-muted text-muted-foreground" },
};

export function LmsCourseDetail({
  course,
  availableGroups = [],
  enrolledStudents = [],
  availableStudents = [],
  categoryOptions = [],
  subcategoryOptions = [],
}: {
  course: LmsCourseDetail;
  availableGroups?: GroupOption[];
  enrolledStudents?: EnrolledStudent[];
  availableStudents?: StudentOption[];
  categoryOptions?: CategoryOption[];
  subcategoryOptions?: SubcategoryOption[];
}) {
  const t = useTranslations("Admin");
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const initialTab = (VALID_TABS as string[]).includes(requestedTab ?? "") ? (requestedTab as Tab) : "overview";
  const [tab, setTab] = React.useState<Tab>(initialTab);
  const [editOpen, setEditOpen] = React.useState(false);

  const moduleCount = course.modules.length;
  const lessonCount = course.modules.reduce((s, m) => s + m.items.filter((i) => i.type === "lesson").length, 0);

  const tabs: { key: Tab; label: string; badge?: number }[] = [
    { key: "overview", label: t("lmsTabOverview") },
    { key: "groups", label: t("lmsTabGroups") },
    { key: "curriculum", label: t("lmsTabCurriculum"), badge: moduleCount },
    { key: "materials", label: t("lmsTabMaterials") },
    { key: "assignments", label: t("lmsTabAssignments") },
    { key: "students", label: t("lmsTabStudents") },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/admin/lms" className="hover:text-foreground">{t("lmsCatalog")}</Link>
          <ChevronRight className="size-3.5 rtl:rotate-180" /><span className="font-medium text-foreground">{course.name}</span>
        </p>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {course.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={course.image} alt="" className="size-14 shrink-0 rounded-xl object-cover" />
            ) : (
              <span className="grid size-14 shrink-0 place-items-center rounded-xl bg-primary/10 font-heading font-bold text-primary">{getInitials(course.name)}</span>
            )}
            <div>
              <h1 className="font-heading text-2xl font-bold tracking-tight">{course.name}</h1>
              <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="secondary" className="uppercase">{course.category}</Badge> · {t("lmsCreatedOn", { date: course.createdAt })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-success/12 px-3 py-1 text-sm font-medium text-success"><span className="size-1.5 rounded-full bg-success" />{course.active ? t("lmsActive") : t("lmsInactive")}</span>
            <Button className="gap-1.5" onClick={() => setEditOpen(true)}><Pencil className="size-4" />{t("lmsEditDetails")}</Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-1 border-b">
        {tabs.map((tb) => (
          <button key={tb.key} onClick={() => setTab(tb.key)}
            className={cn("inline-flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
              tab === tb.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>
            {tb.label}
            {tb.badge !== undefined && <span className="grid size-5 place-items-center rounded-full bg-muted text-xs tabular-nums">{tb.badge}</span>}
          </button>
        ))}
      </div>

      {tab === "overview" && <Overview course={course} moduleCount={moduleCount} lessonCount={lessonCount} t={t} />}
      {tab === "groups" && <AssignedGroups course={course} availableGroups={availableGroups} t={t} />}
      {tab === "curriculum" && <CurriculumBuilder initial={course.modules} courseId={course.id} onUpdate={() => router.refresh()} />}
      {tab === "materials" && <StudyMaterialsTab lmsId={course.id} initial={course.materials} />}
      {tab === "assignments" && <AssignmentsTab lmsId={course.id} />}
      {tab === "students" && <StudentsTab lmsId={course.id} students={enrolledStudents} availableStudents={availableStudents} />}

      <EditLmsModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        course={course}
        categoryOptions={categoryOptions}
        subcategoryOptions={subcategoryOptions}
        onSaved={() => { setEditOpen(false); router.refresh(); }}
      />
    </div>
  );
}

function EditLmsModal({
  open, onClose, course, categoryOptions, subcategoryOptions, onSaved,
}: {
  open: boolean;
  onClose: () => void;
  course: LmsCourseDetail;
  categoryOptions: CategoryOption[];
  subcategoryOptions: SubcategoryOption[];
  onSaved: () => void;
}) {
  const t = useTranslations("Admin");
  const [title, setTitle] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [subcategory, setSubcategory] = React.useState("");
  const [thumbnail, setThumbnail] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  useResetOnChange([open, course], () => {
    if (!open) return;
    setTitle(course.name);
    setCategory(course.categoryId);
    setSubcategory(course.subcategoryId);
    setThumbnail(course.image);
  });

  const subOptions = subcategoryOptions.filter((s) => !category || s.parentId === category);

  const save = async () => {
    if (!title.trim() || !category) return;
    setSaving(true);
    const res = await dal.lms.updateLmsCourse(course.id, {
      title: title.trim(),
      category,
      subcategory: subcategory || undefined,
      thumbnail: thumbnail ? [thumbnail] : [],
    });
    setSaving(false);
    if (res.ok) {
      toast.success(t("lmsUpdated"));
      onSaved();
    } else {
      toast.error(res.error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Pencil className="size-5 text-primary" />{t("lmsEditDetails")}</DialogTitle>
          <DialogDescription>{t("editLmsHint")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5"><Label>{t("lmsCourseTitle")} <span className="text-destructive">*</span></Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("lmsCourseTitlePh")} /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label>{t("lmsCategory")} <span className="text-destructive">*</span></Label>
              <Select value={category} onValueChange={(v) => { setCategory(v); setSubcategory(""); }}>
                <SelectTrigger className="w-full"><SelectValue placeholder={t("lmsSelectCat")} /></SelectTrigger>
                <SelectContent position="popper">{categoryOptions.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>{t("lmsSubcategory")}</Label>
              <Select value={subcategory} onValueChange={setSubcategory} disabled={!category}>
                <SelectTrigger className="w-full"><SelectValue placeholder={t("lmsSelectSub")} /></SelectTrigger>
                <SelectContent position="popper">{subOptions.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5"><Label>{t("lmsThumbnail")}</Label><ImageUpload value={thumbnail} onChange={setThumbnail} hint={t("lmsThumbnailOptional")} /></div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={saving}>{t("lmsCancel")}</Button>
          <Button onClick={save} disabled={saving || !title.trim() || !category} className="gap-1.5">
            {saving && <Loader2 className="size-4 animate-spin" />}{t("grpSave")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Overview({ course, moduleCount, lessonCount, t }: { course: LmsCourseDetail; moduleCount: number; lessonCount: number; t: (k: string, v?: Record<string, string | number>) => string }) {
  const kpis = [
    { label: t("ovTotalEnrolled"), value: `${course.totalEnrolled}`, sub: t("ovActiveN", { n: 0 }), icon: Users, link: true, tone: "bg-primary/10 text-primary" },
    { label: t("ovRevenue"), value: course.revenue > 0 ? formatCurrency(course.revenue, "EGP") : "$0", sub: course.revenue > 0 ? "" : t("ovNoSales"), icon: DollarSign, tone: "bg-success/12 text-success" },
    { label: t("ovModules"), value: `${moduleCount}`, sub: t("ovLessonsN", { n: lessonCount }), icon: BookOpen, link: true, tone: "bg-chart-4/15 text-chart-4" },
    { label: t("ovProgress"), value: `${course.avgProgress}%`, icon: Gauge, tone: "bg-chart-2/15 text-chart-2" },
    { label: t("ovQuizPass"), value: `${course.quizPassRate}%`, icon: Award, tone: "bg-warning/18 text-warning" },
    { label: t("ovRating"), value: `${course.rating}/${course.ratingCount}`, icon: Star, tone: "bg-chart-3/15 text-chart-3" },
  ];
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border border-border/70 bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <span className={cn("grid size-9 place-items-center rounded-lg", k.tone)}><k.icon className="size-[18px]" /></span>
              {k.link && <ArrowUpRight className="size-4 text-muted-foreground" />}
            </div>
            <p className="mt-3 font-heading text-2xl font-bold tabular-nums">{k.value}</p>
            <p className="mt-0.5 text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground">{k.label}</p>
            {k.sub && <p className="mt-0.5 text-xs text-muted-foreground">{k.sub}</p>}
          </div>
        ))}
      </div>

      <div className="rounded-xl border bg-card">
        <div className="flex items-center justify-between p-5"><h3 className="font-heading text-base font-bold">{t("ovRecentGroups")}</h3><button className="text-sm font-medium text-primary hover:underline">{t("ovViewAll")}</button></div>
        <GroupsTable groups={course.assignedGroups.slice(0, 5)} t={t} compact />
      </div>

      <div className="rounded-xl border bg-card">
        <div className="flex items-center justify-between p-5"><h3 className="font-heading text-base font-bold">{t("ovMaterials")}</h3><span className="text-sm text-muted-foreground">{t("ovModulesN", { n: moduleCount })}</span></div>
      </div>
    </div>
  );
}

function AssignedGroups({ course, availableGroups, t }: {
  course: LmsCourseDetail; availableGroups: GroupOption[]; t: (k: string, v?: Record<string, string | number>) => string;
}) {
  const [groups, setGroups] = React.useState(course.assignedGroups);
  const [available, setAvailable] = React.useState(availableGroups);
  const [filter, setFilter] = React.useState("");
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const filtered = groups.filter((g) => g.name.toLowerCase().includes(filter.toLowerCase()));
  const totalStudents = groups.reduce((s, g) => s + g.studentCount, 0);

  const assign = async (opt: GroupOption) => {
    setBusy(true);
    const res = await dal.lms.assignLmsGroup(course.id, opt.id);
    setBusy(false);
    if (res.ok) {
      const row: LmsAssignedGroup = { id: opt.id, name: opt.name, code: opt.id.slice(-4).toUpperCase(), intakePeriod: "—", studentCount: 0, avgProgress: 0, status: "active" };
      setGroups((p) => [row, ...p]);
      setAvailable((p) => p.filter((x) => x.id !== opt.id));
      toast.success(t("agAssigned", { course: opt.name }));
      setPickerOpen(false);
    } else toast.error(res.error);
  };

  const remove = async (id: string) => {
    const prev = groups;
    const g = groups.find((x) => x.id === id);
    setGroups((p) => p.filter((x) => x.id !== id));
    const res = await dal.lms.unassignLmsGroup(course.id, id);
    if (res.ok) { if (g) setAvailable((p) => [{ id: g.id, name: g.name }, ...p]); }
    else { setGroups(prev); toast.error(res.error); }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Kpi icon={Users} label={t("agTotalAssigned")} value={`${groups.length}`} tone="bg-primary/10 text-primary" />
        <Kpi icon={Users} label={t("agTotalStudents")} value={`${totalStudents}`} tone="bg-success/15 text-success" />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder={t("agFilter")} className="ps-9" />
        </div>
        <Button className="gap-1.5" onClick={() => setPickerOpen(true)}><Plus className="size-4" />{t("agAssignNew")}</Button>
      </div>
      <div className="rounded-xl border bg-card">
        <GroupsTable groups={filtered} t={t} onRemove={remove} />
        <p className="px-5 py-3 text-sm text-muted-foreground">{t("agShowing", { from: filtered.length ? 1 : 0, to: filtered.length, total: filtered.length })}</p>
      </div>

      <PickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        title={t("agPickerTitle")}
        description={t("agPickerDesc")}
        empty={t("agNoneAvailable")}
        busy={busy}
        items={available.map((g) => ({ id: g.id, primary: g.name }))}
        onPick={(id) => { const g = available.find((x) => x.id === id); if (g) assign(g); }}
      />
    </div>
  );
}


function GroupsTable({ groups, t, compact, onRemove }: {
  groups: LmsCourseDetail["assignedGroups"]; t: (k: string, v?: Record<string, string | number>) => string; compact?: boolean; onRemove?: (id: string) => void;
}) {
  if (groups.length === 0) {
    return <p className="px-5 pb-6 text-center text-sm text-muted-foreground">{t("ovNoGroups")}</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-y bg-muted/20 text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-5 py-3 text-start font-semibold">{t("ovGroupName")}</th>
            <th className="px-3 py-3 text-start font-semibold">{t("ovIntake")}</th>
            <th className="px-3 py-3 text-center font-semibold">{compact ? t("ovStudents") : t("agStudentCount")}</th>
            {!compact && <th className="px-3 py-3 text-start font-semibold">{t("agAvgProgress")}</th>}
            <th className="px-3 py-3 text-start font-semibold">{t("ovStatus")}</th>
            <th className="px-5 py-3 text-end font-semibold">{t("ovActions")}</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((g) => {
            const s = GROUP_STATUS[g.status];
            return (
              <tr key={g.id} className="border-b last:border-0">
                <td className="px-5 py-4"><p className="font-medium text-primary">{g.name}</p><p className="text-xs text-muted-foreground">Group {g.code}</p></td>
                <td className="px-3 py-4 text-muted-foreground tabular-nums">{g.intakePeriod}</td>
                <td className="px-3 py-4 text-center tabular-nums">{t("agStudentsN", { n: g.studentCount })}</td>
                {!compact && (
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-2"><div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary" style={{ width: `${g.avgProgress}%` }} /></div><span className="text-xs tabular-nums">{g.avgProgress}%</span></div>
                  </td>
                )}
                <td className="px-3 py-4"><Badge className={cn("border-transparent", s.style)}>{t(s.key)}</Badge></td>
                <td className="px-5 py-4 text-end">
                  {onRemove && <Button variant="ghost" size="icon" className="size-8 text-destructive" onClick={() => onRemove(g.id)}><Trash2 className="size-4" /></Button>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Kpi({ icon: Icon, label, value, tone }: { icon: React.ElementType; label: string; value: string; tone: string }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border/70 bg-card p-5 shadow-sm">
      <span className={cn("grid size-11 place-items-center rounded-xl", tone)}><Icon className="size-5" /></span>
      <div><p className="text-sm text-muted-foreground">{label}</p><p className="font-heading text-2xl font-bold tabular-nums">{value}</p></div>
    </div>
  );
}
