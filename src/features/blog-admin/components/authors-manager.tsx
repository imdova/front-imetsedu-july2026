"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus, Pencil, Trash2, PenTool, Eye, FileText } from "lucide-react";
import { toast } from "sonner";

import { dal } from "@/lib/dal";
import type { BlogAuthor, BlogAuthorInput } from "@/types/blog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DataTable } from "@/components/shared/data-table/data-table";
import { KpiCard } from "@/components/shared/kpi-card";
import { ImageUpload } from "@/components/shared/image-upload";
import { useConfirm } from "@/hooks/use-confirm";
import { getInitials } from "@/lib/utils";

const empty: BlogAuthorInput = { name: "", email: "", avatarUrl: "", role: "", bio: "" };

export function AuthorsManager({ initial }: { initial: BlogAuthor[] }) {
  const { confirm, Confirmation } = useConfirm();
  const [rows, setRows] = React.useState(initial);
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<BlogAuthor | null>(null);
  const [form, setForm] = React.useState<BlogAuthorInput>(empty);
  const set = <K extends keyof BlogAuthorInput>(k: K, v: BlogAuthorInput[K]) => setForm((f) => ({ ...f, [k]: v }));

  const openCreate = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (a: BlogAuthor) => { setEditing(a); setForm({ name: a.name, email: a.email, avatarUrl: a.avatarUrl, role: a.role, bio: a.bio }); setOpen(true); };
  const save = async () => {
    if (!form.name?.trim()) return;
    const res = editing ? await dal.blog.updateAuthor(editing.id, form) : await dal.blog.createAuthor(form);
    if (res.ok) { setRows((p) => editing ? p.map((x) => x.id === res.data.id ? res.data : x) : [...p, res.data]); toast.success(editing ? "Updated" : "Created"); setOpen(false); }
    else toast.error(res.error);
  };
  const remove = async (a: BlogAuthor) => {
    if (!(await confirm({ title: "Delete author", description: `“${a.name}”?`, confirmText: "Delete", variant: "destructive" }))) return;
    const res = await dal.blog.deleteAuthor(a.id);
    if (res.ok) { setRows((p) => p.filter((x) => x.id !== a.id)); toast.success("Deleted"); } else toast.error(res.error);
  };

  const totals = {
    authors: rows.length,
    articles: rows.reduce((s, a) => s + (a.articleCount ?? 0), 0),
    views: rows.reduce((s, a) => s + (a.totalViews ?? 0), 0),
  };

  const columns: ColumnDef<BlogAuthor>[] = [
    {
      accessorKey: "name", header: "Author",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="size-9">{row.original.avatarUrl ? <AvatarImage src={row.original.avatarUrl} alt={row.original.name} /> : null}<AvatarFallback>{getInitials(row.original.name)}</AvatarFallback></Avatar>
          <div><p className="font-medium">{row.original.name}</p>{row.original.role && <p className="text-xs text-muted-foreground">{row.original.role}</p>}</div>
        </div>
      ),
    },
    { accessorKey: "email", header: "Email", cell: ({ row }) => row.original.email ? <a href={`mailto:${row.original.email}`} className="text-sm text-primary hover:underline">{row.original.email}</a> : <span className="text-muted-foreground">—</span> },
    { accessorKey: "articleCount", header: "Articles", cell: ({ row }) => <span className="tabular-nums">{row.original.articleCount ?? 0}</span> },
    { accessorKey: "totalViews", header: "Views", cell: ({ row }) => <span className="tabular-nums">{(row.original.totalViews ?? 0).toLocaleString()}</span> },
    { id: "actions", header: "", cell: ({ row }) => <div className="flex justify-end gap-1"><Button variant="ghost" size="sm" onClick={() => openEdit(row.original)}><Pencil className="size-4" /></Button><Button variant="ghost" size="sm" onClick={() => remove(row.original)}><Trash2 className="size-4 text-destructive" /></Button></div> },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard label="Authors" value={totals.authors} icon={PenTool} intent="primary" />
        <KpiCard label="Articles" value={totals.articles} icon={FileText} intent="info" />
        <KpiCard label="Total views" value={totals.views.toLocaleString()} icon={Eye} intent="success" />
      </div>
      <div className="flex justify-end"><Button className="gap-1.5" onClick={openCreate}><Plus className="size-4" /> Add author</Button></div>
      <DataTable columns={columns} data={rows} pageSize={10} />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit author" : "New author"}</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Fld label="Name"><Input value={form.name ?? ""} onChange={(e) => set("name", e.target.value)} /></Fld>
              <Fld label="Email"><Input type="email" value={form.email ?? ""} onChange={(e) => set("email", e.target.value)} /></Fld>
            </div>
            <Fld label="Role"><Input value={form.role ?? ""} onChange={(e) => set("role", e.target.value)} placeholder="Senior Editor" /></Fld>
            <Fld label="Bio"><Textarea rows={3} value={form.bio ?? ""} onChange={(e) => set("bio", e.target.value)} /></Fld>
            <Fld label="Avatar"><ImageUpload value={form.avatarUrl} onChange={(url) => set("avatarUrl", url)} hint="Square image recommended" /></Fld>
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
