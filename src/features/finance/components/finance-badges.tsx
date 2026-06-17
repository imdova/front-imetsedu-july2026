"use client";

import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const INVOICE: Record<string, { key: string; style: string }> = {
  paid: { key: "statusPaid", style: "bg-success/15 text-success" },
  pending: { key: "statusPending", style: "bg-warning/18 text-warning" },
  partial: { key: "statusPartial", style: "bg-warning/18 text-warning" },
  sent: { key: "statusSent", style: "bg-chart-3/15 text-chart-3" },
  overdue: { key: "statusOverdue", style: "bg-destructive/12 text-destructive" },
  draft: { key: "statusDraft", style: "bg-muted text-muted-foreground" },
};
const PAYMENT: Record<string, { key: string; style: string }> = {
  completed: { key: "statusCompleted", style: "bg-success/15 text-success" },
  pending: { key: "statusPending", style: "bg-warning/18 text-warning" },
};
const REFUND: Record<string, { key: string; style: string }> = {
  requested: { key: "statusRequested", style: "bg-muted text-muted-foreground" },
  approved: { key: "statusApproved", style: "bg-chart-3/15 text-chart-3" },
  processed: { key: "statusProcessed", style: "bg-success/15 text-success" },
  rejected: { key: "statusRejected", style: "bg-destructive/12 text-destructive" },
};
const INSTALLMENT: Record<string, { key: string; style: string }> = {
  PAID: { key: "instPaid", style: "bg-success/15 text-success" },
  DUE: { key: "instDue", style: "bg-warning/18 text-warning" },
  SCHEDULED: { key: "instScheduled", style: "bg-muted text-muted-foreground" },
};

function make(map: Record<string, { key: string; style: string }>) {
  return function StatusBadge({ value }: { value: string }) {
    const t = useTranslations("Finance") as unknown as (k: string) => string;
    const cfg = map[value] ?? { key: value, style: "bg-muted text-muted-foreground" };
    return <Badge className={cn("border-transparent", cfg.style)}>{t(cfg.key)}</Badge>;
  };
}

export const InvoiceStatusBadge = make(INVOICE);
export const PaymentStatusBadge = make(PAYMENT);
export const RefundStatusBadge = make(REFUND);
export const InstallmentStatusBadge = make(INSTALLMENT);
