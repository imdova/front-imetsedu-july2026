"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { dal } from "@/lib/dal";
import type { SeoPage, SeoPageInput } from "@/lib/db/seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/shared/data-table/data-table";
import { useConfirm } from "@/hooks/use-confirm";

const empty: SeoPageInput = {
  path: "", title: "", description: "", titleAr: "", descriptionAr: "",
  ogImage: "", focusKeyword: "", canonical: "", noindex: false,
};

export function SeoPagesPanel({ initial }: { initial: SeoPage[] }) {
  const { confirm, Confirmation } = useConfirm();
  const [rows, setRows] = React.useState(initial);
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<SeoPage | null>(null);
  const [form, setForm] = React.useState<SeoPageInput>(empty);

  const openCreate = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (p: SeoPage) => { setEditing(p); const { id: _i, ...rest } = p; setForm(rest); setOpen(true); };

  const save = async () => {
    if (!form.path.trim()) return;
    const res = editing ? await dal.seo.updatePage(editing.id, form) : await dal.seo.createPage(form);
    if (res.ok && res.data) {
      setRows((p) => (editing ? p.map((x) => (x.id === res.data!.id ? res.data! : x)) : [...p, res.data!]));
      toast.success(editing ? "Override updated" : "Override created"); setOpen(false);
    } else toast.error(res.ok ? "Not found" : res.error);
  };
  const remove = async (p: SeoPage) => {
    const okConfirm = await confirm({ title: "Delete override", description: `Override for ${p.path} will be removed.`, confirmText: "Delete", variant: "destructive" });
    if (!okConfirm) return;
    const res = await dal.seo.deletePage(p.id);
    if (res.ok) { setRows((r) => r.filter((x) => x.id !== p.id)); toast.success("Override deleted"); }
    else toast.error(res.error);
  };

  const columns: ColumnDef<SeoPage>[] = [
    { accessorKey: "path", header: "Path", cell: ({ row }) => <span className="font-mono text-xs">{row.original.path}</span> },
    { accessorKey: "title", header: "Title", cell: ({ row }) => <span className="line-clamp-1 max-w-xs text-sm">{row.original.title || "—"}</span> },
    { accessorKey: "focusKeyword", header: "Focus keyword", cell: ({ row }) => row.original.focusKeyword ? <Badge variant="outline">{row.original.focusKeyword}</Badge> : <span className="text-muted-foreground">—</span> },
    { accessorKey: "noindex", header: "Index", cell: ({ row }) => <Badge variant={row.original.noindex ? "destructive" : "secondary"}>{row.original.noindex ? "noindex" : "index"}</Badge> },
    {
      id: "actions", header: "",
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={() => openEdit(row.original)}><Pencil className="size-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => remove(row.original)}><Trash2 className="size-4 text-destructive" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button className="gap-1.5" onClick={openCreate}><Plus className="size-4" /> Add override</Button>
      </div>
      <DataTable columns={columns} data={rows} pageSize={8} />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit page override" : "New page override"}</DialogTitle>
            <DialogDescription>Per-path meta. Empty fields fall back to the global defaults.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <Field label="Path" required><Input value={form.path} onChange={(e) => setForm((f) => ({ ...f, path: e.target.value }))} placeholder="/courses" /></Field>
            <Field label="Title"><Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} /></Field>
            <Field label="Description"><Textarea rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></Field>
            <div className="grid grid-cols-1 gap-4">
              <Field label="Title (Arabic)"><Input dir="rtl" value={form.titleAr} onChange={(e) => setForm((f) => ({ ...f, titleAr: e.target.value }))} /></Field>
              <Field label="Description (Arabic)"><Textarea dir="rtl" rows={2} value={form.descriptionAr} onChange={(e) => setForm((f) => ({ ...f, descriptionAr: e.target.value }))} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="OG image URL"><Input value={form.ogImage} onChange={(e) => setForm((f) => ({ ...f, ogImage: e.target.value }))} /></Field>
              <Field label="Focus keyword"><Input value={form.focusKeyword} onChange={(e) => setForm((f) => ({ ...f, focusKeyword: e.target.value }))} /></Field>
            </div>
            <Field label="Canonical URL"><Input value={form.canonical} onChange={(e) => setForm((f) => ({ ...f, canonical: e.target.value }))} /></Field>
            <label className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2">
              <span className="text-sm font-medium">No-index this page</span>
              <Switch checked={form.noindex} onCheckedChange={(v) => setForm((f) => ({ ...f, noindex: v }))} />
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={!form.path.trim()}>{editing ? "Save changes" : "Create override"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {Confirmation}
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}{required && <span className="text-destructive"> *</span>}</Label>
      {children}
    </div>
  );
}
