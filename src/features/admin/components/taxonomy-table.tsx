"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { GripVertical, Search, Download, Plus, Pencil, Trash2, Copy, Clock, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useRouter } from "@/i18n/navigation";
import type { TaxonomyRow, CourseSubcategory } from "@/lib/db/course-taxonomy";
import { dal } from "@/lib/dal";
import { cn, getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

type Row = TaxonomyRow & Partial<Pick<CourseSubcategory, "parentName" | "parentId" | "slug">>;
type Kind = "category" | "subcategory" | "tag";

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export function TaxonomyTable({
  initial, allLabel, nameLabel, showParent = false, addHref, kind = "category", parentCategories = [],
}: {
  initial: Row[];
  allLabel: string;
  nameLabel: string;
  showParent?: boolean;
  addHref?: string;
  kind?: Kind;
  parentCategories?: { id: string; name: string }[];
}) {
  const t = useTranslations("Admin");
  const router = useRouter();
  const [rows, setRows] = React.useState<Row[]>(initial);
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(0);
  const [dragIndex, setDragIndex] = React.useState<number | null>(null);
  const pageSize = 10;

  // Inline add/edit dialog (sub-categories + tags; categories use the dedicated page for create).
  const [addOpen, setAddOpen] = React.useState(false);
  const [editRow, setEditRow] = React.useState<Row | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [downloading, setDownloading] = React.useState(false);
  const [form, setForm] = React.useState({ nameEn: "", nameAr: "", slug: "", parentId: "", slugEdited: false });

  const resetForm = () => {
    setForm({ nameEn: "", nameAr: "", slug: "", parentId: "", slugEdited: false });
    setEditRow(null);
  };

  const onAddClick = () => {
    if (addHref) { router.push(addHref); return; }
    resetForm();
    setAddOpen(true);
  };

  const openEdit = (r: Row) => {
    if (kind === "category") {
      router.push(`/admin/courses/settings/category/${r.id}`);
      return;
    }
    if (kind === "subcategory") {
      router.push(`/admin/courses/settings/subcategory/${r.id}`);
      return;
    }
    // tags: keep inline dialog
    setEditRow(r);
    setForm({
      nameEn: r.nameEn,
      nameAr: r.nameAr,
      slug: r.slug ?? slugify(r.nameEn),
      parentId: r.parentId ?? "",
      slugEdited: Boolean(r.slug),
    });
    setAddOpen(true);
  };

  const closeForm = () => {
    setAddOpen(false);
    resetForm();
  };

  const updateRow = async () => {
    if (!editRow) return;
    if (!form.nameEn.trim() || !form.nameAr.trim()) { toast.error(t("csNameRequired")); return; }
    if (kind === "subcategory" && !form.parentId) { toast.error(t("csParentRequired")); return; }
    setSaving(true);
    let updated: Row | null = null;
    let error: string | null = null;
    if (kind === "tag") {
      const res = await dal.courseTaxonomy.updateCourseTag(editRow.id, {
        nameEn: form.nameEn.trim(),
        nameAr: form.nameAr.trim(),
      });
      if (res.ok) updated = res.data;
      else error = res.error;
    } else if (kind === "subcategory") {
      const res = await dal.courseTaxonomy.updateCourseSubcategory(editRow.id, {
        nameEn: form.nameEn.trim(),
        nameAr: form.nameAr.trim(),
        slug: form.slug.trim() || slugify(form.nameEn),
        parentCategory: form.parentId,
      });
      if (res.ok) {
        const parentName = parentCategories.find((p) => p.id === form.parentId)?.name;
        updated = parentName ? { ...res.data, parentName } : res.data;
      } else error = res.error;
    } else {
      const res = await dal.courseTaxonomy.updateCourseCategory(editRow.id, {
        nameEn: form.nameEn.trim(),
        nameAr: form.nameAr.trim(),
      });
      if (res.ok) updated = res.data;
      else error = res.error;
    }
    setSaving(false);
    if (updated) {
      setRows((p) => p.map((r) => (r.id === editRow.id ? { ...r, ...updated } : r)));
      toast.success(t("csUpdated", { name: updated.nameEn }));
      closeForm();
    } else if (error) {
      toast.error(error);
    }
  };

  const createRow = async () => {
    if (!form.nameEn.trim() || !form.nameAr.trim()) { toast.error(t("csNameRequired")); return; }
    if (kind === "subcategory" && !form.parentId) { toast.error(t("csParentRequired")); return; }
    setSaving(true);
    let created: Row | null = null;
    let error: string | null = null;
    if (kind === "tag") {
      const res = await dal.courseTaxonomy.createCourseTag({ nameEn: form.nameEn.trim(), nameAr: form.nameAr.trim(), isActive: true });
      if (res.ok) created = res.data; else error = res.error;
    } else if (kind === "subcategory") {
      const res = await dal.courseTaxonomy.createCourseSubcategory({
        nameEn: form.nameEn.trim(),
        nameAr: form.nameAr.trim(),
        slug: (form.slug.trim() || slugify(form.nameEn)),
        parentCategory: form.parentId,
        isActive: true,
      });
      if (res.ok) {
        const parentName = parentCategories.find((p) => p.id === form.parentId)?.name;
        created = parentName ? { ...res.data, parentName } : res.data;
      } else error = res.error;
    }
    setSaving(false);
    if (created) {
      setRows((p) => [created as Row, ...p]);
      toast.success(t("csCreated", { name: created.nameEn }));
      closeForm();
    } else if (error) {
      toast.error(error);
    }
  };

  const filtered = rows.filter((r) => r.nameEn.toLowerCase().includes(search.toLowerCase()) || r.nameAr.includes(search));
  const pageRows = filtered.slice(page * pageSize, page * pageSize + pageSize);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));

  const toggle = async (id: string) => {
    const row = rows.find((r) => r.id === id);
    if (!row) return;
    const next = !row.active;
    const prev = rows;
    setRows((p) => p.map((r) => (r.id === id ? { ...r, active: next } : r)));
    let res;
    if (kind === "tag") {
      res = await dal.courseTaxonomy.toggleCourseTagActive(id);
    } else if (kind === "subcategory") {
      res = await dal.courseTaxonomy.updateCourseSubcategory(id, { isActive: next });
    } else {
      res = await dal.courseTaxonomy.updateCourseCategory(id, { isActive: next });
    }
    if (res.ok) {
      if (kind === "subcategory") {
        const sub = res.data as CourseSubcategory;
        const parentName = parentCategories.find((p) => p.id === sub.parentId)?.name ?? row.parentName;
        setRows((p) => p.map((r) => (r.id === id ? { ...sub, parentName } : r)));
      } else {
        setRows((p) => p.map((r) => (r.id === id ? { ...r, ...res.data } : r)));
      }
      toast.success(t("csStatusToggled"));
    } else {
      setRows(prev);
      toast.error(res.error);
    }
  };

  const duplicate = async (r: Row) => {
    let created: Row | null = null;
    let error: string | null = null;
    if (kind === "tag") {
      const res = await dal.courseTaxonomy.createCourseTag({
        nameEn: `${r.nameEn} (copy)`,
        nameAr: `${r.nameAr} (copy)`,
        isActive: r.active,
      });
      if (res.ok) created = res.data;
      else error = res.error;
    } else if (kind === "subcategory") {
      const res = await dal.courseTaxonomy.duplicateCourseSubcategory(r.id);
      if (res.ok) {
        const parentName = parentCategories.find((p) => p.id === res.data.parentId)?.name ?? r.parentName;
        created = { ...res.data, parentName };
      } else error = res.error;
    } else {
      const res = await dal.courseTaxonomy.duplicateCourseCategory(r.id);
      if (res.ok) created = res.data;
      else error = res.error;
    }
    if (created) {
      setRows((p) => [created as Row, ...p]);
      toast.success(t("csDuplicated", { name: r.nameEn }));
    } else if (error) {
      toast.error(error);
    }
  };

  const download = async () => {
    if (kind === "tag") {
      const header = "nameEn,nameAr,rank,courses,active\n";
      const body = rows.map((r) =>
        `"${r.nameEn.replace(/"/g, '""')}","${r.nameAr.replace(/"/g, '""')}",${r.rank},${r.courses},${r.active}`,
      ).join("\n");
      const blob = new Blob([header + body], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "tags.csv";
      a.click();
      URL.revokeObjectURL(url);
      toast.success(t("csvExported"));
      return;
    }
    setDownloading(true);
    const call = kind === "subcategory"
      ? dal.courseTaxonomy.downloadCourseSubcategories
      : dal.courseTaxonomy.downloadCourseCategories;
    const res = await call();
    setDownloading(false);
    if (res.ok) toast.success(t("csDownloadStarted"));
    else toast.error(res.error);
  };
  const remove = async (r: Row) => {
    const prev = rows;
    setRows((p) => p.filter((x) => x.id !== r.id)); // optimistic
    const del =
      kind === "tag" ? dal.courseTaxonomy.deleteCourseTag
      : kind === "subcategory" ? dal.courseTaxonomy.deleteCourseSubcategory
      : dal.courseTaxonomy.deleteCourseCategory;
    const res = await del(r.id);
    if (res.ok) {
      toast.success(t("csDeleted", { name: r.nameEn }));
    } else {
      setRows(prev); // rollback
      toast.error(res.error);
    }
  };

  const onDrop = async (targetId: string) => {
    if (dragIndex === null) return;
    const dragged = filtered[dragIndex];
    const targetIdx = rows.findIndex((r) => r.id === targetId);
    const fromIdx = rows.findIndex((r) => r.id === dragged.id);
    if (fromIdx === -1 || targetIdx === -1 || fromIdx === targetIdx) return;
    const prev = rows;
    const next = [...rows];
    next.splice(targetIdx, 0, next.splice(fromIdx, 1)[0]);
    const reordered = next.map((r, i) => ({ ...r, rank: i }));
    setRows(reordered);
    setDragIndex(null);
    if (kind === "tag") {
      toast.success(t("csReordered"));
      return;
    }
    const newRank = reordered.findIndex((r) => r.id === dragged.id);
    const res = kind === "subcategory"
      ? await dal.courseTaxonomy.updateCourseSubcategory(dragged.id, { priority: newRank })
      : await dal.courseTaxonomy.updateCourseCategory(dragged.id, { rank: newRank });
    if (res.ok) toast.success(t("csReordered"));
    else {
      setRows(prev);
      toast.error(res.error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="inline-flex items-center gap-2 font-heading text-xl font-bold tracking-tight">
          {allLabel}<span className="grid size-6 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground tabular-nums">{rows.length}</span>
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-1.5" onClick={download} disabled={downloading}>
            {downloading ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
            {t("csDownload")}
          </Button>
          <Button className="gap-1.5" onClick={onAddClick}>
            <Plus className="size-4" />{t("csAddNew")}
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} placeholder={t("csSearchName")} className="ps-9" />
        </div>
        <Button className="gap-1.5"><Search className="size-4" />{t("csSearch")}</Button>
      </div>

      <p className="text-sm text-muted-foreground">{t("csReorderHint")}</p>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30 text-xs uppercase tracking-wide text-muted-foreground">
              <th className="w-8 px-2 py-3" />
              <th className="px-3 py-3 text-start font-semibold">{t("csColImage")}</th>
              <th className="px-3 py-3 text-start font-semibold">{nameLabel}</th>
              {showParent && <th className="px-3 py-3 text-start font-semibold">{t("csColParent")}</th>}
              <th className="px-3 py-3 text-center font-semibold">{t("csColRank")}</th>
              <th className="px-3 py-3 text-start font-semibold">{t("csColCreatedAt")}</th>
              <th className="px-3 py-3 text-center font-semibold">{t("csColCourses")}</th>
              <th className="px-3 py-3 text-center font-semibold">{t("csColStatus")}</th>
              <th className="px-3 py-3 text-end font-semibold">{t("csColActions")}</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((r, i) => (
              <tr key={r.id}
                draggable
                onDragStart={() => setDragIndex(page * pageSize + i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDrop(r.id)}
                className="border-b last:border-0 hover:bg-muted/20">
                <td className="px-2 py-3"><GripVertical className="size-4 cursor-grab text-muted-foreground active:cursor-grabbing" /></td>
                <td className="px-3 py-3">
                  <span className="grid size-9 place-items-center rounded-md bg-primary/10 text-xs font-semibold text-primary">{getInitials(r.nameEn)}</span>
                </td>
                <td className="px-3 py-3"><p className="font-medium">{r.nameEn}</p><p className="text-xs text-muted-foreground" dir="rtl">{r.nameAr}</p></td>
                {showParent && <td className="px-3 py-3 text-muted-foreground">{r.parentName}</td>}
                <td className="px-3 py-3 text-center"><span className="grid size-7 place-items-center rounded-md bg-muted text-xs font-medium tabular-nums">{r.rank}</span></td>
                <td className="px-3 py-3"><p className="tabular-nums">{r.createdAt}</p><p className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Clock className="size-3" />{r.createdTime}</p></td>
                <td className="px-3 py-3 text-center tabular-nums">{r.courses}</td>
                <td className="px-3 py-3">
                  <div className="flex flex-col items-center gap-1">
                    <Switch checked={r.active} onCheckedChange={() => toggle(r.id)} />
                    <span className={cn("text-xs", r.active ? "text-success" : "text-muted-foreground")}>{r.active ? t("csActive") : t("csInactive")}</span>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="size-8 text-primary" onClick={() => openEdit(r)}><Pencil className="size-4" /></Button>
                    <Button variant="ghost" size="icon" className="size-8 text-destructive" onClick={() => remove(r)}><Trash2 className="size-4" /></Button>
                    <Button variant="ghost" size="icon" className="size-8 text-primary" onClick={() => duplicate(r)}><Copy className="size-4" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {t("csShow")} <span className="font-medium">{pageSize}</span> {t("csPerPage")} · {t("csShowing", { from: filtered.length ? page * pageSize + 1 : 0, to: Math.min((page + 1) * pageSize, filtered.length), total: filtered.length })}
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1" disabled={page === 0} onClick={() => setPage((p) => p - 1)}><ChevronLeft className="size-4 rtl:rotate-180" />{t("csPrevious")}</Button>
          <span className="grid size-8 place-items-center rounded-md bg-primary text-sm font-medium text-primary-foreground tabular-nums">{page + 1}</span>
          <Button variant="outline" size="sm" className="gap-1" disabled={page >= pageCount - 1} onClick={() => setPage((p) => p + 1)}>{t("csNext")}<ChevronRight className="size-4 rtl:rotate-180" /></Button>
        </div>
      </div>

      <Dialog open={addOpen} onOpenChange={(o) => { if (!o) closeForm(); else setAddOpen(true); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editRow ? t("csEdit") : t("csAddNew")}</DialogTitle>
            <DialogDescription>{allLabel}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>{nameLabel} (EN) <span className="text-destructive">*</span></Label>
              <Input
                value={form.nameEn}
                onChange={(e) => setForm((f) => ({ ...f, nameEn: e.target.value, slug: f.slugEdited ? f.slug : slugify(e.target.value) }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{nameLabel} (AR) <span className="text-destructive">*</span></Label>
              <Input dir="rtl" value={form.nameAr} onChange={(e) => setForm((f) => ({ ...f, nameAr: e.target.value }))} />
            </div>
            {kind === "subcategory" && (
              <>
                <div className="space-y-1.5">
                  <Label>{t("catSlug")} <span className="text-destructive">*</span></Label>
                  <Input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value, slugEdited: true }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>{t("csColParent")} <span className="text-destructive">*</span></Label>
                  <Select value={form.parentId} onValueChange={(v) => setForm((f) => ({ ...f, parentId: v }))}>
                    <SelectTrigger><SelectValue placeholder={t("csColParent")} /></SelectTrigger>
                    <SelectContent>
                      {parentCategories.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeForm} disabled={saving}>{t("catReset")}</Button>
            <Button onClick={editRow ? updateRow : createRow} disabled={saving} className="gap-1.5">
              {saving && <Loader2 className="size-4 animate-spin" />}
              {editRow ? t("csSaveChanges") : t("create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
