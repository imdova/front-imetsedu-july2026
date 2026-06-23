"use client";

import * as React from "react";
import { Plus, Pencil, Trash2, Code2, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { toast } from "sonner";

import { dal } from "@/lib/dal";
import type { SeoSchema, SeoSchemaInput, SchemaSummary, SchemaHealth } from "@/lib/db/seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { KpiCard } from "@/components/shared/kpi-card";
import { useConfirm } from "@/hooks/use-confirm";

const empty: SeoSchemaInput = { name: "", type: "", jsonld: "{\n  \n}", status: true };

const HEALTH: Record<SchemaHealth, { icon: typeof CheckCircle2; cls: string; label: string }> = {
  valid: { icon: CheckCircle2, cls: "text-success", label: "Valid" },
  warnings: { icon: AlertTriangle, cls: "text-warning", label: "Warnings" },
  errors: { icon: XCircle, cls: "text-destructive", label: "Errors" },
};

export function SeoSchemaPanel({
  initial, initialSummary,
}: {
  initial: SeoSchema[];
  initialSummary: SchemaSummary;
}) {
  const { confirm, Confirmation } = useConfirm();
  const [rows, setRows] = React.useState(initial);
  const [summary, setSummary] = React.useState(initialSummary);
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<SeoSchema | null>(null);
  const [form, setForm] = React.useState<SeoSchemaInput>(empty);
  const [viewing, setViewing] = React.useState<SeoSchema | null>(null);

  const refresh = async () => {
    const res = await dal.seo.fetchSchemas();
    if (res.ok) { setRows(res.data.data); setSummary(res.data.summary); }
  };

  const openCreate = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (s: SeoSchema) => { setEditing(s); setForm({ name: s.name, type: s.type, jsonld: s.jsonld, status: s.status }); setOpen(true); };

  const save = async () => {
    if (!form.name.trim()) return;
    const res = editing ? await dal.seo.updateSchema(editing.id, form) : await dal.seo.createSchema(form);
    if (res.ok && res.data) { toast.success(editing ? "Schema updated" : "Schema created"); setOpen(false); refresh(); }
    else toast.error(res.ok ? "Not found" : res.error);
  };
  const remove = async (s: SeoSchema) => {
    const okConfirm = await confirm({ title: "Delete schema", description: `“${s.name}” will be removed.`, confirmText: "Delete", variant: "destructive" });
    if (!okConfirm) return;
    const res = await dal.seo.deleteSchema(s.id);
    if (res.ok) { toast.success("Schema deleted"); refresh(); }
    else toast.error(res.error);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard label="Schemas" value={summary.total} icon={Code2} intent="primary" />
        <KpiCard label="Active" value={summary.active} icon={CheckCircle2} intent="success" />
        <KpiCard label="Valid" value={summary.valid} icon={CheckCircle2} intent="info" />
        <KpiCard label="Need attention" value={summary.needAttention} icon={AlertTriangle} intent="warning" />
        <KpiCard label="Health score" value={`${summary.healthScore}%`} icon={CheckCircle2} intent="success" />
      </div>

      <div className="flex justify-end">
        <Button className="gap-1.5" onClick={openCreate}><Plus className="size-4" /> Add schema</Button>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {rows.map((s) => {
          const h = HEALTH[s.health];
          const HIcon = h.icon;
          return (
            <Card key={s.id}>
              <CardContent className="space-y-3 py-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{s.name}</p>
                      <Badge variant="outline">{s.type}</Badge>
                      {!s.status && <Badge variant="secondary">Inactive</Badge>}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{s.pagesLinked} page(s) linked</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 text-xs font-medium ${h.cls}`}>
                    <HIcon className="size-3.5" /> {h.label}
                  </span>
                </div>
                {s.issues.length > 0 && (
                  <ul className="space-y-0.5 text-xs text-muted-foreground">
                    {s.issues.map((i, idx) => <li key={idx}>• {i}</li>)}
                  </ul>
                )}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setViewing(s)}>View JSON-LD</Button>
                  <Button variant="ghost" size="sm" onClick={() => openEdit(s)}><Pencil className="size-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => remove(s)}><Trash2 className="size-4 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Editor */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit schema" : "New JSON-LD schema"}</DialogTitle>
            <DialogDescription>Paste a valid JSON-LD block. Invalid JSON is flagged with an error health state.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Name" required><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></Field>
              <Field label="Type"><Input value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} placeholder="Organization" /></Field>
            </div>
            <Field label="JSON-LD"><Textarea rows={10} className="font-mono text-xs" value={form.jsonld} onChange={(e) => setForm((f) => ({ ...f, jsonld: e.target.value }))} /></Field>
            <label className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2">
              <span className="text-sm font-medium">Active</span>
              <Switch checked={form.status} onCheckedChange={(v) => setForm((f) => ({ ...f, status: v }))} />
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={!form.name.trim()}>{editing ? "Save changes" : "Create schema"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View JSON-LD */}
      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader><DialogTitle>{viewing?.name}</DialogTitle></DialogHeader>
          <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs">{viewing?.jsonld}</pre>
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
