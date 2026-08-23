"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Copy, ExternalLink, Link2, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Link, useRouter } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import type { GraduateCategory, GraduateCohort } from "@/lib/dal/graduates";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ALL, UNCATEGORISED, GraduateCategoriesPanel } from "./graduate-categories-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DataTable } from "@/components/shared/data-table/data-table";
import { useConfirm } from "@/hooks/use-confirm";

/** Cohorts list — add / edit / duplicate / delete; name opens the cohort editor. */
const NONE = "__none__";

export function GraduateCohorts({ initial, initialCategories }: { initial: GraduateCohort[]; initialCategories: GraduateCategory[] }) {
  const router = useRouter();
  const { confirm, Confirmation } = useConfirm();
  const [rows, setRows] = React.useState(initial);
  const [categories, setCategories] = React.useState(initialCategories);
  const [selectedCat, setSelectedCat] = React.useState<string>(ALL);
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [programTitle, setProgramTitle] = React.useState("");
  const [newCat, setNewCat] = React.useState<string>(NONE);
  const [creating, setCreating] = React.useState(false);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const refresh = async () => { const r = await dal.graduates.fetchCohorts(); if (r.ok) setRows(r.data); };

  const catName = (id: string) => categories.find((c) => c.id === id)?.name ?? "";
  const counts = React.useMemo(() => {
    const byId: Record<string, number> = {};
    let none = 0;
    for (const r of rows) { if (r.categoryId) byId[r.categoryId] = (byId[r.categoryId] ?? 0) + 1; else none++; }
    return { all: rows.length, none, byId };
  }, [rows]);
  const visible = selectedCat === ALL ? rows : selectedCat === UNCATEGORISED ? rows.filter((r) => !r.categoryId) : rows.filter((r) => r.categoryId === selectedCat);

  const openCreate = () => {
    setNewCat(selectedCat !== ALL && selectedCat !== UNCATEGORISED ? selectedCat : NONE);
    setOpen(true);
  };

  const create = async () => {
    if (!name.trim()) return;
    setCreating(true);
    const r = await dal.graduates.createCohort({ name: name.trim(), programTitle: programTitle.trim(), categoryId: newCat === NONE ? "" : newCat });
    setCreating(false);
    if (!r.ok) { toast.error(r.error); return; }
    toast.success("Cohort created — add graduates next");
    setOpen(false); setName(""); setProgramTitle("");
    router.push(`/admin/graduates/${r.data.id}`);
  };

  /** Move a cohort to another category straight from the table. */
  const assignCategory = async (c: GraduateCohort, categoryId: string) => {
    const prev = c.categoryId;
    setRows((p) => p.map((x) => (x.id === c.id ? { ...x, categoryId } : x)));
    const r = await dal.graduates.updateCohort(c.id, { categoryId });
    if (!r.ok) { setRows((p) => p.map((x) => (x.id === c.id ? { ...x, categoryId: prev } : x))); toast.error(r.error); return; }
    toast.success(categoryId ? `Moved to “${catName(categoryId)}”` : "Category cleared");
  };

  const duplicate = async (c: GraduateCohort) => {
    setBusyId(c.id);
    const r = await dal.graduates.duplicateCohort(c.id);
    setBusyId(null);
    if (!r.ok) { toast.error(r.error); return; }
    toast.success(`Duplicated as “${r.data.name}” (draft)`);
    void refresh();
  };

  /** Open/close the public join form for a cohort (optimistic). */
  const toggleForm = async (c: GraduateCohort, formEnabled: boolean) => {
    setRows((p) => p.map((x) => (x.id === c.id ? { ...x, formEnabled } : x)));
    const r = await dal.graduates.updateCohort(c.id, { formEnabled });
    if (!r.ok) {
      setRows((p) => p.map((x) => (x.id === c.id ? { ...x, formEnabled: !formEnabled } : x)));
      toast.error(r.error); return;
    }
    toast.success(formEnabled ? "Form opened — students can submit" : "Form closed — submissions are blocked");
  };

  const remove = async (c: GraduateCohort) => {
    const ok = await confirm({
      title: "Delete cohort",
      description: `“${c.name}” and its ${c.graduatesCount} graduate${c.graduatesCount === 1 ? "" : "s"} will be removed. The public page /graduates/${c.slug} will stop working.`,
      confirmText: "Delete", variant: "destructive",
    });
    if (!ok) return;
    const r = await dal.graduates.deleteCohort(c.id);
    if (!r.ok) { toast.error(r.error); return; }
    setRows((p) => p.filter((x) => x.id !== c.id));
    toast.success("Cohort deleted");
  };

  const columns: ColumnDef<GraduateCohort>[] = [
    {
      accessorKey: "name", header: "Cohort",
      cell: ({ row }) => (
        <div className="min-w-0">
          <Link href={`/admin/graduates/${row.original.id}`} className="block truncate text-sm font-medium hover:text-primary hover:underline">{row.original.name}</Link>
          <p className="truncate text-xs text-muted-foreground">{[row.original.programTitle, row.original.programTitleAccent].filter(Boolean).join(" ") || "—"}{row.original.country ? ` · ${row.original.country}` : ""}</p>
        </div>
      ),
    },
    {
      id: "category", header: "Category",
      cell: ({ row }) => (
        <Select value={row.original.categoryId || NONE} onValueChange={(v) => assignCategory(row.original, v === NONE ? "" : v)}>
          <SelectTrigger className="h-8 w-[160px] text-xs"><SelectValue placeholder="Uncategorised" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE}><span className="text-muted-foreground">Uncategorised</span></SelectItem>
            {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      ),
    },
    { accessorKey: "slug", header: "Slug", cell: ({ row }) => <span className="font-mono text-xs">/graduates/{row.original.slug}</span> },
    {
      id: "formLink", header: "Form link",
      cell: ({ row }) => {
        const url = `${typeof window !== "undefined" ? window.location.origin : "https://imetsedu.com"}/graduates/${row.original.slug}/join`;
        const on = row.original.formEnabled;
        return (
          <div className="flex items-center gap-1">
            <Switch
              checked={on}
              onCheckedChange={(v) => toggleForm(row.original, v)}
              aria-label={on ? "Form open — click to close" : "Form closed — click to open"}
              title={on ? "Form is open — students can submit" : "Form is closed — no one can submit"}
            />
            <button
              type="button"
              title={on ? "Copy the student join-form link" : "Form is closed"}
              onClick={() => { navigator.clipboard?.writeText(url); toast.success("Form link copied"); }}
              className={`inline-flex max-w-[200px] items-center gap-1.5 rounded-md border border-border/70 bg-muted/30 px-2 py-1 font-mono text-[11px] hover:bg-muted ${on ? "" : "opacity-50 line-through"}`}
            >
              <Link2 className={`size-3.5 shrink-0 ${on ? "text-primary" : "text-muted-foreground"}`} /><span className="truncate">/graduates/{row.original.slug}/join</span>
            </button>
            <a href={url} target="_blank" rel="noreferrer" title="Open form"><Button variant="ghost" size="sm"><ExternalLink className="size-3.5" /></Button></a>
          </div>
        );
      },
    },
    { accessorKey: "graduatesCount", header: "Graduates", cell: ({ row }) => <span className="tabular-nums">{row.original.graduatesCount}</span> },
    {
      accessorKey: "status", header: "Status",
      cell: ({ row }) => row.original.status === "published"
        ? <Badge className="bg-success/12 text-success hover:bg-success/15">Published</Badge>
        : <Badge variant="secondary">Draft</Badge>,
    },
    { accessorKey: "views", header: "Views", cell: ({ row }) => <span className="tabular-nums text-muted-foreground">{row.original.views.toLocaleString()}</span> },
    {
      id: "actions", header: "",
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <a href={`/graduates/${row.original.slug}`} target="_blank" rel="noreferrer" title={row.original.status === "published" ? "View public page" : "Publish first to view"}>
            <Button variant="ghost" size="sm" disabled={row.original.status !== "published"}><ExternalLink className="size-4" /></Button>
          </a>
          <Link href={`/admin/graduates/${row.original.id}`} title="Edit"><Button variant="ghost" size="sm"><Pencil className="size-4" /></Button></Link>
          <Button variant="ghost" size="sm" title="Duplicate" onClick={() => duplicate(row.original)} disabled={busyId === row.original.id}>
            {busyId === row.original.id ? <Loader2 className="size-4 animate-spin" /> : <Copy className="size-4" />}
          </Button>
          <Button variant="ghost" size="sm" title="Delete" onClick={() => remove(row.original)}><Trash2 className="size-4 text-destructive" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
      <GraduateCategoriesPanel categories={categories} onChange={setCategories} selected={selectedCat} onSelect={setSelectedCat} counts={counts} />

      <div className="min-w-0 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {visible.length} cohort{visible.length === 1 ? "" : "s"}
            {selectedCat === UNCATEGORISED ? " without a category" : selectedCat !== ALL ? ` in “${catName(selectedCat)}”` : ""} — click a name to manage its graduates and page copy.
          </p>
          <Button className="gap-1.5" onClick={openCreate}><Plus className="size-4" /> New cohort</Button>
        </div>
        <DataTable columns={columns} data={visible} pageSize={10} />
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New cohort</DialogTitle>
            <DialogDescription>You&apos;ll add graduates, photos and page copy on the next screen.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Cohort name <span className="text-destructive">*</span></Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Quality Diploma - Cohort 43" autoFocus onKeyDown={(e) => e.key === "Enter" && create()} />
            </div>
            <div className="space-y-1.5">
              <Label>Program title <span className="font-normal text-muted-foreground">(hero headline)</span></Label>
              <Input value={programTitle} onChange={(e) => setProgramTitle(e.target.value)} placeholder="e.g. Healthcare Quality" />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={newCat} onValueChange={setNewCat}>
                <SelectTrigger><SelectValue placeholder="Uncategorised" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}><span className="text-muted-foreground">Uncategorised</span></SelectItem>
                  {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={create} disabled={creating || !name.trim()} className="gap-1.5">{creating && <Loader2 className="size-4 animate-spin" />} Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {Confirmation}
    </div>
  );
}
