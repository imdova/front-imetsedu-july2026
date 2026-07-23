"use client";

import * as React from "react";
import {
  Pencil,
  Trash2,
  Plus,
  Loader2,
  Coins,
  Search,
  SearchX,
  Banknote,
  CreditCard,
  CalendarClock,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import { dal } from "@/lib/dal";
import type { PriceRow } from "@/lib/dal/pricing";
import { usePermission } from "@/hooks/use-permission";
import { useConfirm } from "@/hooks/use-confirm";
import { cn, getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Field = keyof Omit<PriceRow, "id" | "order">;

const REGIONS = [
  {
    label: "Egypt", currency: "EGP", keys: ["egyptCash", "egypt2", "egypt3"] as Field[],
    head: "text-blue-700 dark:text-blue-300", tint: "bg-blue-50/60 dark:bg-blue-950/20",
    chip: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    ring: "border-blue-200 dark:border-blue-900/40", dot: "bg-blue-500",
  },
  {
    label: "Arab Countries", currency: "USD", keys: ["arabCash", "arab2", "arab3"] as Field[],
    head: "text-amber-700 dark:text-amber-300", tint: "bg-amber-50/70 dark:bg-amber-950/20",
    chip: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    ring: "border-amber-200 dark:border-amber-900/40", dot: "bg-amber-500",
  },
  {
    label: "Saudi Arabia", currency: "SAR", keys: ["saudiCash", "saudi2", "saudi3"] as Field[],
    head: "text-emerald-700 dark:text-emerald-300", tint: "bg-emerald-50/60 dark:bg-emerald-950/20",
    chip: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    ring: "border-emerald-200 dark:border-emerald-900/40", dot: "bg-emerald-500",
  },
];
const PLANS = ["Cash", "2 installments", "3 installments"];
/** Per-plan icon for the row label — cash is the headline, then the two plans. */
const PLAN_ICON: LucideIcon[] = [Banknote, CreditCard, CalendarClock];

const emptyForm: Omit<PriceRow, "id" | "order"> = {
  program: "",
  egyptCash: "", egypt2: "", egypt3: "",
  arabCash: "", arab2: "", arab3: "",
  saudiCash: "", saudi2: "", saudi3: "",
};

const has = (v: string) => Boolean(v && v.trim() && !/^-+$/.test(v.trim()));

/**
 * Installment plans store one value per installment inside the existing
 * free-text field, pipe-joined ("6000 | 6000"). These split it into `n` inputs
 * for editing and join them back for storage — so no backend change is needed.
 */
const SEP = " | ";
const ORD = ["1st", "2nd", "3rd"];
const splitInst = (v: string, n: number): string[] => {
  const parts = (v || "").split("|").map((s) => s.trim());
  return Array.from({ length: n }, (_, i) => parts[i] ?? "");
};
const joinInst = (parts: string[]): string => {
  const cleaned = parts.map((s) => s.trim());
  // Drop trailing blanks so an unfinished plan doesn't persist a dangling "6000 |".
  while (cleaned.length && cleaned[cleaned.length - 1] === "") cleaned.pop();
  return cleaned.join(SEP);
};
/** A price cell: emphasizes the amount(s); installment "+" separators are muted. */
function CellValue({ v }: { v: string }) {
  if (!has(v)) return <span className="text-muted-foreground/30">—</span>;
  const parts = v.split("|").map((s) => s.trim()).filter(Boolean);
  if (parts.length <= 1) return <span>{v.trim()}</span>;
  return (
    <span className="inline-flex flex-wrap items-center justify-center gap-x-1">
      {parts.map((p, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className="text-muted-foreground/45">+</span>}
          <span>{p}</span>
        </React.Fragment>
      ))}
    </span>
  );
}

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

  /** Update one installment of a plan, keeping the field pipe-joined. */
  const setInstPart = (k: Field, count: number, idx: number, val: string) =>
    setForm((f) => {
      const parts = splitInst(f[k], count);
      parts[idx] = val;
      return { ...f, [k]: joinInst(parts) };
    });

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
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
            <Coins className="size-5" />
          </span>
          <div>
            <h3 className="text-lg font-semibold tracking-tight">
              Pricing sheet{" "}
              <span className="ms-1 text-sm font-normal text-muted-foreground">· {rows.length} programs</span>
            </h3>
            <p className="text-sm text-muted-foreground">Course prices by region and payment plan.</p>
          </div>
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
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-border/60 bg-muted/25 px-3.5 py-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/80">Regions</span>
        {REGIONS.map((rg) => (
          <span key={rg.label} className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground/80">
            <span className={cn("size-2 rounded-full", rg.dot)} />
            {rg.label} <span className="text-muted-foreground">· {rg.currency}</span>
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
        // One card per program, two per row on wide screens; inside each, plans
        // are vertical ROWS (Cash / 2 installments / 3 installments) and regions
        // are the columns.
        <div className="grid gap-4 xl:grid-cols-2">
          {visible.map((r) => (
            <div
              key={r.id}
              className="group relative z-0 flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm ring-1 ring-transparent transition-all duration-200 hover:z-10 hover:scale-[1.03] hover:border-primary/25 hover:shadow-lg hover:ring-primary/10"
            >
              {/* Header — program identity */}
              <div className="flex items-center gap-2.5 border-b bg-gradient-to-r from-primary/[0.06] to-transparent px-3.5 py-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 font-heading text-xs font-bold uppercase tracking-tight text-primary ring-1 ring-primary/15">
                  {getInitials(r.program)}
                </span>
                <p className="min-w-0 flex-1 truncate font-semibold tracking-tight text-foreground" title={r.program}>
                  {r.program}
                </p>
                {canManage && (
                  <div className="flex shrink-0 items-center gap-0.5 opacity-60 transition-opacity group-hover:opacity-100">
                    <Button variant="ghost" size="icon" className="size-7" title="Edit" onClick={() => openEdit(r)}><Pencil className="size-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="size-7" title="Delete" onClick={() => remove(r)}><Trash2 className="size-3.5 text-destructive" /></Button>
                  </div>
                )}
              </div>

              {/* Prices — plans as rows, regions as columns */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="px-3.5 py-2 text-start text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                        Plan
                      </th>
                      {REGIONS.map((rg) => (
                        <th key={rg.label} className={cn("border-s px-3 py-2 text-center align-middle leading-none", rg.tint)}>
                          <span className={cn("inline-flex items-center gap-1.5 text-xs font-bold", rg.head)}>
                            <span className={cn("size-1.5 rounded-full", rg.dot)} />
                            {rg.currency}
                          </span>
                          <span className="mt-1 block text-[10px] font-medium normal-case text-muted-foreground">
                            {rg.label}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {PLANS.map((plan, i) => {
                      const isCash = i === 0;
                      const Icon = PLAN_ICON[i];
                      return (
                        <tr
                          key={plan}
                          className={cn(
                            "border-b transition-colors last:border-0 hover:bg-primary/[0.04]",
                            isCash && "bg-primary/[0.035]",
                          )}
                        >
                          <td className="whitespace-nowrap px-3.5 py-2.5">
                            <span className="inline-flex items-center gap-2">
                              <Icon
                                className={cn(
                                  "size-3.5 shrink-0",
                                  isCash ? "text-primary" : "text-muted-foreground/60",
                                )}
                              />
                              <span className={cn("text-sm", isCash ? "font-semibold text-foreground" : "font-medium text-foreground/80")}>
                                {plan}
                              </span>
                            </span>
                          </td>
                          {REGIONS.map((rg) => {
                            const v = r[rg.keys[i]];
                            return (
                              <td
                                key={rg.label}
                                className={cn(
                                  "border-s px-3 py-2.5 text-center tabular-nums",
                                  isCash ? "text-[0.95rem] font-bold text-foreground" : "font-medium text-muted-foreground",
                                  !has(v) && "text-muted-foreground/30",
                                )}
                              >
                                <CellValue v={v} />
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
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
              <div key={rg.label} className={cn("space-y-2.5 rounded-xl border p-3", rg.ring, rg.tint)}>
                <p className={cn("inline-flex items-center gap-1.5 text-sm font-bold", rg.head)}>
                  <span className={cn("size-2 rounded-full", rg.dot)} />
                  {rg.label} <span className="text-xs font-normal opacity-70">({rg.currency})</span>
                </p>
                <div className="space-y-2.5">
                  {rg.keys.map((k, i) => {
                    // index 0 = Cash (1 input), 1 = 2 installments (2 inputs),
                    // 2 = 3 installments (3 inputs).
                    const count = i + 1;
                    const parts = splitInst(form[k], count);
                    const PlanIcon = PLAN_ICON[i];
                    return (
                      <div key={k} className="space-y-1">
                        <Label className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                          <PlanIcon className="size-3.5" /> {PLANS[i]}
                        </Label>
                        <div
                          className={cn(
                            "grid gap-2",
                            count === 1 && "grid-cols-1",
                            count === 2 && "grid-cols-2",
                            count === 3 && "grid-cols-3",
                          )}
                        >
                          {parts.map((p, idx) => (
                            <Input
                              key={idx}
                              value={p}
                              onChange={(e) => setInstPart(k, count, idx, e.target.value)}
                              placeholder={count === 1 ? "—" : `${ORD[idx]} payment`}
                              className="bg-background"
                              aria-label={count === 1 ? PLANS[i] : `${PLANS[i]} · ${ORD[idx]} payment`}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            <p className="text-xs text-muted-foreground">Enter each value as it should appear (e.g. <code>11500</code>, <code>450 $</code>). For installment plans, type the amount of each payment in its own box — they show on the sheet as <code>6000&nbsp;+&nbsp;6000</code>. Leave blank where a plan isn&apos;t offered.</p>
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
