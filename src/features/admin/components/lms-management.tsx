"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  FileText, Gauge, BarChart3, Plus, Search, Filter, Columns3, Users, Pencil, Copy, Trash2, CalendarDays, ChevronLeft, ChevronRight, Info, Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { useRouter } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import type { LmsCourse, LmsStats } from "@/lib/db/lms";
import { cn, formatCurrency, getInitials } from "@/lib/utils";

type CategoryOption = { id: string; name: string };
type SubcategoryOption = CategoryOption & { parentId: string };
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUpload } from "@/components/shared/image-upload";
import { useResetOnChange } from "@/hooks/use-reset-on-change";

export function LmsManagement({
  initial,
  stats,
  categoryOptions = [],
  subcategoryOptions = [],
}: {
  initial: LmsCourse[];
  stats: LmsStats;
  categoryOptions?: CategoryOption[];
  subcategoryOptions?: SubcategoryOption[];
}) {
  const t = useTranslations("Admin");
  const router = useRouter();
  const [rows, setRows] = React.useState(initial);
  const [search, setSearch] = React.useState("");
  const [cat, setCat] = React.useState("all");
  const [status, setStatus] = React.useState("all");
  const [addOpen, setAddOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<LmsCourse | null>(null);

  const categories = React.useMemo(() => Array.from(new Set(initial.map((c) => c.category))), [initial]);
  const filtered = rows.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) &&
    (cat === "all" || c.category === cat) &&
    (status === "all" || (status === "active" ? c.active : !c.active)));

  const toggle = async (id: string) => {
    setRows((p) => p.map((c) => (c.id === id ? { ...c, active: !c.active } : c))); // optimistic
    const res = await dal.lms.toggleLmsCourse(id);
    if (res.ok && res.data) setRows((p) => p.map((c) => (c.id === id ? res.data : c)));
    else if (!res.ok) {
      setRows((p) => p.map((c) => (c.id === id ? { ...c, active: !c.active } : c))); // revert
      toast.error(res.error);
    }
  };

  const duplicate = async (c: LmsCourse) => {
    const res = await dal.lms.duplicateLmsCourse(c.id);
    if (res.ok && res.data) { setRows((p) => [res.data, ...p]); toast.success(t("csDuplicated", { name: c.name })); }
    else if (!res.ok) toast.error(res.error);
  };

  const remove = async (c: LmsCourse) => {
    const prev = rows;
    setRows((p) => p.filter((x) => x.id !== c.id)); // optimistic
    const res = await dal.lms.deleteLmsCourse(c.id);
    if (res.ok) toast.success(t("csDeleted", { name: c.name }));
    else { setRows(prev); toast.error(res.error); }
  };

  const kpis = [
    { label: t("lmsKpiActive"), value: `${stats.activeCourses}`, icon: FileText, tone: "bg-primary/12 text-primary" },
    { label: t("lmsKpiLessons"), value: `${stats.totalLessons}`, icon: Gauge, tone: "bg-chart-2/15 text-chart-2" },
    { label: t("lmsKpiCompletion"), value: `${stats.avgCompletion}%`, icon: BarChart3, tone: "bg-success/15 text-success" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">{t("lmsMgmtTitle")}</h1>
          <p className="text-sm text-muted-foreground">{t("lmsMgmtSubtitle")}</p>
        </div>
        <Button className="gap-1.5" onClick={() => setAddOpen(true)}><Plus className="size-4" />{t("addNewLms")}</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {kpis.map((k) => (
          <div key={k.label} className="flex items-center gap-4 rounded-xl border border-border/70 bg-card p-5 shadow-sm">
            <span className={cn("grid size-11 place-items-center rounded-xl", k.tone)}><k.icon className="size-5" /></span>
            <div><p className="text-sm text-muted-foreground">{k.label}</p><p className="font-heading text-2xl font-bold tabular-nums">{k.value}</p></div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border bg-card p-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("lmsSearch")} className="ps-9" />
          </div>
          <Select value={cat} onValueChange={setCat}>
            <SelectTrigger className="w-auto"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">{t("lmsAllCategories")}</SelectItem>{categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
          <Select defaultValue="all"><SelectTrigger className="w-auto"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">{t("lmsAllSubcats")}</SelectItem></SelectContent></Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-auto"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">{t("lmsStatusAll")}</SelectItem><SelectItem value="active">{t("lmsActive")}</SelectItem><SelectItem value="inactive">{t("lmsInactive")}</SelectItem></SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="h-9 gap-1.5"><Filter className="size-4" />{t("lmsFilters")}</Button>
          <Button variant="outline" size="sm" className="h-9 gap-1.5"><Columns3 className="size-4" />{t("lmsColumns")}</Button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-3 py-3 text-start font-semibold">{t("lmsColCourseName")}</th>
                <th className="px-3 py-3 text-start font-semibold">{t("lmsColCreated")}</th>
                <th className="px-3 py-3 text-start font-semibold">{t("lmsColCategory")}</th>
                <th className="px-3 py-3 text-center font-semibold">{t("lmsColGroups")}</th>
                <th className="px-3 py-3 text-center font-semibold">{t("lmsColEnrollment")}</th>
                <th className="px-3 py-3 text-end font-semibold">{t("lmsColRevenue")}</th>
                <th className="px-3 py-3 text-start font-semibold">{t("lmsColStatus")}</th>
                <th className="px-3 py-3 text-end font-semibold">{t("lmsColActions")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="px-3 py-3">
                    <button onClick={() => router.push(`/admin/lms/${c.id}`)} className="flex items-center gap-3 text-start">
                      {c.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.image} alt="" className="size-10 shrink-0 rounded-lg object-cover" />
                      ) : (
                        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-xs font-semibold text-primary">{getInitials(c.name)}</span>
                      )}
                      <span className="font-medium hover:text-primary">{c.name}</span>
                    </button>
                  </td>
                  <td className="px-3 py-3"><span className="inline-flex items-center gap-1.5 text-muted-foreground"><CalendarDays className="size-3.5" />{c.createdAt}</span></td>
                  <td className="px-3 py-3"><Badge variant="secondary">{c.category}</Badge></td>
                  <td className="px-3 py-3 text-center"><span className="inline-flex items-center gap-1 text-muted-foreground tabular-nums"><Users className="size-3.5" />{c.groups}</span></td>
                  <td className="px-3 py-3 text-center tabular-nums">{c.enrollment}</td>
                  <td className="px-3 py-3 text-end font-medium tabular-nums">{c.revenue > 0 ? formatCurrency(c.revenue, "EGP") : "$0"}</td>
                  <td className="px-3 py-3"><div className="flex items-center gap-2"><Switch checked={c.active} onCheckedChange={() => toggle(c.id)} /><span className={cn("text-xs", c.active ? "text-success" : "text-muted-foreground")}>{c.active ? t("lmsActive") : t("lmsInactive")}</span></div></td>
                  <td className="px-3 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="size-8" onClick={() => router.push(`/admin/lms/${c.id}`)}><Users className="size-4" /></Button>
                      <Button variant="ghost" size="icon" className="size-8 text-primary" onClick={() => setEditing(c)}><Pencil className="size-4" /></Button>
                      <Button variant="ghost" size="icon" className="size-8" onClick={() => duplicate(c)}><Copy className="size-4" /></Button>
                      <Button variant="ghost" size="icon" className="size-8 text-destructive" onClick={() => remove(c)}><Trash2 className="size-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{t("lmsShowing", { from: filtered.length ? 1 : 0, to: filtered.length, total: filtered.length })}</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="size-8" disabled><ChevronLeft className="size-4 rtl:rotate-180" /></Button>
            <span className="grid size-8 place-items-center rounded-md bg-primary text-sm font-medium text-primary-foreground">1</span>
            <Button variant="outline" size="icon" className="size-8" disabled><ChevronRight className="size-4 rtl:rotate-180" /></Button>
          </div>
        </div>
      </div>

      <AddLmsModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        categoryOptions={categoryOptions}
        onCreated={(c) => setRows((p) => [c, ...p])}
      />

      <EditLmsModal
        open={!!editing}
        course={editing}
        onClose={() => setEditing(null)}
        categoryOptions={categoryOptions}
        subcategoryOptions={subcategoryOptions}
        onSaved={(c) => { setRows((p) => p.map((x) => (x.id === c.id ? c : x))); setEditing(null); }}
      />
    </div>
  );
}

function AddLmsModal({
  open,
  onClose,
  categoryOptions,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  categoryOptions: CategoryOption[];
  onCreated: (course: LmsCourse) => void;
}) {
  const t = useTranslations("Admin");
  const [title, setTitle] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [thumbnail, setThumbnail] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  const reset = () => { setTitle(""); setCategory(""); setThumbnail(""); };

  const create = async () => {
    if (!title.trim()) { toast.error(t("lmsTitleRequired")); return; }
    if (!category) { toast.error(t("lmsCategoryRequired")); return; }
    setSaving(true);
    const res = await dal.lms.createLmsCourse({ title: title.trim(), category, thumbnail: thumbnail ? [thumbnail] : [] });
    setSaving(false);
    if (res.ok && res.data) {
      onCreated(res.data);
      toast.success(t("lmsCourseCreated"));
      reset();
      onClose();
    } else if (!res.ok) {
      toast.error(res.error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { reset(); onClose(); } }}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Info className="size-5 text-primary" />{t("addLmsTitle")}</DialogTitle>
          <DialogDescription>{t("addLmsHint")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5"><Label>{t("lmsCourseTitle")} <span className="text-destructive">*</span></Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("lmsCourseTitlePh")} /></div>
          <div className="space-y-1.5"><Label>{t("lmsCategory")} <span className="text-destructive">*</span></Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue placeholder={t("lmsSelectCat")} /></SelectTrigger>
              <SelectContent>{categoryOptions.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><Label>{t("lmsThumbnail")}</Label><ImageUpload value={thumbnail} onChange={setThumbnail} hint={t("lmsThumbnailOptional")} /></div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => { reset(); onClose(); }} disabled={saving}>{t("lmsCancel")}</Button>
          <Button onClick={create} disabled={saving}>{t("lmsCreateCourse")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditLmsModal({
  open,
  course,
  onClose,
  categoryOptions,
  subcategoryOptions,
  onSaved,
}: {
  open: boolean;
  course: LmsCourse | null;
  onClose: () => void;
  categoryOptions: CategoryOption[];
  subcategoryOptions: SubcategoryOption[];
  onSaved: (course: LmsCourse) => void;
}) {
  const t = useTranslations("Admin");
  const [title, setTitle] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [subcategory, setSubcategory] = React.useState("");
  const [thumbnail, setThumbnail] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  useResetOnChange([open, course], () => {
    if (!open || !course) return;
    setTitle(course.name);
    setCategory(course.categoryId);
    setSubcategory(course.subcategoryId);
    setThumbnail(course.image);
  });

  const subOptions = subcategoryOptions.filter((s) => !category || s.parentId === category);

  const save = async () => {
    if (!course || !title.trim() || !category) return;
    setSaving(true);
    const res = await dal.lms.updateLmsCourse(course.id, {
      title: title.trim(),
      category,
      subcategory: subcategory || undefined,
      thumbnail: thumbnail ? [thumbnail] : [],
    });
    setSaving(false);
    if (res.ok && res.data) {
      toast.success(t("lmsUpdated"));
      onSaved(res.data);
    } else if (!res.ok) {
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
