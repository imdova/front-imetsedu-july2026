"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus, Pencil, Trash2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { dal } from "@/lib/dal";
import type { SeoRedirect, SeoRedirectInput, RedirectType } from "@/lib/db/seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/shared/data-table/data-table";
import { useConfirm } from "@/hooks/use-confirm";

const TYPES: RedirectType[] = ["301", "302", "307", "308"];
const empty: SeoRedirectInput = { from: "", to: "", type: "301", isActive: true };

export function SeoRedirectsPanel({ initial }: { initial: SeoRedirect[] }) {
  const { confirm, Confirmation } = useConfirm();
  const [rows, setRows] = React.useState(initial);
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<SeoRedirect | null>(null);
  const [form, setForm] = React.useState<SeoRedirectInput>(empty);

  const openCreate = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (r: SeoRedirect) => { setEditing(r); const { id: _i, ...rest } = r; setForm(rest); setOpen(true); };

  const save = async () => {
    if (!form.from.trim() || !form.to.trim()) return;
    const res = editing ? await dal.seo.updateRedirect(editing.id, form) : await dal.seo.createRedirect(form);
    if (res.ok && res.data) {
      setRows((p) => (editing ? p.map((x) => (x.id === res.data!.id ? res.data! : x)) : [...p, res.data!]));
      toast.success(editing ? "Redirect updated" : "Redirect created"); setOpen(false);
    } else toast.error(res.ok ? "Not found" : res.error);
  };
  const toggle = async (r: SeoRedirect) => {
    const res = await dal.seo.updateRedirect(r.id, { isActive: !r.isActive });
    if (res.ok && res.data) setRows((p) => p.map((x) => (x.id === res.data!.id ? res.data! : x)));
  };
  const remove = async (r: SeoRedirect) => {
    const okConfirm = await confirm({ title: "Delete redirect", description: `${r.from} → ${r.to} will be removed.`, confirmText: "Delete", variant: "destructive" });
    if (!okConfirm) return;
    const res = await dal.seo.deleteRedirect(r.id);
    if (res.ok) { setRows((p) => p.filter((x) => x.id !== r.id)); toast.success("Redirect deleted"); }
    else toast.error(res.error);
  };

  const columns: ColumnDef<SeoRedirect>[] = [
    {
      id: "route", header: "Redirect",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 font-mono text-xs">
          <span>{row.original.from}</span>
          <ArrowRight className="size-3 text-muted-foreground" />
          <span className="text-muted-foreground">{row.original.to}</span>
        </div>
      ),
    },
    { accessorKey: "type", header: "Type", cell: ({ row }) => <Badge variant="outline">{row.original.type}</Badge> },
    { accessorKey: "isActive", header: "Status", cell: ({ row }) => <Badge variant={row.original.isActive ? "default" : "secondary"}>{row.original.isActive ? "Active" : "Off"}</Badge> },
    {
      id: "actions", header: "",
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          <Switch checked={row.original.isActive} onCheckedChange={() => toggle(row.original)} />
          <Button variant="ghost" size="sm" onClick={() => openEdit(row.original)}><Pencil className="size-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => remove(row.original)}><Trash2 className="size-4 text-destructive" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button className="gap-1.5" onClick={openCreate}><Plus className="size-4" /> Add redirect</Button>
      </div>
      <DataTable columns={columns} data={rows} pageSize={8} />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Edit redirect" : "New redirect"}</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <Field label="From" required><Input value={form.from} onChange={(e) => setForm((f) => ({ ...f, from: e.target.value }))} placeholder="/old-path" /></Field>
            <Field label="To" required><Input value={form.to} onChange={(e) => setForm((f) => ({ ...f, to: e.target.value }))} placeholder="/new-path" /></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Type">
                <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v as RedirectType }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <label className="flex items-center justify-between self-end rounded-lg border border-border/70 px-3 py-2">
                <span className="text-sm font-medium">Active</span>
                <Switch checked={form.isActive} onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))} />
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={!form.from.trim() || !form.to.trim()}>{editing ? "Save changes" : "Create redirect"}</Button>
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
