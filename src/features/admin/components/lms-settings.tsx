"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft, Download, Plus, Search, Pencil, Trash2, GripVertical } from "lucide-react";
import { toast } from "sonner";

import { Link } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import type { LmsCategory, LmsSubcategory } from "@/lib/db/lms";
import { cn, getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Tab = "categories" | "sub";

export function LmsSettings({
  categories: initialCats, subcategories: initialSubs,
}: {
  categories: LmsCategory[];
  subcategories: LmsSubcategory[];
}) {
  const t = useTranslations("Admin");
  const [tab, setTab] = React.useState<Tab>("categories");
  const [cats, setCats] = React.useState(initialCats);
  const [subs, setSubs] = React.useState(initialSubs);
  const [search, setSearch] = React.useState("");

  // add-form state
  const [catName, setCatName] = React.useState("");
  const [subName, setSubName] = React.useState("");
  const [parentId, setParentId] = React.useState(initialCats[0]?.id ?? "");
  const [saving, setSaving] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [editName, setEditName] = React.useState("");

  const addCat = async () => {
    if (!catName.trim()) return;
    setSaving(true);
    const res = await dal.lms.createLmsCategory(catName.trim());
    setSaving(false);
    if (res.ok) { setCats((p) => [res.data, ...p]); setCatName(""); toast.success(t("lmsCatAdded")); }
    else toast.error(res.error);
  };
  const addSub = async () => {
    if (!subName.trim()) return;
    if (!parentId) { toast.error(t("csParentRequired")); return; }
    const parent = cats.find((c) => c.id === parentId);
    setSaving(true);
    const res = await dal.lms.createLmsSubcategory(subName.trim(), parentId, parent?.name);
    setSaving(false);
    if (res.ok) { setSubs((p) => [res.data, ...p]); setSubName(""); toast.success(t("lmsSubAdded")); }
    else toast.error(res.error);
  };

  const removeRow = async (id: string) => {
    if (isCats) {
      const prev = cats;
      setCats((p) => p.filter((x) => x.id !== id));
      const res = await dal.lms.deleteLmsCategory(id);
      if (res.ok) toast.success(t("csDeleted", { name: prev.find((x) => x.id === id)?.name ?? "" }));
      else { setCats(prev); toast.error(res.error); }
    } else {
      const prev = subs;
      setSubs((p) => p.filter((x) => x.id !== id));
      const res = await dal.lms.deleteLmsSubcategory(id);
      if (res.ok) toast.success(t("csDeleted", { name: prev.find((x) => x.id === id)?.name ?? "" }));
      else { setSubs(prev); toast.error(res.error); }
    }
  };

  const saveEdit = async (id: string, original: string) => {
    const next = editName.trim();
    setEditId(null);
    if (!next || next === original) return;
    const res = isCats
      ? await dal.lms.renameLmsCategory(id, next)
      : await dal.lms.renameLmsSubcategory(id, next);
    if (res.ok) {
      if (isCats) setCats((p) => p.map((x) => (x.id === id ? { ...x, name: next } : x)));
      else setSubs((p) => p.map((x) => (x.id === id ? { ...x, name: next } : x)));
      toast.success(t("lmsUpdated"));
    } else {
      toast.error(res.error);
    }
  };

  const isCats = tab === "categories";
  const rows = isCats
    ? cats.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    : subs.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <Link href="/admin/lms" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4 rtl:rotate-180" />{t("lmsBackToCourses")}
          </Link>
          <h1 className="font-heading text-2xl font-bold tracking-tight">{t("lmsSetTitle")}</h1>
        </div>
        <div className="inline-flex rounded-lg border p-0.5">
          {([["categories", t("lmsSetTabCategories")], ["sub", t("lmsSetTabSub")]] as const).map(([k, label]) => (
            <button key={k} onClick={() => { setTab(k); setSearch(""); }}
              className={cn("rounded-md px-4 py-1.5 text-sm font-medium transition-colors", tab === k ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground")}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="inline-flex items-center gap-2 font-heading text-xl font-bold tracking-tight">
            {isCats ? t("csAllCategories") : t("csAllSubCategories")}
            <span className="grid size-6 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground tabular-nums">{rows.length}</span>
          </h2>
          <Button variant="outline" className="gap-1.5"><Download className="size-4" />{t("csDownload")}</Button>
        </div>

        {/* Inline add form */}
        <div className="flex flex-wrap items-end gap-3 rounded-xl border bg-card p-4">
          {isCats ? (
            <div className="min-w-[260px] flex-1 space-y-1.5"><Label>{t("lmsCatNameLabel")}</Label><Input value={catName} onChange={(e) => setCatName(e.target.value)} placeholder={t("lmsCatNamePh")} onKeyDown={(e) => e.key === "Enter" && addCat()} /></div>
          ) : (
            <>
              <div className="min-w-[240px] flex-1 space-y-1.5"><Label>{t("lmsSubNameLabel")}</Label><Input value={subName} onChange={(e) => setSubName(e.target.value)} placeholder={t("lmsSubNamePh")} onKeyDown={(e) => e.key === "Enter" && addSub()} /></div>
              <div className="w-52 space-y-1.5"><Label>{t("lmsParentCat")}</Label>
                <Select value={parentId} onValueChange={setParentId}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{cats.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select>
              </div>
            </>
          )}
          <Button className="gap-1.5" onClick={isCats ? addCat : addSub}><Plus className="size-4" />{t("lmsAddBtn")}</Button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("csSearchName")} className="ps-9" />
          </div>
          <Button className="gap-1.5"><Search className="size-4" />{t("csSearch")}</Button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-xs uppercase tracking-wide text-muted-foreground">
                <th className="w-8 px-2 py-3" />
                <th className="px-3 py-3 text-start font-semibold">{t("csColImage")}</th>
                <th className="px-3 py-3 text-start font-semibold">{isCats ? t("csColCategoryName") : t("csColSubName")}</th>
                {!isCats && <th className="px-3 py-3 text-start font-semibold">{t("csColParent")}</th>}
                <th className="px-3 py-3 text-start font-semibold">{t("csColCreatedAt")}</th>
                <th className="px-3 py-3 text-center font-semibold">{t("csColCourses")}</th>
                <th className="px-3 py-3 text-end font-semibold">{t("csColActions")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="px-2 py-4"><GripVertical className="size-4 cursor-grab text-muted-foreground" /></td>
                  <td className="px-3 py-4"><span className="grid size-9 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{getInitials(r.name)}</span></td>
                  <td className="px-3 py-4 font-medium">
                    {editId === r.id ? (
                      <Input
                        autoFocus
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onBlur={() => saveEdit(r.id, r.name)}
                        onKeyDown={(e) => { if (e.key === "Enter") saveEdit(r.id, r.name); if (e.key === "Escape") setEditId(null); }}
                        className="h-8 max-w-[220px]"
                      />
                    ) : (
                      r.name
                    )}
                  </td>
                  {!isCats && <td className="px-3 py-4 text-muted-foreground">{(r as LmsSubcategory).parentName}</td>}
                  <td className="px-3 py-4 text-muted-foreground tabular-nums">{r.createdAt}</td>
                  <td className="px-3 py-4 text-center tabular-nums">{r.courses}</td>
                  <td className="px-3 py-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button variant="outline" size="icon" className="size-8 text-primary" onClick={() => { setEditId(r.id); setEditName(r.name); }}><Pencil className="size-4" /></Button>
                      <Button variant="outline" size="icon" className="size-8 text-destructive" onClick={() => removeRow(r.id)}><Trash2 className="size-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
