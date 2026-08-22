"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Copy, ExternalLink, Link2, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Link, useRouter } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import type { GraduateCohort } from "@/lib/dal/graduates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DataTable } from "@/components/shared/data-table/data-table";
import { useConfirm } from "@/hooks/use-confirm";

/** Cohorts list — add / edit / duplicate / delete; name opens the cohort editor. */
export function GraduateCohorts({ initial }: { initial: GraduateCohort[] }) {
  const router = useRouter();
  const { confirm, Confirmation } = useConfirm();
  const [rows, setRows] = React.useState(initial);
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [programTitle, setProgramTitle] = React.useState("");
  const [creating, setCreating] = React.useState(false);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const refresh = async () => { const r = await dal.graduates.fetchCohorts(); if (r.ok) setRows(r.data); };

  const create = async () => {
    if (!name.trim()) return;
    setCreating(true);
    const r = await dal.graduates.createCohort({ name: name.trim(), programTitle: programTitle.trim() });
    setCreating(false);
    if (!r.ok) { toast.error(r.error); return; }
    toast.success("Cohort created — add graduates next");
    setOpen(false); setName(""); setProgramTitle("");
    router.push(`/admin/graduates/${r.data.id}`);
  };

  const duplicate = async (c: GraduateCohort) => {
    setBusyId(c.id);
    const r = await dal.graduates.duplicateCohort(c.id);
    setBusyId(null);
    if (!r.ok) { toast.error(r.error); return; }
    toast.success(`Duplicated as “${r.data.name}” (draft)`);
    void refresh();
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
    { accessorKey: "slug", header: "Slug", cell: ({ row }) => <span className="font-mono text-xs">/graduates/{row.original.slug}</span> },
    {
      id: "formLink", header: "Form link",
      cell: ({ row }) => {
        const url = `${typeof window !== "undefined" ? window.location.origin : "https://imetsedu.com"}/graduates/${row.original.slug}/join`;
        return (
          <div className="flex items-center gap-1">
            <button
              type="button"
              title="Copy the student join-form link"
              onClick={() => { navigator.clipboard?.writeText(url); toast.success("Form link copied"); }}
              className="inline-flex max-w-[200px] items-center gap-1.5 rounded-md border border-border/70 bg-muted/30 px-2 py-1 font-mono text-[11px] hover:bg-muted"
            >
              <Link2 className="size-3.5 shrink-0 text-primary" /><span className="truncate">/graduates/{row.original.slug}/join</span>
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
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{rows.length} cohort{rows.length === 1 ? "" : "s"} — click a name to manage its graduates and page copy.</p>
        <Button className="gap-1.5" onClick={() => setOpen(true)}><Plus className="size-4" /> New cohort</Button>
      </div>
      <DataTable columns={columns} data={rows} pageSize={10} />

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
