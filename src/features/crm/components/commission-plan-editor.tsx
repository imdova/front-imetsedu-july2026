"use client";

import * as React from "react";
import { Save, Plus, Trash2, Coins, BadgeDollarSign, Info } from "lucide-react";
import { toast } from "sonner";

import { dal } from "@/lib/dal";
import type { CommissionPlan } from "@/lib/db/commission";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

const num = (v: string) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

export function CommissionPlanEditor() {
  const [plan, setPlan] = React.useState<CommissionPlan | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    dal.commission.fetchPlan().then((r) => {
      if (r.ok) setPlan(r.data);
      else toast.error(r.error);
      setLoading(false);
    });
  }, []);

  if (loading) return <p className="py-10 text-center text-sm text-muted-foreground">Loading commission plan…</p>;
  if (!plan) return <p className="py-10 text-center text-sm text-destructive">Couldn&apos;t load the commission plan.</p>;

  const setProgram = (i: number, patch: Partial<CommissionPlan["programs"][number]>) =>
    setPlan((p) => (p ? { ...p, programs: p.programs.map((x, idx) => (idx === i ? { ...x, ...patch } : x)) } : p));
  const addProgram = () =>
    setPlan((p) => (p ? { ...p, programs: [...p.programs, { name: "", egypt: 0, arab: 0 }] } : p));
  const removeProgram = (i: number) =>
    setPlan((p) => (p ? { ...p, programs: p.programs.filter((_, idx) => idx !== i) } : p));
  const setRole = (i: number, patch: Partial<CommissionPlan["roles"][number]>) =>
    setPlan((p) => (p ? { ...p, roles: p.roles.map((x, idx) => (idx === i ? { ...x, ...patch } : x)) } : p));

  const save = async () => {
    setSaving(true);
    const res = await dal.commission.updatePlan(plan);
    setSaving(false);
    if (res.ok) { setPlan(res.data); toast.success("Commission plan saved"); }
    else toast.error(res.error);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><BadgeDollarSign className="size-5" /></span>
          <div>
            <h2 className="font-heading text-lg font-bold leading-tight">Commission Plan</h2>
            <p className="text-sm text-muted-foreground">Per-program commission (by nationality) and role-based tiers. Amounts in EGP.</p>
          </div>
        </div>
        <Button className="gap-1.5" onClick={save} disabled={saving}>
          <Save className="size-4" /> {saving ? "Saving…" : "Save plan"}
        </Button>
      </div>

      {/* Program commission table */}
      <Card>
        <CardContent className="space-y-4 py-5">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Coins className="size-4" /> Commission per Program
            </p>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={addProgram}><Plus className="size-4" /> Add program</Button>
          </div>
          <div className="overflow-x-auto rounded-xl border border-border/60">
            <table className="w-full min-w-[40rem] text-sm">
              <thead>
                <tr className="border-b border-border/60 text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="w-10 px-3 py-2.5 text-start font-medium">#</th>
                  <th className="px-3 py-2.5 text-start font-medium">Program</th>
                  <th className="w-40 px-3 py-2.5 text-start font-medium">Egypt (EGP)</th>
                  <th className="w-40 px-3 py-2.5 text-start font-medium">Arab (EGP)</th>
                  <th className="w-12 px-3 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {plan.programs.length === 0 ? (
                  <tr><td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">No programs — add one.</td></tr>
                ) : (
                  plan.programs.map((p, i) => (
                    <tr key={i} className="border-b border-border/40 last:border-0">
                      <td className="px-3 py-2 text-muted-foreground tabular-nums">{i + 1}</td>
                      <td className="px-3 py-2">
                        <Input value={p.name} onChange={(e) => setProgram(i, { name: e.target.value })} placeholder="Program name" />
                      </td>
                      <td className="px-3 py-2">
                        <Input type="number" min={0} value={String(p.egypt)} onChange={(e) => setProgram(i, { egypt: num(e.target.value) })} className="tabular-nums" />
                      </td>
                      <td className="px-3 py-2">
                        <Input type="number" min={0} value={String(p.arab)} onChange={(e) => setProgram(i, { arab: num(e.target.value) })} className="tabular-nums" />
                      </td>
                      <td className="px-3 py-2 text-end">
                        <Button variant="ghost" size="icon" className="size-8" onClick={() => removeProgram(i)}><Trash2 className="size-4 text-destructive" /></Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Role tiers */}
      <Card>
        <CardContent className="space-y-4 py-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Role-based Tiers</p>
          <p className="-mt-2 text-sm text-muted-foreground">
            Below <strong>Min customers</strong> no commission is paid. On reaching it the rep earns <strong>Amount at 5</strong>, at the next
            customer <strong>Amount at 6</strong>, and every additional customer is paid per the program table above.
          </p>
          <div className="grid gap-4 lg:grid-cols-2">
            {plan.roles.map((r, i) => (
              <div key={r.key || i} className="space-y-3 rounded-xl border border-border/60 p-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Role</Label>
                  <Input value={r.label} onChange={(e) => setRole(i, { label: e.target.value })} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Min customers</Label>
                    <Input type="number" min={0} value={String(r.minCustomers)} onChange={(e) => setRole(i, { minCustomers: num(e.target.value) })} className="tabular-nums" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Amount at 5 (EGP)</Label>
                    <Input type="number" min={0} value={String(r.amountAt5)} onChange={(e) => setRole(i, { amountAt5: num(e.target.value) })} className="tabular-nums" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Amount at 6 (EGP)</Label>
                    <Input type="number" min={0} value={String(r.amountAt6)} onChange={(e) => setRole(i, { amountAt6: num(e.target.value) })} className="tabular-nums" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Existing-customer rule */}
      <Card>
        <CardContent className="space-y-3 py-5">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <Info className="size-4" /> Existing customer rule
          </p>
          <Textarea
            rows={3}
            dir="auto"
            value={plan.existingCustomerNote}
            onChange={(e) => setPlan((p) => (p ? { ...p, existingCustomerNote: e.target.value } : p))}
            placeholder="في حالة إشتراك عميل قديم… (describe how commission is handled for returning customers)"
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button className="gap-1.5" onClick={save} disabled={saving}>
          <Save className="size-4" /> {saving ? "Saving…" : "Save plan"}
        </Button>
      </div>
    </div>
  );
}
