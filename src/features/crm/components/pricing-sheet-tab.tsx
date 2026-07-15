"use client";

import * as React from "react";
import { Pencil, Trash2, Plus, Loader2, Coins, Search, SearchX } from "lucide-react";
import { toast } from "sonner";

import { dal } from "@/lib/dal";
import type { PriceRow } from "@/lib/dal/pricing";
import { usePermission } from "@/hooks/use-permission";
import { useConfirm } from "@/hooks/use-confirm";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Field = keyof Omit<PriceRow, "id" | "order">;

const REGIONS = [
  {
    label: "Egypt", currency: "EGP", keys: ["egyptCash", "egypt2", "egypt3"] as Field[],
    head: "text-blue-700 dark:text-blue-300", tint: "bg-blue-50/60 dark:bg-blue-950/20",
    chip: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300", ring: "border-blue-200 dark:border-blue-900/40",
  },
  {
    label: "Arab Countries", currency: "USD", keys: ["arabCash", "arab2", "arab3"] as Field[],
    head: "text-amber-700 dark:text-amber-300", tint: "bg-amber-50/70 dark:bg-amber-950/20",
    chip: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300", ring: "border-amber-200 dark:border-amber-900/40",
  },
  {
    label: "Saudi Arabia", currency: "SAR", keys: ["saudiCash", "saudi2", "saudi3"] as Field[],
    head: "text-emerald-700 dark:text-emerald-300", tint: "bg-emerald-50/60 dark:bg-emerald-950/20",
    chip: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300", ring: "border-emerald-200 dark:border-emerald-900/40",
  },
];
const PLANS = ["Cash", "2 installments", "3 installments"];
const PLAN_SHORT = ["Cash", "2×", "3×"];

const emptyForm: Omit<PriceRow, "id" | "order"> = {
  program: "",
  egyptCash: "", egypt2: "", egypt3: "",
  arabCash: "", arab2: "", arab3: "",
  saudiCash: "", saudi2: "", saudi3: "",
};

const has = (v: string) => Boolean(v && v.trim() && !/^-+$/.test(v.trim()));
const cellText = (v: string) => (has(v) ? v : "—");

export function PricingSheetTab() {
  const canCreate = usePermission("crm.office.create");
  const canEdit = usePermission("crm.office.edit");
  const canDelete = usePermission("crm.office.delete");
  const canManage = canCreate || canEdit || canDelete;
  const { confirm, Confirmation } = useConfirm();

  const [rows, setRows] = React.useState<PriceRow[]>([]);
  const [query, setQuery] = React.useState("");
  const [loading, setLoading] = React.useState(true);

  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<PriceRow | null>(null);
  const [form, setForm] = React.useState(emptyForm);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await dal.pricing.fetchPriceRows();
      if (cancelled) return;
      if (res.ok) setRows(res.data);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const q = query.trim().toLowerCase();
  const visible = q ? rows.filter((r) => r.program.toLowerCase().includes(q)) : rows;

  const openCreate = () => { setEditing(null); setForm({ ...emptyForm }); setOpen(true); };
  const openEdit = (r: PriceRow) => {
    setEditing(r);
    const { id: _id, order: _order, ...rest } = r;
    setForm(rest);
    setOpen(true);
  };

  const save = async () => {
    if (!form.program.trim()) { toast.error("Program name is required"); return; }
    setSaving(true);
    const payload = { ...form, order: editing ? editing.order : rows.length };
    const res = editing
      ? await dal.pricing.updatePriceRow(editing.id, payload)
      : await dal.pricing.createPriceRow(payload);
    setSaving(false);
    if (!res.ok) { toast.error(res.error); return; }
    setRows((p) => (editing ? p.map((x) => (x.id === res.data.id ? res.data : x)) : [...p, res.data]));
    toast.success(editing ? "Row updated" : "Row added");
    setOpen(false);
  };

  const remove = async (r: PriceRow) => {
    if (!(await confirm({ title: "Delete row", description: `Remove “${r.program}” from the pricing sheet?`, confirmText: "Delete", variant: "destructive" }))) return;
    const res = await dal.pricing.deletePriceRow(r.id);
    if (res.ok) { setRows((p) => p.filter((x) => x.id !== r.id)); toast.success("Deleted"); }
    else toast.error(res.error);
  };

  if (loading) {
    return <div className="flex min-h-[280px] items-center justify-center rounded-2xl border bg-card"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">Pricing sheet <span className="ms-1 text-sm font-normal text-muted-foreground">· {rows.length} programs</span></h3>
          <p className="text-sm text-muted-foreground">Course prices by region and payment plan.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-52 sm:flex-none">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search program…" className="ps-9" />
          </div>
          {canCreate && <Button className="shrink-0 gap-1.5" onClick={openCreate}><Plus className="size-4" /> <span className="hidden sm:inline">Add program</span></Button>}
        </div>
      </div>

      {/* Region legend */}
      <div className="flex flex-wrap gap-2">
        {REGIONS.map((rg) => (
          <span key={rg.label} className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", rg.chip)}>
            <span className="size-1.5 rounded-full bg-current" /> {rg.label} ({rg.currency})
          </span>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/70 bg-gradient-to-b from-muted/30 to-transparent py-20 text-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary"><Coins className="size-7" /></span>
          <p className="font-medium text-foreground">No pricing yet</p>
          {canCreate && <Button variant="outline" className="gap-1.5" onClick={openCreate}><Plus className="size-4" /> Add program</Button>}
        </div>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/70 py-16 text-center">
          <span className="grid size-12 place-items-center rounded-xl bg-muted text-muted-foreground"><SearchX className="size-6" /></span>
          <p className="text-sm text-muted-foreground">No program matches “{query}”.</p>
          <Button variant="ghost" size="sm" onClick={() => setQuery("")}>Clear search</Button>
        </div>
      ) : (
        <>
          {/* Desktop / tablet — table */}
          <div className="hidden overflow-x-auto rounded-2xl border border-border/70 bg-card shadow-sm lg:block">
            <table className="w-full min-w-[860px] border-collapse text-sm">
              <thead>
                <tr className="border-b text-xs uppercase tracking-wide">
                  <th rowSpan={2} className="sticky start-0 z-10 bg-card px-4 py-2.5 text-start font-semibold">Program</th>
                  {REGIONS.map((rg) => (
                    <th key={rg.label} colSpan={3} className={cn("border-s px-3 py-2 text-center font-bold", rg.tint, rg.head)}>
                      {rg.label} <span className="font-normal normal-case opacity-70">({rg.currency})</span>
                    </th>
                  ))}
                  {canManage && <th rowSpan={2} className="border-s bg-card px-3 py-2.5 text-end font-semibold text-muted-foreground">Actions</th>}
                </tr>
                <tr className="border-b text-[11px] uppercase tracking-wide text-muted-foreground">
                  {REGIONS.map((rg) =>
                    PLANS.map((p, i) => (
                      <th key={rg.label + p} className={cn("px-3 py-1.5 text-center font-medium", rg.tint, i === 0 && "border-s")}>{p}</th>
                    )),
                  )}
                </tr>
              </thead>
              <tbody>
                {visible.map((r, ri) => (
                  <tr key={r.id} className={cn("border-b last:border-0 transition-colors hover:bg-primary/5", ri % 2 === 1 && "bg-muted/20")}>
                    <td className="sticky start-0 z-10 bg-inherit px-4 py-3 font-semibold text-foreground">{r.program}</td>
                    {REGIONS.map((rg) =>
                      rg.keys.map((k, i) => (
                        <td key={r.id + k} className={cn("px-3 py-3 text-center tabular-nums", i === 0 ? cn("border-s font-semibold text-foreground") : "text-muted-foreground", !has(r[k]) && "text-muted-foreground/40")}>
                          {cellText(r[k])}
                        </td>
                      )),
                    )}
                    {canManage && (
                      <td className="border-s px-3 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="size-8" title="Edit" onClick={() => openEdit(r)}><Pencil className="size-4" /></Button>
                          <Button variant="ghost" size="icon" className="size-8" title="Delete" onClick={() => remove(r)}><Trash2 className="size-4 text-destructive" /></Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile — cards */}
          <div className="space-y-3 lg:hidden">
            {visible.map((r) => (
              <div key={r.id} className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
                <div className="flex items-center justify-between gap-2 border-b bg-muted/30 px-4 py-2.5">
                  <p className="font-semibold text-foreground">{r.program}</p>
                  {canManage && (
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="size-7" title="Edit" onClick={() => openEdit(r)}><Pencil className="size-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="size-7" title="Delete" onClick={() => remove(r)}><Trash2 className="size-3.5 text-destructive" /></Button>
                    </div>
                  )}
                </div>
                <div className="grid gap-2 p-3 sm:grid-cols-3">
                  {REGIONS.map((rg) => (
                    <div key={rg.label} className={cn("rounded-xl border p-2.5", rg.ring, rg.tint)}>
                      <p className={cn("mb-1.5 text-xs font-bold", rg.head)}>{rg.label} <span className="font-normal opacity-70">({rg.currency})</span></p>
                      <dl className="space-y-1">
                        {rg.keys.map((k, i) => (
                          <div key={k} className="flex items-center justify-between gap-2 text-sm">
                            <dt className="text-xs text-muted-foreground">{PLAN_SHORT[i]}</dt>
                            <dd className={cn("font-medium tabular-nums", has(r[k]) ? "text-foreground" : "text-muted-foreground/40")}>{cellText(r[k])}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Add / edit dialog (super-admin) */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader><DialogTitle>{editing ? "Edit program pricing" : "Add program to pricing sheet"}</DialogTitle></DialogHeader>
          <div className="max-h-[70vh] space-y-4 overflow-y-auto pe-1">
            <div className="space-y-1.5">
              <Label>Program <span className="text-destructive">*</span></Label>
              <Input value={form.program} onChange={(e) => setForm((f) => ({ ...f, program: e.target.value }))} placeholder="e.g. CPHQ" />
            </div>
            {REGIONS.map((rg) => (
              <div key={rg.label} className={cn("space-y-2 rounded-xl border p-3", rg.ring, rg.tint)}>
                <p className={cn("text-sm font-bold", rg.head)}>{rg.label} <span className="text-xs font-normal opacity-70">({rg.currency})</span></p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {rg.keys.map((k, i) => (
                    <div key={k} className="space-y-1">
                      <Label className="text-xs text-muted-foreground">{PLANS[i]}</Label>
                      <Input value={form[k]} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))} placeholder="—" className="bg-background" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <p className="text-xs text-muted-foreground">Type the value exactly as it should appear (e.g. <code>11500</code>, <code>450 $</code>, <code>1,800 SAR</code>). Leave blank where a plan is not offered.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={save} disabled={saving || !form.program.trim()} className="gap-1.5">
              {saving && <Loader2 className="size-4 animate-spin" />}{editing ? "Save" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {Confirmation}
    </div>
  );
}
