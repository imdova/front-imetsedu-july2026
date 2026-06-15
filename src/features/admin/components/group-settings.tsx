"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { GripVertical, Search, Download, Plus, Pencil, Trash2, Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { dal } from "@/lib/dal";
import type { GroupCategoryRow, GroupSubcategoryRow } from "@/lib/dal/groups";
import { cn, getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

type Tab = "categories" | "subcategories";

export function GroupSettings({
  categories,
  subcategories,
}: {
  categories: GroupCategoryRow[];
  subcategories: GroupSubcategoryRow[];
}) {
  const t = useTranslations("Admin");
  const [tab, setTab] = React.useState<Tab>("categories");

  return (
    <div className="space-y-5">
      <div className="flex justify-end gap-2">
        {(["categories", "subcategories"] as Tab[]).map((k) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              tab === k ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50",
            )}
          >
            {t(k === "categories" ? "gsCategories" : "gsSubCategories")}
          </button>
        ))}
      </div>

      {tab === "categories" ? (
        <TaxoTab kind="category" initial={categories} />
      ) : (
        <TaxoTab kind="subcategory" initial={subcategories} parents={categories} />
      )}
    </div>
  );
}

function TaxoTab({
  kind,
  initial,
  parents = [],
}: {
  kind: "category" | "subcategory";
  initial: (GroupCategoryRow | GroupSubcategoryRow)[];
  parents?: GroupCategoryRow[];
}) {
  const t = useTranslations("Admin");
  const [rows, setRows] = React.useState(initial);
  const [name, setName] = React.useState("");
  const [parentId, setParentId] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [adding, setAdding] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [editName, setEditName] = React.useState("");

  const isSub = kind === "subcategory";
  const filtered = rows.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()));

  const add = async () => {
    if (!name.trim()) { toast.error(t("gsNameRequired")); return; }
    if (isSub && !parentId) { toast.error(t("gsParentRequired")); return; }
    setAdding(true);
    const res = isSub
      ? await dal.groups.createGroupSubcategory(name.trim(), parentId, parents.find((p) => p.id === parentId)?.name)
      : await dal.groups.createGroupCategory(name.trim());
    setAdding(false);
    if (res.ok) {
      setRows((p) => [res.data, ...p]);
      setName(""); setParentId("");
      toast.success(t("gsCreated", { name: res.data.name }));
    } else {
      toast.error(res.error);
    }
  };

  const remove = async (r: GroupCategoryRow) => {
    const prev = rows;
    setRows((p) => p.filter((x) => x.id !== r.id));
    const res = isSub ? await dal.groups.deleteGroupSubcategory(r.id) : await dal.groups.deleteGroupCategory(r.id);
    if (res.ok) toast.success(t("gsDeleted", { name: r.name }));
    else { setRows(prev); toast.error(res.error); }
  };

  const saveEdit = async (r: GroupCategoryRow) => {
    const next = editName.trim();
    setEditId(null);
    if (!next || next === r.name) return;
    const res = isSub ? await dal.groups.renameGroupSubcategory(r.id, next) : await dal.groups.renameGroupCategory(r.id, next);
    if (res.ok) {
      setRows((p) => p.map((x) => (x.id === r.id ? { ...x, name: res.data.name } : x)));
      toast.success(t("gsUpdated"));
    } else {
      toast.error(res.error);
    }
  };

  const onDownload = async () => {
    const res = isSub ? await dal.groups.downloadGroupSubcategories() : await dal.groups.downloadGroupCategories();
    if (!res.ok) toast.error(res.error);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="inline-flex items-center gap-2 font-heading text-xl font-bold tracking-tight">
          {t(isSub ? "gsAllSubCategories" : "gsAllCategories")}
          <span className="grid size-6 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground tabular-nums">{rows.length}</span>
        </h2>
        <Button variant="outline" className="gap-1.5" onClick={onDownload}>
          <Download className="size-4" />{t("csDownload")}
        </Button>
      </div>

      {/* Inline add */}
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[220px] flex-1 space-y-1.5">
            <Label>{isSub ? t("gsSubName") : t("gsCategoryName")}</Label>
            <Input
              value={name}
              placeholder={t("gsNamePlaceholder")}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
            />
          </div>
          {isSub && (
            <div className="min-w-[200px] space-y-1.5">
              <Label>{t("gsParent")}</Label>
              <Select value={parentId} onValueChange={setParentId}>
                <SelectTrigger><SelectValue placeholder={t("gsParent")} /></SelectTrigger>
                <SelectContent>
                  {parents.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          <Button className="gap-1.5" onClick={add} disabled={adding}>
            {adding ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            {t("gsAdd")}
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("gsSearchByName")} className="ps-9" />
        </div>
        <Button className="gap-1.5"><Search className="size-4" />{t("csSearch")}</Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30 text-xs uppercase tracking-wide text-muted-foreground">
              <th className="w-8 px-2 py-3" />
              <th className="px-3 py-3 text-start font-semibold">{t("csColImage")}</th>
              <th className="px-3 py-3 text-start font-semibold">{isSub ? t("gsSubName") : t("gsCategoryName")}</th>
              {isSub && <th className="px-3 py-3 text-start font-semibold">{t("csColParent")}</th>}
              <th className="px-3 py-3 text-start font-semibold">{t("csColCreatedAt")}</th>
              <th className="px-3 py-3 text-center font-semibold">{t("gsGroups")}</th>
              <th className="px-3 py-3 text-end font-semibold">{t("csColActions")}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={isSub ? 7 : 6} className="px-3 py-12 text-center text-muted-foreground">{t("gsEmpty")}</td></tr>
            ) : filtered.map((r) => (
              <tr key={r.id} className="border-b last:border-0 hover:bg-muted/20">
                <td className="px-2 py-3"><GripVertical className="size-4 text-muted-foreground/60" /></td>
                <td className="px-3 py-3">
                  <span className="grid size-9 place-items-center rounded-full bg-primary/10 text-xs font-semibold uppercase text-primary">{getInitials(r.name)}</span>
                </td>
                <td className="px-3 py-3">
                  {editId === r.id ? (
                    <Input
                      autoFocus
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onBlur={() => saveEdit(r)}
                      onKeyDown={(e) => { if (e.key === "Enter") saveEdit(r); if (e.key === "Escape") setEditId(null); }}
                      className="h-8 max-w-[240px]"
                    />
                  ) : (
                    <span className="font-medium">{r.name}</span>
                  )}
                </td>
                {isSub && <td className="px-3 py-3 text-muted-foreground">{(r as GroupSubcategoryRow).parentName}</td>}
                <td className="px-3 py-3 tabular-nums text-muted-foreground">{r.createdAt}</td>
                <td className="px-3 py-3 text-center tabular-nums">{r.groups}</td>
                <td className="px-3 py-3">
                  <div className="flex items-center justify-end gap-1">
                    {editId === r.id ? (
                      <>
                        <Button variant="ghost" size="icon" className="size-8 text-success" onClick={() => saveEdit(r)}><Check className="size-4" /></Button>
                        <Button variant="ghost" size="icon" className="size-8" onClick={() => setEditId(null)}><X className="size-4" /></Button>
                      </>
                    ) : (
                      <>
                        <Button variant="ghost" size="icon" className="size-8 text-primary" onClick={() => { setEditId(r.id); setEditName(r.name); }}><Pencil className="size-4" /></Button>
                        <Button variant="ghost" size="icon" className="size-8 text-destructive" onClick={() => remove(r)}><Trash2 className="size-4" /></Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
