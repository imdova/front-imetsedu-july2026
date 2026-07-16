"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  Users, Hourglass, PlayCircle, CheckCircle2, DollarSign, Plus, Search, Columns3, CalendarDays, Clock, Pencil, Copy, Trash2, ImagePlus, Loader2, X,
} from "lucide-react";
import { toast } from "sonner";

import { useRouter } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import type { GroupRow, GroupStats, GroupStatus, GroupDetail } from "@/lib/db/groups";
import type { GroupCategoryRow, GroupSubcategoryRow } from "@/lib/dal/groups";
import { cn, formatCurrency, getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useResetOnChange } from "@/hooks/use-reset-on-change";

const STATUS: Record<GroupStatus, { key: string; dot: string; badge: string }> = {
  pending: { key: "grpStPending", dot: "bg-warning", badge: "bg-warning/15 text-warning" },
  inprogress: { key: "grpStInProgress", dot: "bg-chart-3", badge: "bg-chart-3/15 text-chart-3" },
  finished: { key: "grpStFinished", dot: "bg-success", badge: "bg-success/15 text-success" },
};

export function GroupsManagement({
  initial, stats, categories = [], subcategories = [],
}: {
  initial: GroupRow[];
  stats: GroupStats;
  categories?: GroupCategoryRow[];
  subcategories?: GroupSubcategoryRow[];
}) {
  const t = useTranslations("Admin");
  const router = useRouter();
  const [rows, setRows] = React.useState(initial);
  const [tab, setTab] = React.useState<"all" | GroupStatus>("all");
  const [search, setSearch] = React.useState("");
  const [addOpen, setAddOpen] = React.useState(false);
  const [editTarget, setEditTarget] = React.useState<GroupDetail | null>(null);
  const [loadingEditId, setLoadingEditId] = React.useState<string | null>(null);
  const [duplicatingId, setDuplicatingId] = React.useState<string | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const filtered = rows.filter((g) => (tab === "all" || g.status === tab) && g.title.toLowerCase().includes(search.toLowerCase()));

  const kpis = [
    { label: t("grpKpiTotal"), value: `${stats.total}`, icon: Users, tone: "bg-primary/10 text-primary" },
    { label: t("grpKpiPending"), value: `${stats.pending}`, icon: Hourglass, tone: "bg-warning/15 text-warning" },
    { label: t("grpKpiInProgress"), value: `${stats.inprogress}`, icon: PlayCircle, tone: "bg-chart-3/15 text-chart-3" },
    { label: t("grpKpiFinished"), value: `${stats.finished}`, icon: CheckCircle2, tone: "bg-success/15 text-success" },
    { label: t("grpKpiStudents"), value: `${stats.totalStudents}`, icon: Users, tone: "bg-chart-2/15 text-chart-2" },
    { label: t("grpKpiRevenue"), value: stats.totalRevenue > 0 ? formatCurrency(stats.totalRevenue, "EGP") : "$0", icon: DollarSign, tone: "bg-success/12 text-success" },
  ];

  const tabs = [
    { key: "all" as const, label: t("grpTabAll"), dot: "" },
    { key: "pending" as const, label: t("grpTabPending"), dot: "bg-warning" },
    { key: "inprogress" as const, label: t("grpTabInProgress"), dot: "bg-chart-3" },
    { key: "finished" as const, label: t("grpTabFinished"), dot: "bg-success" },
  ];

  const openEdit = async (g: GroupRow) => {
    setLoadingEditId(g.id);
    const res = await dal.groups.fetchGroup(g.id);
    setLoadingEditId(null);
    if (res.ok && res.data) setEditTarget(res.data);
    else toast.error(res.ok ? t("grpLoadFailed") : res.error);
  };

  const duplicate = async (g: GroupRow) => {
    setDuplicatingId(g.id);
    const res = await dal.groups.duplicateGroup(g.id);
    setDuplicatingId(null);
    if (res.ok) {
      setRows((p) => [res.data, ...p]);
      toast.success(t("csDuplicated", { name: g.title }));
    } else {
      toast.error(res.error);
    }
  };

  const removeGroup = async (g: GroupRow) => {
    setDeletingId(g.id);
    const res = await dal.groups.deleteGroup(g.id);
    setDeletingId(null);
    if (res.ok) {
      setRows((p) => p.filter((x) => x.id !== g.id));
      toast.success(t("csDeleted", { name: g.title }));
    } else {
      toast.error(res.error);
    }
  };

  const onCreated = (row: GroupRow) => { setRows((p) => [row, ...p]); setAddOpen(false); };
  const onUpdated = (row: GroupRow) => { setRows((p) => p.map((x) => (x.id === row.id ? row : x))); setEditTarget(null); };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">{t("grpTitle")}</h1>
          <p className="text-sm text-muted-foreground">{t("grpSubtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("grpSearch")} className="w-56 ps-9" />
          </div>
          <Button className="gap-1.5" onClick={() => setAddOpen(true)}><Plus className="size-4" />{t("grpNew")}</Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border border-border/70 bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between"><p className="text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground">{k.label}</p><span className={cn("grid size-8 place-items-center rounded-lg", k.tone)}><k.icon className="size-4" /></span></div>
            <p className="mt-3 font-heading text-2xl font-bold tabular-nums">{k.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1">
            {tabs.map((tb) => (
              <button key={tb.key} onClick={() => setTab(tb.key)}
                className={cn("inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors", tab === tb.key ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground")}>
                {tb.dot && <span className={cn("size-1.5 rounded-full", tb.dot)} />}{tb.label}
              </button>
            ))}
          </div>
          <Select defaultValue="all"><SelectTrigger className="w-auto"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">{t("grpAllCats")}</SelectItem></SelectContent></Select>
          <Select disabled><SelectTrigger className="w-auto"><SelectValue placeholder={t("grpSelectCat")} /></SelectTrigger><SelectContent /></Select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 gap-1.5"><Columns3 className="size-4" />{t("grpColumns")}</Button>
          <span className="text-sm text-muted-foreground tabular-nums">{t("grpOfN", { a: 1, b: 1 })}</span>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-5 py-3 text-start font-semibold"><input type="checkbox" /></th>
              <th className="px-3 py-3 text-start font-semibold">{t("grpColTitle")}</th>
              <th className="px-3 py-3 text-start font-semibold">{t("grpColCreated")}</th>
              <th className="px-3 py-3 text-start font-semibold">{t("grpColCategory")}</th>
              <th className="px-3 py-3 text-start font-semibold">{t("grpColSubcategory")}</th>
              <th className="px-3 py-3 text-start font-semibold">{t("grpColSchedule")}</th>
              <th className="px-3 py-3 text-start font-semibold">{t("grpColStatus")}</th>
              <th className="px-3 py-3 text-center font-semibold">{t("grpColStudents")}</th>
              <th className="px-3 py-3 text-end font-semibold">{t("grpColRevenue")}</th>
              <th className="px-5 py-3 text-end font-semibold">{t("grpColActions")}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((g) => {
              const s = STATUS[g.status];
              return (
                <tr key={g.id} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="px-5 py-4"><input type="checkbox" /></td>
                  <td className="px-3 py-4">
                    <button onClick={() => router.push(`/admin/groups/${g.id}`)} className="flex items-center gap-3 text-start">
                      {g.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={g.image} alt="" className="size-11 w-16 shrink-0 rounded-md object-cover" />
                      ) : (
                        <span className="grid size-11 w-16 shrink-0 place-items-center rounded-md bg-gradient-to-br from-chart-2/30 to-primary/20 text-xs font-semibold text-primary">{getInitials(g.title)}</span>
                      )}
                      <span className="font-medium hover:text-primary">{g.title}</span>
                    </button>
                  </td>
                  <td className="px-3 py-4 text-muted-foreground tabular-nums">{g.createdAt}</td>
                  <td className="px-3 py-4 text-muted-foreground">{g.category}</td>
                  <td className="px-3 py-4 text-muted-foreground">{g.subcategory}</td>
                  <td className="px-3 py-4">
                    <p className="inline-flex items-center gap-1.5 text-xs"><CalendarDays className="size-3.5 text-primary" />{g.startDate} → {g.endDate}</p>
                    <p className="mt-0.5 inline-flex items-center gap-1.5 text-xs font-medium text-primary"><Clock className="size-3" />{g.startTime} - {g.endTime}</p>
                  </td>
                  <td className="px-3 py-4"><Badge className={cn("border-transparent gap-1", s.badge)}><span className={cn("size-1.5 rounded-full", s.dot)} />{t(s.key)}</Badge></td>
                  <td className="px-3 py-4 text-center"><span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary tabular-nums">{g.students}</span></td>
                  <td className="px-3 py-4 text-end font-medium tabular-nums">{g.revenue > 0 ? formatCurrency(g.revenue, "EGP") : "$0"}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="size-8 text-primary" disabled={loadingEditId === g.id} onClick={() => openEdit(g)}>
                        {loadingEditId === g.id ? <Loader2 className="size-4 animate-spin" /> : <Pencil className="size-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="size-8" disabled={duplicatingId === g.id} onClick={() => duplicate(g)}>
                        {duplicatingId === g.id ? <Loader2 className="size-4 animate-spin" /> : <Copy className="size-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="size-8 text-destructive" disabled={deletingId === g.id} onClick={() => removeGroup(g)}>
                        {deletingId === g.id ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <GroupFormModal open={addOpen} onClose={() => setAddOpen(false)} categories={categories} subcategories={subcategories} onSaved={onCreated} />
      {editTarget && (
        <GroupFormModal open onClose={() => setEditTarget(null)} categories={categories} subcategories={subcategories} group={editTarget} onSaved={onUpdated} />
      )}
    </div>
  );
}

function GroupFormModal({
  open, onClose, categories, subcategories, group, onSaved,
}: {
  open: boolean;
  onClose: () => void;
  categories: GroupCategoryRow[];
  subcategories: GroupSubcategoryRow[];
  group?: GroupDetail;
  onSaved: (row: GroupRow) => void;
}) {
  const t = useTranslations("Admin");
  const isEdit = !!group;

  const [title, setTitle] = React.useState("");
  const [images, setImages] = React.useState<string[]>([]);
  const [categoryId, setCategoryId] = React.useState("");
  const [subcategoryId, setSubcategoryId] = React.useState("");
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [zoomLink, setZoomLink] = React.useState("");
  const [lectureDay, setLectureDay] = React.useState("");
  const [startTime, setStartTime] = React.useState("");
  const [endTime, setEndTime] = React.useState("");
  const [whatsapp, setWhatsapp] = React.useState("");
  const [uploading, setUploading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useResetOnChange([open, group], () => {
    if (!open) return;
    setTitle(group?.title ?? "");
    setImages(group?.groupImages ?? []);
    setCategoryId(group?.categoryId ?? "");
    setSubcategoryId(group?.subcategoryId ?? "");
    setStartDate(group?.startDateISO ?? "");
    setEndDate(group?.endDateISO ?? "");
    setZoomLink(group?.zoomLink ?? "");
    setLectureDay(group?.lectureDay ?? "");
    setStartTime(group?.startTime ?? "");
    setEndTime(group?.endTime ?? "");
    setWhatsapp(group?.whatsappGroupLink ?? "");
  });

  const subOptions = subcategories.filter((s) => !categoryId || s.parentId === categoryId);

  const onFile = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    const res = await dal.upload.uploadFile(file);
    setUploading(false);
    if (res.ok) setImages((p) => [...p, res.data.url]);
    else toast.error(res.error || t("grpUploadFailed"));
  };

  const removeImage = (url: string) => setImages((p) => p.filter((u) => u !== url));

  const save = async () => {
    if (!title.trim() || !categoryId || !startDate || !endDate) return;
    setSaving(true);
    const payload = {
      title: title.trim(),
      category: categoryId,
      subcategory: subcategoryId,
      startDate,
      endDate,
      lmsCourses: [] as string[],
      groupImages: images,
      whatsappGroupLink: whatsapp.trim() || undefined,
      schedule: (zoomLink || lectureDay || startTime || endTime)
        ? [{ zoomLink: zoomLink.trim(), lectureDay: lectureDay.trim(), startTime, endTime }]
        : undefined,
    };
    const res = isEdit ? await dal.groups.updateGroup(group!.id, payload) : await dal.groups.createGroup(payload);
    setSaving(false);
    if (res.ok) {
      toast.success(isEdit ? t("grpUpdated") : t("grpCreated"));
      onSaved(res.data);
    } else {
      toast.error(res.error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Users className="size-5 text-primary" />{isEdit ? t("editGroupTitle") : t("addGroupTitle")}</DialogTitle>
          <DialogDescription>{isEdit ? t("editGroupHint") : t("addGroupHint")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5"><Label>{t("grpFTitle")} <span className="text-destructive">*</span></Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("grpFTitlePh")} /></div>

          <div className="space-y-1.5">
            <Label>{t("grpImages")}</Label>
            <div className="flex flex-wrap gap-2">
              {images.map((url) => (
                <div key={url} className="relative size-28 overflow-hidden rounded-lg border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="size-full object-cover" />
                  <button type="button" onClick={() => removeImage(url)} className="absolute end-1 top-1 grid size-5 place-items-center rounded-full bg-black/60 text-white"><X className="size-3" /></button>
                </div>
              ))}
              <label className={cn("grid h-28 w-28 cursor-pointer place-items-center gap-1 rounded-lg border-2 border-dashed text-center text-muted-foreground hover:bg-muted/30", uploading && "pointer-events-none opacity-60")}>
                {uploading ? <Loader2 className="size-6 animate-spin" /> : <ImagePlus className="size-6" />}
                <span className="text-xs">{uploading ? t("smUploading") : t("grpAddImage")}</span>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ""; }} />
              </label>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label>{t("grpFCategory")} <span className="text-destructive">*</span></Label>
              <Select value={categoryId} onValueChange={(v) => { setCategoryId(v); setSubcategoryId(""); }}>
                <SelectTrigger className="w-full"><SelectValue placeholder={t("grpSelectCategory")} /></SelectTrigger>
                <SelectContent position="popper">{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>{t("grpFSubcategory")}</Label>
              <Select value={subcategoryId} onValueChange={setSubcategoryId} disabled={!categoryId}>
                <SelectTrigger className="w-full"><SelectValue placeholder={categoryId ? t("grpSelectCategory") : t("grpPickCatFirst")} /></SelectTrigger>
                <SelectContent position="popper">{subOptions.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>{t("grpStartDate")} <span className="text-destructive">*</span></Label><Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></div>
            <div className="space-y-1.5"><Label>{t("grpEndDate")} <span className="text-destructive">*</span></Label><Input type="date" value={endDate} min={startDate || undefined} onChange={(e) => setEndDate(e.target.value)} /></div>
          </div>

          <div className="space-y-1.5"><Label>{t("grpWhatsapp")}</Label><Input dir="ltr" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="https://chat.whatsapp.com/…" /></div>

          <div className="space-y-3 rounded-xl border p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("grpScheduleZoom")}</p>
            <div className="space-y-1.5"><Label>{t("grpZoomLink")}</Label><Input dir="ltr" value={zoomLink} onChange={(e) => setZoomLink(e.target.value)} placeholder="https://zoom.us/j/…" /></div>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1.5"><Label className="text-xs">{t("grpDay")}</Label><Input value={lectureDay} onChange={(e) => setLectureDay(e.target.value)} /></div>
              <div className="space-y-1.5"><Label className="text-xs">{t("grpStart")}</Label><Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} /></div>
              <div className="space-y-1.5"><Label className="text-xs">{t("grpEnd")}</Label><Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} /></div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t("grpCancel")}</Button>
          <Button onClick={save} disabled={saving || uploading || !title.trim() || !categoryId || !startDate || !endDate} className="gap-1.5">
            {saving && <Loader2 className="size-4 animate-spin" />}{isEdit ? t("grpSave") : t("grpCreate")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
