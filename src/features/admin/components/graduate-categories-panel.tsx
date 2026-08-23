"use client";

import * as React from "react";
import { Check, FolderOpen, Layers, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { dal } from "@/lib/dal";
import type { GraduateCategory } from "@/lib/dal/graduates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useConfirm } from "@/hooks/use-confirm";
import { cn } from "@/lib/utils";

export const ALL = "__all__";
export const UNCATEGORISED = "__none__";

interface Props {
  categories: GraduateCategory[];
  onChange: (next: GraduateCategory[]) => void;
  selected: string;
  onSelect: (id: string) => void;
  /** Live counts computed from the cohort rows (so they stay in sync after edits). */
  counts: { all: number; none: number; byId: Record<string, number> };
}

/** Left column of /admin/graduates: browse, add, rename and delete cohort categories. */
export function GraduateCategoriesPanel({ categories, onChange, selected, onSelect, counts }: Props) {
  const { confirm, Confirmation } = useConfirm();
  const [adding, setAdding] = React.useState(false);
  const [newName, setNewName] = React.useState("");
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editName, setEditName] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  const add = async () => {
    const name = newName.trim();
    if (!name) return;
    setBusy(true);
    const r = await dal.graduates.createCategory(name);
    setBusy(false);
    if (!r.ok) { toast.error(r.error); return; }
    onChange([...categories, r.data]);
    setNewName(""); setAdding(false);
    onSelect(r.data.id);
    toast.success(`Category “${name}” added`);
  };

  const startRename = (c: GraduateCategory) => { setEditingId(c.id); setEditName(c.name); };
  const rename = async () => {
    const id = editingId; const name = editName.trim();
    if (!id) return;
    if (!name) { setEditingId(null); return; }
    setBusy(true);
    const r = await dal.graduates.renameCategory(id, name);
    setBusy(false);
    if (!r.ok) { toast.error(r.error); return; }
    onChange(categories.map((c) => (c.id === id ? { ...c, name } : c)));
    setEditingId(null);
    toast.success("Category renamed");
  };

  const remove = async (c: GraduateCategory) => {
    const n = counts.byId[c.id] ?? 0;
    const ok = await confirm({
      title: "Delete category",
      description: n ? `“${c.name}” will be deleted. Its ${n} cohort${n === 1 ? "" : "s"} will stay and become uncategorised.` : `“${c.name}” will be deleted.`,
      confirmText: "Delete", variant: "destructive",
    });
    if (!ok) return;
    const r = await dal.graduates.deleteCategory(c.id);
    if (!r.ok) { toast.error(r.error); return; }
    onChange(categories.filter((x) => x.id !== c.id));
    if (selected === c.id) onSelect(ALL);
    toast.success("Category deleted");
  };

  const renderRow = ({ id, label, count, icon, cat }: { id: string; label: string; count: number; icon: React.ReactNode; cat?: GraduateCategory }) => {
    const active = selected === id;
    const editing = cat && editingId === cat.id;
    return (
      <div className={cn("group flex items-center gap-1 rounded-lg pe-1 transition", active ? "bg-primary/10 text-primary" : "hover:bg-muted/60")}>
        {editing ? (
          <div className="flex flex-1 items-center gap-1 p-1">
            <Input value={editName} onChange={(e) => setEditName(e.target.value)} autoFocus className="h-8 text-sm"
              onKeyDown={(e) => { if (e.key === "Enter") rename(); if (e.key === "Escape") setEditingId(null); }} />
            <Button size="icon" variant="ghost" className="size-7 shrink-0" onClick={rename} disabled={busy} title="Save">{busy ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}</Button>
            <Button size="icon" variant="ghost" className="size-7 shrink-0" onClick={() => setEditingId(null)} title="Cancel"><X className="size-3.5" /></Button>
          </div>
        ) : (
          <>
            <button type="button" onClick={() => onSelect(id)} className="flex min-w-0 flex-1 items-center gap-2 px-2.5 py-2 text-start text-sm">
              <span className={cn("shrink-0", active ? "text-primary" : "text-muted-foreground")}>{icon}</span>
              <span className={cn("truncate", active && "font-medium")}>{label}</span>
              <span className={cn("ms-auto shrink-0 rounded-full px-1.5 text-[11px] tabular-nums", active ? "bg-primary/15" : "bg-muted text-muted-foreground")}>{count}</span>
            </button>
            {cat && (
              <div className="flex shrink-0 items-center opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
                <Button size="icon" variant="ghost" className="size-7" title="Rename" onClick={() => startRename(cat)}><Pencil className="size-3.5" /></Button>
                <Button size="icon" variant="ghost" className="size-7" title="Delete" onClick={() => remove(cat)}><Trash2 className="size-3.5 text-destructive" /></Button>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <aside className="rounded-2xl border border-border/70 bg-card p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between px-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Categories</p>
        <Button size="icon" variant="ghost" className="size-7" title="New category" onClick={() => { setAdding(true); setNewName(""); }}><Plus className="size-4" /></Button>
      </div>

      <div className="space-y-0.5">
        {renderRow({ id: ALL, label: "All cohorts", count: counts.all, icon: <Layers className="size-4" /> })}
        {categories.map((c) => <React.Fragment key={c.id}>{renderRow({ id: c.id, label: c.name, count: counts.byId[c.id] ?? 0, icon: <FolderOpen className="size-4" />, cat: c })}</React.Fragment>)}
        {counts.none > 0 && renderRow({ id: UNCATEGORISED, label: "Uncategorised", count: counts.none, icon: <FolderOpen className="size-4 opacity-60" /> })}
      </div>

      {adding ? (
        <div className="mt-2 flex items-center gap-1 border-t border-border/60 pt-2">
          <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Category name" autoFocus className="h-8 text-sm"
            onKeyDown={(e) => { if (e.key === "Enter") add(); if (e.key === "Escape") setAdding(false); }} />
          <Button size="icon" variant="ghost" className="size-7 shrink-0" onClick={add} disabled={busy || !newName.trim()} title="Add">{busy ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}</Button>
          <Button size="icon" variant="ghost" className="size-7 shrink-0" onClick={() => setAdding(false)} title="Cancel"><X className="size-3.5" /></Button>
        </div>
      ) : (
        <button type="button" onClick={() => setAdding(true)} className="mt-2 flex w-full items-center gap-2 rounded-lg border border-dashed border-border/70 px-2.5 py-2 text-sm text-muted-foreground transition hover:border-primary/50 hover:text-primary">
          <Plus className="size-4" /> New category
        </button>
      )}
      {categories.length === 0 && !adding && (
        <p className="mt-3 px-1 text-[11px] leading-relaxed text-muted-foreground">Group cohorts by program — e.g. “Quality Diploma”, “CPHQ”. Assign a category when creating a cohort or from its editor.</p>
      )}
      {Confirmation}
    </aside>
  );
}
