"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus, Pencil, Trash2, Wand2 } from "lucide-react";
import { toast } from "sonner";

import { useRouter } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import type { BlogTemplate, BlogTemplateInput } from "@/types/blog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DataTable } from "@/components/shared/data-table/data-table";
import { useConfirm } from "@/hooks/use-confirm";

const empty: BlogTemplateInput = { name: "", description: "" };

export function TemplatesManager({ initial }: { initial: BlogTemplate[] }) {
  const router = useRouter();
  const { confirm, Confirmation } = useConfirm();
  const [rows, setRows] = React.useState(initial);
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<BlogTemplate | null>(null);
  const [form, setForm] = React.useState<BlogTemplateInput>(empty);
  const set = <K extends keyof BlogTemplateInput>(k: K, v: BlogTemplateInput[K]) => setForm((f) => ({ ...f, [k]: v }));

  const openCreate = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (t: BlogTemplate) => { setEditing(t); setForm({ name: t.name, description: t.description }); setOpen(true); };
  const save = async () => {
    if (!form.name?.trim()) return;
    // Preserve the existing builder doc when editing metadata; new templates start empty.
    const payload: BlogTemplateInput = editing ? { ...form, doc: editing.doc } : { ...form, doc: { meta: {}, sections: [] } };
    const res = editing ? await dal.blog.updateTemplate(editing.id, payload) : await dal.blog.createTemplate(payload);
    if (res.ok) { setRows((p) => editing ? p.map((x) => x.id === res.data.id ? res.data : x) : [...p, res.data]); toast.success(editing ? "Updated" : "Created"); setOpen(false); }
    else toast.error(res.error);
  };
  const remove = async (t: BlogTemplate) => {
    if (!(await confirm({ title: "Delete template", description: `“${t.name}”?`, confirmText: "Delete", variant: "destructive" }))) return;
    const res = await dal.blog.deleteTemplate(t.id);
    if (res.ok) { setRows((p) => p.filter((x) => x.id !== t.id)); toast.success("Deleted"); } else toast.error(res.error);
  };

  const columns: ColumnDef<BlogTemplate>[] = [
    { accessorKey: "name", header: "Template", cell: ({ row }) => <span className="font-medium">{row.original.name}</span> },
    { accessorKey: "description", header: "Description", cell: ({ row }) => <span className="line-clamp-1 text-sm text-muted-foreground">{row.original.description || "—"}</span> },
    {
      id: "actions", header: "",
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => router.push(`/admin/blog/new?templateId=${row.original.id}`)}><Wand2 className="size-4" /> Use</Button>
          <Button variant="ghost" size="sm" onClick={() => openEdit(row.original)}><Pencil className="size-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => remove(row.original)}><Trash2 className="size-4 text-destructive" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><Button className="gap-1.5" onClick={openCreate}><Plus className="size-4" /> New template</Button></div>
      <DataTable columns={columns} data={rows} pageSize={10} emptyState={<div className="text-sm text-muted-foreground">No templates yet. Save one from the article builder, or create a blank one here.</div>} />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit template" : "New template"}</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <Fld label="Name"><Input value={form.name ?? ""} onChange={(e) => set("name", e.target.value)} /></Fld>
            <Fld label="Description"><Textarea rows={3} value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} /></Fld>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save} disabled={!form.name?.trim()}>{editing ? "Save" : "Create"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      {Confirmation}
    </div>
  );
}

function Fld({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs font-medium text-muted-foreground">{label}</Label>{children}</div>;
}
