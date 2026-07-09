"use client";

import * as React from "react";
import { Copy, Check, Pencil, Trash2, Plus, Wallet, Smartphone, Building2, Landmark, Globe, CreditCard, Loader2, Search, SearchX, type LucideIcon } from "lucide-react";
import { toast } from "sonner";

import { dal } from "@/lib/dal";
import type { PaymentMethod } from "@/lib/dal/payment-methods";
import { useAuth } from "@/store";
import { useConfirm } from "@/hooks/use-confirm";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const emptyForm = { title: "", details: "" };

/** Map a method title to a brand-ish icon + colour. */
function brand(title: string): { Icon: LucideIcon; chip: string; accent: string } {
  const t = title.toLowerCase();
  if (t.includes("vodafone") || t.includes("cash") || t.includes("fawry") || t.includes("etisalat") || t.includes("orange"))
    return { Icon: Smartphone, chip: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300", accent: "from-rose-500 to-rose-400" };
  if (t.includes("instapay") || t.includes("insta"))
    return { Icon: Landmark, chip: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300", accent: "from-violet-500 to-violet-400" };
  if (t.includes("bank") || t.includes("transfer") || t.includes("iban"))
    return { Icon: Building2, chip: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300", accent: "from-blue-500 to-blue-400" };
  if (t.includes("paypal") || t.includes("international") || t.includes("visa") || t.includes("card"))
    return { Icon: Globe, chip: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300", accent: "from-sky-500 to-sky-400" };
  if (t.includes("credit") || t.includes("debit"))
    return { Icon: CreditCard, chip: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300", accent: "from-emerald-500 to-emerald-400" };
  return { Icon: Wallet, chip: "bg-primary/10 text-primary", accent: "from-primary to-primary/50" };
}

export function PaymentMethodsTab() {
  const { user } = useAuth();
  const canManage = !user?.staffRole; // super-admin only
  const { confirm, Confirmation } = useConfirm();

  const [methods, setMethods] = React.useState<PaymentMethod[]>([]);
  const [query, setQuery] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<PaymentMethod | null>(null);
  const [form, setForm] = React.useState(emptyForm);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await dal.paymentMethods.fetchPaymentMethods();
      if (cancelled) return;
      if (res.ok) setMethods(res.data);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const q = query.trim().toLowerCase();
  const visible = q ? methods.filter((m) => m.title.toLowerCase().includes(q) || m.details.toLowerCase().includes(q)) : methods;

  const copy = async (m: PaymentMethod) => {
    try {
      await navigator.clipboard.writeText(m.details);
      setCopiedId(m.id);
      toast.success("Copied — paste it to the customer");
      window.setTimeout(() => setCopiedId((c) => (c === m.id ? null : c)), 1500);
    } catch {
      toast.error("Couldn't copy — select the text manually");
    }
  };

  const openCreate = () => { setEditing(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (m: PaymentMethod) => { setEditing(m); setForm({ title: m.title, details: m.details }); setOpen(true); };

  const save = async () => {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    setSaving(true);
    const res = editing
      ? await dal.paymentMethods.updatePaymentMethod(editing.id, form)
      : await dal.paymentMethods.createPaymentMethod(form);
    setSaving(false);
    if (!res.ok) { toast.error(res.error); return; }
    setMethods((p) => (editing ? p.map((x) => (x.id === res.data.id ? res.data : x)) : [...p, res.data]));
    toast.success(editing ? "Payment method updated" : "Payment method added");
    setOpen(false);
  };

  const remove = async (m: PaymentMethod) => {
    if (!(await confirm({ title: "Delete payment method", description: `“${m.title}”?`, confirmText: "Delete", variant: "destructive" }))) return;
    const res = await dal.paymentMethods.deletePaymentMethod(m.id);
    if (res.ok) { setMethods((p) => p.filter((x) => x.id !== m.id)); toast.success("Deleted"); }
    else toast.error(res.error);
  };

  if (loading) {
    return <div className="flex min-h-[280px] items-center justify-center rounded-2xl border bg-card"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">Payment methods <span className="ms-1 text-sm font-normal text-muted-foreground">· {methods.length}</span></h3>
          <p className="text-sm text-muted-foreground">Channels and account details to share with customers.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-52 sm:flex-none">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search…" className="ps-9" />
          </div>
          {canManage && <Button className="shrink-0 gap-1.5" onClick={openCreate}><Plus className="size-4" /> <span className="hidden sm:inline">Add method</span></Button>}
        </div>
      </div>

      {methods.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/70 bg-gradient-to-b from-muted/30 to-transparent py-20 text-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary"><Wallet className="size-7" /></span>
          <p className="font-medium text-foreground">No payment methods yet</p>
          {canManage && <Button variant="outline" className="gap-1.5" onClick={openCreate}><Plus className="size-4" /> Add method</Button>}
        </div>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/70 py-16 text-center">
          <span className="grid size-12 place-items-center rounded-xl bg-muted text-muted-foreground"><SearchX className="size-6" /></span>
          <p className="text-sm text-muted-foreground">Nothing matches “{query}”.</p>
          <Button variant="ghost" size="sm" onClick={() => setQuery("")}>Clear search</Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {visible.map((m) => {
            const b = brand(m.title);
            return (
              <article key={m.id} className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                <span className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", b.accent)} />
                <div className="flex flex-1 flex-col p-4 pt-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="inline-flex min-w-0 items-center gap-2.5">
                      <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", b.chip)}><b.Icon className="size-5" /></span>
                      <h4 className="truncate font-semibold text-foreground">{m.title}</h4>
                    </div>
                    {canManage && (
                      <div className="flex shrink-0 items-center opacity-0 transition-opacity group-hover:opacity-100">
                        <Button variant="ghost" size="icon" className="size-7" title="Edit" onClick={() => openEdit(m)}><Pencil className="size-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="size-7" title="Delete" onClick={() => remove(m)}><Trash2 className="size-3.5 text-destructive" /></Button>
                      </div>
                    )}
                  </div>
                  {m.details.trim() && (
                    <p className="mt-3 flex-1 whitespace-pre-wrap rounded-lg bg-muted/40 p-3 font-mono text-[13px] leading-relaxed text-muted-foreground">{m.details}</p>
                  )}
                </div>
                {m.details.trim() && (
                  <div className="border-t p-3">
                    <Button variant={copiedId === m.id ? "default" : "outline"} size="sm" className="w-full gap-1.5" onClick={() => copy(m)}>
                      {copiedId === m.id ? <><Check className="size-4" /> Copied</> : <><Copy className="size-4" /> Copy details</>}
                    </Button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {/* Add / edit dialog (super-admin) */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit payment method" : "New payment method"}</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-1.5">
              <Label>Title <span className="text-destructive">*</span></Label>
              <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Vodafone Cash, Bank Transfer, InstaPay" />
            </div>
            <div className="space-y-1.5">
              <Label>Details</Label>
              <Textarea rows={6} value={form.details} onChange={(e) => setForm((f) => ({ ...f, details: e.target.value }))} placeholder="Account number, holder name, instructions…" className="font-mono text-sm" />
              <p className="text-xs text-muted-foreground">Line breaks are preserved. This is copied as-is to send to the customer.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={save} disabled={saving || !form.title.trim()} className="gap-1.5">
              {saving && <Loader2 className="size-4 animate-spin" />}{editing ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {Confirmation}
    </div>
  );
}
