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

type Row = TaxonomyRow & Partial<Pick<CourseSubcategory, "parentName">>;
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

  // Inline add dialog (sub-categories + tags; categories use the dedicated page).
  const [addOpen, setAddOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState({ nameEn: "", nameAr: "", slug: "", parentId: "", slugEdited: false });

  const resetForm = () => setForm({ nameEn: "", nameAr: "", slug: "", parentId: "", slugEdited: false });

  const onAddClick = () => {
    if (addHref) { router.push(addHref); return; }
    resetForm();
    setAddOpen(true);
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
      setAddOpen(false);
      resetForm();
    } else if (error) {
      toast.error(error);
    }
  };

  const filtered = rows.filter((r) => r.nameEn.toLowerCase().includes(search.toLowerCase()) || r.nameAr.includes(search));
  const pageRows = filtered.slice(page * pageSize, page * pageSize + pageSize);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));

  const toggle = (id: string) => {
    setRows((p) => p.map((r) => (r.id === id ? { ...r, active: !r.active } : r)));
    toast.success(t("csStatusToggled"));
  };
  const duplicate = (r: Row) => {
    setRows((p) => [{ ...r, id: `${r.id}_copy`, nameEn: `${r.nameEn} (copy)` }, ...p]);
    toast.success(t("csDuplicated", { name: r.nameEn }));
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

  const onDrop = (targetId: string) => {
    if (dragIndex === null) return;
    const dragged = filtered[dragIndex];
    const targetIdx = rows.findIndex((r) => r.id === targetId);
    const fromIdx = rows.findIndex((r) => r.id === dragged.id);
    if (fromIdx === -1 || targetIdx === -1 || fromIdx === targetIdx) return;
    const next = [...rows];
    next.splice(targetIdx, 0, next.splice(fromIdx, 1)[0]);
    setRows(next.map((r, i) => ({ ...r, rank: i })));
    setDragIndex(null);
    toast.success(t("csReordered"));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="inline-flex items-center gap-2 font-heading text-xl font-bold tracking-tight">
          {allLabel}<span className="grid size-6 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground tabular-nums">{rows.length}</span>
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-1.5"><Download className="size-4" />{t("csDownload")}</Button>
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
                    <Button variant="ghost" size="icon" className="size-8 text-primary" onClick={() => toast.info(t("csEdit"))}><Pencil className="size-4" /></Button>
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

      <Dialog open={addOpen} onOpenChange={(o) => { setAddOpen(o); if (!o) resetForm(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("csAddNew")}</DialogTitle>
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
            <Button variant="outline" onClick={() => setAddOpen(false)} disabled={saving}>{t("catReset")}</Button>
            <Button onClick={createRow} disabled={saving} className="gap-1.5">
              {saving && <Loader2 className="size-4 animate-spin" />}
              {t("create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
