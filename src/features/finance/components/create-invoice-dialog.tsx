"use client";

import * as React from "react";
import { Loader2, CheckCircle2, FilePlus2 } from "lucide-react";
import { toast } from "sonner";

import { dal } from "@/lib/dal";
import type { Invoice } from "@/lib/db/finance";
import type { CreateInvoiceDto } from "@integration/services/invoices";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchableSelect } from "@/components/shared/searchable-select";
import { ImageUpload } from "@/components/shared/image-upload";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";

const CURRENCIES = ["EGP", "SAR", "USD"];
const METHODS = [
  { value: "bank_transfer", label: "Bank transfer" },
  { value: "vodafone_cash", label: "Vodafone Cash" },
  { value: "instapay", label: "InstaPay" },
  { value: "payment_link", label: "Payment link" },
  { value: "cash", label: "Cash" },
];

const today = () => new Date().toISOString().slice(0, 10);
const plusDays = (n: number) => new Date(Date.now() + n * 86_400_000).toISOString().slice(0, 10);
const num = (v: string) => { const n = Number(v); return Number.isFinite(n) && n >= 0 ? n : 0; };

type Form = {
  leadId: string; courseId: string; description: string; amount: string; currency: string;
  issueDate: string; dueDate: string; discount: string; taxPercent: string;
  paidOn: string; paymentMethod: string; paymentReceipt: string; notes: string;
};
const EMPTY: Form = {
  leadId: "", courseId: "", description: "", amount: "", currency: "EGP",
  issueDate: today(), dueDate: plusDays(14), discount: "0", taxPercent: "0",
  paidOn: today(), paymentMethod: "bank_transfer", paymentReceipt: "", notes: "",
};

export function CreateInvoiceDialog({
  open, onOpenChange, prepaid, onCreated,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  prepaid: boolean;
  onCreated: (inv: Invoice) => void;
}) {
  const [form, setForm] = React.useState<Form>(EMPTY);
  const [leads, setLeads] = React.useState<{ value: string; label: string }[]>([]);
  const [courses, setCourses] = React.useState<{ value: string; label: string }[]>([]);
  const [saving, setSaving] = React.useState(false);
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));
  const resetForm = React.useCallback(() => setForm({ ...EMPTY, issueDate: today(), dueDate: plusDays(14), paidOn: today() }), []);
  const close = () => { resetForm(); onOpenChange(false); };

  // Load the customer + course pickers once.
  React.useEffect(() => {
    let alive = true;
    (async () => {
      const [leadsRes, coursesRes] = await Promise.all([dal.crm.fetchLeads({}), dal.courses.fetchCourses({})]);
      if (!alive) return;
      if (leadsRes.ok) setLeads(leadsRes.data.map((l) => ({ value: l.id, label: `${l.fullName}${l.email ? ` · ${l.email}` : l.phone ? ` · ${l.phone}` : ""}` })));
      if (coursesRes.ok) setCourses(coursesRes.data.map((c) => ({ value: c.id, label: c.titleEn || c.titleAr || "Course" })));
    })();
    return () => { alive = false; };
  }, []);

  const subtotal = num(form.amount);
  const discount = num(form.discount);
  const taxAmount = Math.round(subtotal * (num(form.taxPercent) / 100) * 100) / 100;
  const totalDue = Math.max(0, subtotal - discount + taxAmount);

  const submit = async () => {
    if (!form.leadId) { toast.error("Select a customer"); return; }
    if (subtotal <= 0) { toast.error("Enter an amount"); return; }
    const courseLabel = courses.find((c) => c.value === form.courseId)?.label;
    const input: CreateInvoiceDto = {
      leadId: form.leadId,
      issueDate: form.issueDate,
      dueDate: form.dueDate,
      currency: form.currency,
      discount,
      taxPercent: num(form.taxPercent),
      subtotal,
      totalDue,
      coursicesIds: form.courseId ? [form.courseId] : undefined,
      lineItems: [{ description: form.description.trim() || courseLabel || "Invoice", qty: 1, unitPrice: subtotal }],
      status: prepaid ? "paid" : "sent",
      notes: form.notes.trim() || undefined,
      ...(prepaid ? { paidOn: form.paidOn, paymentMethod: form.paymentMethod, paymentReceipt: form.paymentReceipt || undefined } : {}),
    };
    setSaving(true);
    const res = await dal.finance.createInvoice(input);
    setSaving(false);
    if (res.ok) {
      toast.success(prepaid ? "Prepaid invoice created" : "Invoice created");
      onCreated(res.data);
      close();
    } else toast.error(res.error);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) close(); }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {prepaid ? <CheckCircle2 className="size-5 text-success" /> : <FilePlus2 className="size-5" />}
            {prepaid ? "New prepaid invoice" : "New invoice"}
          </DialogTitle>
          <DialogDescription>
            {prepaid ? "Records an invoice that is already paid (marked paid with a receipt)." : "Creates a regular (unpaid) invoice the customer can pay."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Field label="Customer" required>
            <SearchableSelect value={form.leadId} onChange={(v) => set("leadId", v)} options={leads} placeholder="Search customers…" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Course (optional)">
              <SearchableSelect value={form.courseId} onChange={(v) => set("courseId", v)} options={courses} placeholder="Select course…" />
            </Field>
            <Field label="Description">
              <Input value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="e.g. Course registration fee" />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Amount" required>
              <Input type="number" min={0} value={form.amount} onChange={(e) => set("amount", e.target.value)} className="tabular-nums" />
            </Field>
            <Field label="Currency">
              <Select value={form.currency} onValueChange={(v) => set("currency", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Discount">
              <Input type="number" min={0} value={form.discount} onChange={(e) => set("discount", e.target.value)} className="tabular-nums" />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Tax %">
              <Input type="number" min={0} value={form.taxPercent} onChange={(e) => set("taxPercent", e.target.value)} className="tabular-nums" />
            </Field>
            <Field label="Issue date">
              <Input type="date" value={form.issueDate} onChange={(e) => set("issueDate", e.target.value)} />
            </Field>
            <Field label="Due date">
              <Input type="date" value={form.dueDate} onChange={(e) => set("dueDate", e.target.value)} />
            </Field>
          </div>

          {prepaid && (
            <div className="space-y-4 rounded-lg border border-success/30 bg-success/5 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-success">Paid details</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Paid on"><Input type="date" value={form.paidOn} onChange={(e) => set("paidOn", e.target.value)} /></Field>
                <Field label="Payment method">
                  <Select value={form.paymentMethod} onValueChange={(v) => set("paymentMethod", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{METHODS.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
              </div>
              <Field label="Receipt (optional)">
                <ImageUpload value={form.paymentReceipt} onChange={(url) => set("paymentReceipt", url)} hint="Upload the payment receipt image" />
              </Field>
            </div>
          )}

          <Field label="Notes (optional)">
            <Textarea rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
          </Field>

          <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2 text-sm">
            <span className="text-muted-foreground">Total due</span>
            <span className="font-heading text-base font-bold tabular-nums">{form.currency} {totalDue.toLocaleString()}</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={close}>Cancel</Button>
          <Button onClick={submit} disabled={saving} className="gap-1.5">
            {saving ? <Loader2 className="size-4 animate-spin" /> : null}{prepaid ? "Create prepaid invoice" : "Create invoice"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
