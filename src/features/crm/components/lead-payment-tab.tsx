"use client";

import * as React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { CreditCard, ChevronDown, ChevronUp, Plus, Receipt, Loader2, Pencil, Trash2, Upload, ExternalLink } from "lucide-react";
import { toast } from "sonner";

import type { Lead, PaymentPlanSummary, PlanInstallmentStatus } from "@/lib/db/crm";
import { dal } from "@/lib/dal";
import { cn, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useResetOnChange } from "@/hooks/use-reset-on-change";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PLAN_STATUS_STYLE: Record<PaymentPlanSummary["status"], string> = {
  PARTIAL: "bg-warning/18 text-warning",
  PAID: "bg-success/15 text-success",
  PENDING: "bg-muted text-muted-foreground",
};

const INSTALLMENT_STATUS_STYLE: Record<PlanInstallmentStatus, string> = {
  PAID: "bg-success/15 text-success",
  UPCOMING: "bg-muted text-muted-foreground",
  DUE: "bg-warning/18 text-warning",
};

const PAYMENT_METHODS = ["Vodafone Cash", "Bank transfer", "Card", "Fawry", "Cash"];

interface LeadPaymentTabProps {
  leadName: string;
  leadId: string;
  plans: PaymentPlanSummary[];
  onUpdated?: (lead: Lead) => void;
  courseOptions?: { value: string; label: string; image?: string }[];
}

export function LeadPaymentTab({ leadName, leadId, plans, onUpdated, courseOptions = [] }: LeadPaymentTabProps) {
  const t = useTranslations("Crm");
  const [modal, setModal] = React.useState<{ open: boolean; plan?: PaymentPlanSummary; index?: number }>({ open: false });
  const [deleting, setDeleting] = React.useState<number | null>(null);

  const onDelete = async (i: number) => {
    setDeleting(i);
    const res = await dal.crm.deletePaymentPlan(leadId, i);
    setDeleting(null);
    if (res.ok && res.data) { toast.success(t("ppDeleted")); onUpdated?.(res.data); }
    else if (!res.ok) toast.error(res.error);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="font-heading text-xl font-bold tracking-tight">
            {t("paymentTabTitle", { name: leadName })}
          </h2>
          <p className="text-sm text-muted-foreground">{t("paymentTabSubtitle")}</p>
        </div>
        <Button className="gap-1.5" onClick={() => setModal({ open: true })}>
          <Plus className="size-4" />
          {t("addPaymentPlan")}
        </Button>
      </div>

      {plans.length ? (
        <div className="space-y-8">
          {plans.map((p, i) => {
            const pct = p.totalAmount ? Math.round((p.paid / p.totalAmount) * 100) : 0;
            const courseImage = courseOptions.find((c) => c.label === p.courseName)?.image;
            return (
              <div key={i} className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
                  <p className="flex min-w-0 items-center gap-2 font-heading text-base font-semibold">
                    {courseImage && (
                      <span className="relative size-8 shrink-0 overflow-hidden rounded-md border bg-muted">
                        <Image src={courseImage} alt="" fill className="object-cover" />
                      </span>
                    )}
                    {plans.length > 1 && <span className="text-muted-foreground">{t("ppPlanN", { n: i + 1 })} · </span>}
                    {p.courseName}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setModal({ open: true, plan: p, index: i })}>
                      <Pencil className="size-3.5" />{t("ppEditPlan")}
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1.5 text-destructive hover:text-destructive" disabled={deleting === i} onClick={() => onDelete(i)}>
                      {deleting === i ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}{t("ppDelete")}
                    </Button>
                  </div>
                </div>
                <div className="grid gap-6 lg:grid-cols-[1fr_340px] lg:items-start">
                  <PaymentPlanPanel plan={p} pct={pct} leadId={leadId} planIndex={i} onUpdated={onUpdated} />
                  <div className="space-y-6">
                    <InstallmentRoadmap plan={p} />
                    <PlanSummaryCard plan={p} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed py-16 text-center">
          <p className="text-muted-foreground">{t("noPaymentPlan")}</p>
          <Button variant="outline" className="mt-4 gap-1.5" onClick={() => setModal({ open: true })}>
            <Plus className="size-4" />{t("addPaymentPlan")}
          </Button>
        </div>
      )}

      <PaymentPlanModal
        open={modal.open}
        onOpenChange={(o) => setModal((m) => ({ ...m, open: o }))}
        leadId={leadId}
        existing={modal.plan}
        index={modal.index}
        onSaved={(lead) => { onUpdated?.(lead); setModal({ open: false }); }}
        courseOptions={courseOptions}
      />
    </div>
  );
}

function PaymentPlanPanel({
  plan,
  pct,
  leadId,
  planIndex,
  onUpdated,
}: {
  plan: PaymentPlanSummary;
  pct: number;
  leadId: string;
  planIndex: number;
  onUpdated?: (lead: Lead) => void;
}) {
  const t = useTranslations("Crm");
  const tr = t as unknown as (k: string) => string;
  const [expanded, setExpanded] = React.useState(true);
  const [uploading, setUploading] = React.useState<number | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const pendingInstallRef = React.useRef<number | null>(null);
  const outstanding = plan.totalAmount - plan.paid;

  const handleUploadReceipt = (installmentIndex: number) => {
    pendingInstallRef.current = installmentIndex;
    fileInputRef.current?.click();
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    const instIdx = pendingInstallRef.current;
    if (!file || instIdx === null) return;
    setUploading(instIdx);
    try {
      const up = await dal.upload.uploadFile(file);
      if (!up.ok) { toast.error(up.error); return; }
      const res = await dal.crm.markInstallmentPaid(leadId, planIndex, instIdx, {
        url: up.data.url,
        name: file.name,
        size: file.size,
        type: file.type,
      });
      if (res.ok && res.data) {
        toast.success(tr("installmentMarkedPaid"));
        onUpdated?.(res.data);
      } else if (!res.ok) {
        toast.error(res.error);
      }
    } finally {
      setUploading(null);
      pendingInstallRef.current = null;
    }
  };

  return (
    <div className="rounded-xl border border-success/30 bg-success/[0.04] p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-success">
          <CreditCard className="size-4" />
          {t("paymentLabel")}
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            className={cn(
              "border-transparent text-[0.65rem] font-semibold uppercase tracking-wide",
              PLAN_STATUS_STYLE[plan.status],
            )}
          >
            {tr(`status${plan.status[0]}${plan.status.slice(1).toLowerCase()}`)}
          </Badge>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mt-5 flex w-full items-center justify-between gap-2 text-start"
      >
        <span className="text-base font-semibold">{plan.courseName}</span>
        {expanded ? (
          <ChevronUp className="size-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <>
          <dl className="mt-4 space-y-2.5 text-sm">
            <FeeRow label={t("courseFee")} value={formatCurrency(plan.totalAmount, plan.currency)} />
            <FeeRow
              label={t("paid")}
              value={formatCurrency(plan.paid, plan.currency)}
              valueClassName="font-semibold text-success"
            />
            <FeeRow
              label={t("outstanding")}
              value={formatCurrency(outstanding, plan.currency)}
              valueClassName="font-semibold text-destructive"
            />
          </dl>

          <div className="mt-5 space-y-2">
            <p className="text-sm font-semibold">{plan.courseName}</p>
            <div className="flex items-center gap-3">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-success transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="shrink-0 text-xs font-medium text-success tabular-nums">
                {t("pctPaid", { pct })}
              </span>
            </div>
          </div>

          {/* hidden file input shared across all installments */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFileChange}
          />

          <ul className="mt-5 space-y-3">
            {plan.installments.map((ins) => (
              <li
                key={ins.index}
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-3.5",
                  ins.status === "PAID"
                    ? "border-success/35 bg-success/[0.06]"
                    : "border-border bg-card",
                )}
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-lg border bg-muted/50 text-xs font-medium tabular-nums text-muted-foreground">
                  {ins.index}/{plan.installments.length}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold tabular-nums">
                    {formatCurrency(ins.amount, plan.currency)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {installmentMeta(ins.status, ins.dueDate, tr)}
                  </p>
                </div>

                {/* Receipt preview or upload button */}
                {ins.receiptUrl ? (
                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      onClick={() => window.open(ins.receiptUrl!, "_blank")}
                      className="group relative size-11 overflow-hidden rounded-md border bg-muted"
                      title="View receipt"
                    >
                      <Image src={ins.receiptUrl} alt="receipt" fill className="object-cover" />
                      <span className="absolute inset-0 hidden items-center justify-center rounded-md bg-black/40 group-hover:flex">
                        <ExternalLink className="size-4 text-white" />
                      </span>
                    </button>
                    <button
                      onClick={() => handleUploadReceipt(ins.index)}
                      disabled={uploading === ins.index}
                      className="grid size-7 shrink-0 place-items-center rounded-md border bg-muted/60 text-muted-foreground hover:bg-muted transition-colors"
                      title="Replace receipt"
                    >
                      {uploading === ins.index ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleUploadReceipt(ins.index)}
                    disabled={uploading === ins.index}
                    className={cn(
                      "flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors",
                      "border-dashed border-muted-foreground/40 text-muted-foreground hover:border-primary hover:text-primary",
                    )}
                    title="Upload receipt"
                  >
                    {uploading === ins.index
                      ? <Loader2 className="size-3.5 animate-spin" />
                      : <Upload className="size-3.5" />}
                    <span>{tr("uploadReceipt")}</span>
                  </button>
                )}

                <Badge
                  className={cn(
                    "shrink-0 border-transparent text-[0.65rem] font-semibold uppercase tracking-wide",
                    INSTALLMENT_STATUS_STYLE[ins.status],
                  )}
                >
                  {tr(`status${ins.status[0]}${ins.status.slice(1).toLowerCase()}`)}
                </Badge>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function InstallmentRoadmap({ plan }: { plan: PaymentPlanSummary }) {
  const t = useTranslations("Crm");
  const tr = t as unknown as (k: string) => string;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t("installmentRoadmap")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-0">
        <ol className="relative space-y-6 ps-1">
          {plan.installments.map((ins, i) => {
            const last = i === plan.installments.length - 1;
            return (
              <li key={ins.index} className="relative flex gap-3 ps-4">
                {!last && (
                  <span
                    className="absolute start-[7px] top-4 h-[calc(100%+12px)] w-px bg-border"
                    aria-hidden
                  />
                )}
                <span
                  className={cn(
                    "relative z-10 mt-1 size-3.5 shrink-0 rounded-full",
                    ins.status === "PAID"
                      ? "bg-success ring-4 ring-success/15"
                      : "border-2 border-muted-foreground/35 bg-background",
                  )}
                />
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold">{ins.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {roadmapDate(ins.status, ins.dueDate, tr)}
                      </p>
                      <p className="mt-1 text-sm font-medium tabular-nums">
                        {formatCurrency(ins.amount, plan.currency)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {ins.receiptUrl && (
                        <div className="relative size-10 overflow-hidden rounded-md border bg-muted">
                          <Image
                            src={ins.receiptUrl}
                            alt=""
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <Badge
                        className={cn(
                          "border-transparent text-[0.65rem] font-semibold uppercase",
                          INSTALLMENT_STATUS_STYLE[ins.status],
                        )}
                      >
                        {tr(
                          `status${ins.status[0]}${ins.status.slice(1).toLowerCase()}`,
                        )}
                      </Badge>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}

function PlanSummaryCard({ plan }: { plan: PaymentPlanSummary }) {
  const t = useTranslations("Crm");
  const months = plan.durationMonths ?? 1;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t("planSummary")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t("planDuration")}
          </p>
          <p className="text-sm font-medium">{t("planDurationMonths", { count: months })}</p>
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t("paymentMethod")}
          </p>
          <Select defaultValue={plan.method ?? "Vodafone Cash"}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_METHODS.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}

function FeeRow({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={cn("tabular-nums", valueClassName)}>{value}</dd>
    </div>
  );
}

function installmentMeta(
  status: PlanInstallmentStatus,
  dueDate: string,
  tr: (k: string) => string,
) {
  const prefix =
    status === "PAID"
      ? tr("statusPaid")
      : status === "UPCOMING"
        ? tr("installmentScheduled")
        : tr("statusDue");
  return `${prefix} · ${dueDate}`;
}

function roadmapDate(
  status: PlanInstallmentStatus,
  dueDate: string,
  tr: (k: string) => string,
) {
  const prefix =
    status === "PAID"
      ? tr("statusPaid")
      : status === "UPCOMING"
        ? tr("installmentScheduled")
        : tr("statusDue");
  return `${prefix} ${dueDate}`;
}

/* ───────────────────────── Create / edit payment plan ───────────────────────── */
type Currency = PaymentPlanSummary["currency"];
type Row = { amount: string; dueDate: string };

/** Build N monthly due dates (today + i months) as YYYY-MM-DD. */
function defaultDueDates(n: number): string[] {
  const base = new Date();
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(base.getFullYear(), base.getMonth() + i, base.getDate());
    return d.toISOString().slice(0, 10);
  });
}

function PaymentPlanModal({
  open, onOpenChange, leadId, existing, index, onSaved, courseOptions = [],
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  leadId: string;
  existing?: PaymentPlanSummary;
  /** Index of the plan being edited; omit to append a new plan. */
  index?: number;
  onSaved: (lead: Lead) => void;
  courseOptions?: { value: string; label: string; image?: string }[];
}) {
  const t = useTranslations("Crm");
  const [courseName, setCourseName] = React.useState("");
  const [currency, setCurrency] = React.useState<Currency>("EGP");
  const [method, setMethod] = React.useState(PAYMENT_METHODS[0]);
  const [total, setTotal] = React.useState("");
  const [rows, setRows] = React.useState<Row[]>([{ amount: "", dueDate: defaultDueDates(1)[0] }]);
  const [saving, setSaving] = React.useState(false);

  // Seed the form each time the modal opens (edit = prefill from existing plan).
  useResetOnChange([open, existing], () => {
    if (!open) return;
    if (existing) {
      setCourseName(existing.courseName ?? "");
      setCurrency(existing.currency);
      setMethod(existing.method ?? PAYMENT_METHODS[0]);
      setTotal(String(existing.totalAmount ?? ""));
      setRows(existing.installments.length
        ? existing.installments.map((it) => ({ amount: String(it.amount), dueDate: toISODate(it.dueDateISO ?? it.dueDate) }))
        : [{ amount: "", dueDate: defaultDueDates(1)[0] }]);
    } else {
      setCourseName(""); setCurrency("EGP"); setMethod(PAYMENT_METHODS[0]);
      setTotal(""); setRows([{ amount: "", dueDate: defaultDueDates(1)[0] }]);
    }
  });

  // Re-split the total evenly across the chosen installment count.
  const setCount = (n: number) => {
    const count = Math.max(1, Math.min(12, n));
    const dates = defaultDueDates(count);
    const totalNum = Number(total) || 0;
    const per = totalNum ? Math.floor((totalNum / count) * 100) / 100 : 0;
    setRows(Array.from({ length: count }, (_, i) => ({
      amount: totalNum ? String(i === count - 1 ? +(totalNum - per * (count - 1)).toFixed(2) : per) : (rows[i]?.amount ?? ""),
      dueDate: rows[i]?.dueDate ?? dates[i],
    })));
  };

  const setRow = (i: number, key: keyof Row, value: string) =>
    setRows((p) => p.map((r, k) => (k === i ? { ...r, [key]: value } : r)));

  const sum = rows.reduce((s, r) => s + (Number(r.amount) || 0), 0);

  const submit = async () => {
    const totalNum = Number(total) || sum;
    if (totalNum <= 0) { toast.error(t("ppTotalRequired")); return; }
    if (rows.some((r) => !r.amount || !r.dueDate)) { toast.error(t("ppRowsRequired")); return; }
    setSaving(true);
    const n = rows.length;
    const plan = {
      courseName: courseName.trim() || undefined,
      totalAmount: totalNum,
      currency,
      status: "PENDING",
      paymentMethod: method,
      createdAt: new Date().toISOString(),
      installments: rows.map((r, i) => ({
        index: i + 1,
        total: n,
        label: i === 0 ? "First installment" : `Installment ${i + 1}`,
        amount: Number(r.amount),
        dueDate: r.dueDate,
        status: "SCHEDULED",
      })),
    };
    const res = await dal.crm.savePaymentPlan(leadId, plan, index);
    setSaving(false);
    if (res.ok && res.data) {
      toast.success(existing ? t("ppUpdated") : t("ppCreated"));
      onSaved(res.data);
    } else if (!res.ok) {
      toast.error(res.error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{existing ? t("ppEditPlan") : t("addPaymentPlan")}</DialogTitle>
          <DialogDescription>{t("ppModalHint")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>{t("ppCourse")}</Label>
            {courseOptions.length > 0 ? (
              <Select value={courseName || undefined} onValueChange={setCourseName}>
                <SelectTrigger><SelectValue placeholder={t("ppCoursePh")} /></SelectTrigger>
                <SelectContent>
                  {/* Seed an entry for an existing name that isn't in the current course list. */}
                  {courseName && !courseOptions.some((c) => c.label === courseName) ? (
                    <SelectItem value={courseName}>{courseName}</SelectItem>
                  ) : null}
                  {courseOptions.map((c) => (
                    <SelectItem key={c.value} value={c.label}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input value={courseName} onChange={(e) => setCourseName(e.target.value)} placeholder={t("ppCoursePh")} />
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>{t("ppTotal")}</Label>
              <Input type="number" min={0} value={total} onChange={(e) => setTotal(e.target.value)} placeholder="0" />
            </div>
            <div className="space-y-1.5">
              <Label>{t("ppCurrency")}</Label>
              <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(["EGP", "SAR", "USD"] as Currency[]).map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>{t("ppMethod")}</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t("ppInstallments")}</Label>
              <Select value={String(rows.length)} onValueChange={(v) => setCount(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>{t("ppSchedule")}</Label>
              <span className={cn("text-xs tabular-nums", Math.abs(sum - (Number(total) || sum)) < 0.01 ? "text-muted-foreground" : "text-warning")}>
                {t("ppSumLabel", { sum: formatCurrency(sum, currency) })}
              </span>
            </div>
            {rows.map((r, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-xs font-medium tabular-nums text-muted-foreground">{i + 1}</span>
                <Input type="number" min={0} value={r.amount} onChange={(e) => setRow(i, "amount", e.target.value)} placeholder={t("ppAmount")} className="flex-1" />
                <Input type="date" value={r.dueDate} onChange={(e) => setRow(i, "dueDate", e.target.value)} className="w-40" />
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>{t("ppCancel")}</Button>
          <Button onClick={submit} disabled={saving} className="gap-1.5">
            {saving && <Loader2 className="size-4 animate-spin" />}
            {existing ? t("ppSave") : t("ppCreate")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Coerce a display date ("Due · 1 Apr 2026" or ISO) back to a YYYY-MM-DD input value. */
function toISODate(s: string): string {
  if (!s) return defaultDueDates(1)[0];
  const iso = s.match(/\d{4}-\d{2}-\d{2}/);
  if (iso) return iso[0];
  const d = new Date(s.replace(/^[^0-9]*/, ""));
  return Number.isNaN(d.getTime()) ? defaultDueDates(1)[0] : d.toISOString().slice(0, 10);
}
