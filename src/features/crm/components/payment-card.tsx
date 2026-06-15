"use client";

import * as React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { CreditCard, ChevronDown, ChevronUp, Receipt } from "lucide-react";

import type { PaymentPlanSummary, PlanInstallmentStatus } from "@/lib/db/crm";
import { cn, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const PLAN_STATUS_STYLE: Record<
  PaymentPlanSummary["status"],
  string
> = {
  PARTIAL: "bg-warning/18 text-warning",
  PAID: "bg-success/15 text-success",
  PENDING: "bg-muted text-muted-foreground",
};

const INSTALLMENT_STATUS_STYLE: Record<PlanInstallmentStatus, string> = {
  PAID: "bg-success/15 text-success",
  UPCOMING: "bg-muted text-muted-foreground",
  DUE: "bg-warning/18 text-warning",
};

interface PaymentCardProps {
  plan: PaymentPlanSummary;
  pct: number;
  className?: string;
}

/** Sidebar payment summary with fee breakdown, progress, and installment cards. */
export function PaymentCard({ plan, pct, className }: PaymentCardProps) {
  const t = useTranslations("Crm");
  const tr = t as unknown as (k: string) => string;
  const [expanded, setExpanded] = React.useState(true);
  const outstanding = plan.totalAmount - plan.paid;

  return (
    <div
      className={cn(
        "rounded-xl border border-success/30 bg-success/[0.04] p-5 shadow-sm",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-success">
          <CreditCard className="size-4" />
          {t("paymentLabel")}
        </span>
        <Badge
          className={cn(
            "border-transparent text-[0.65rem] font-semibold uppercase tracking-wide",
            PLAN_STATUS_STYLE[plan.status],
          )}
        >
          {tr(`status${plan.status[0]}${plan.status.slice(1).toLowerCase()}`)}
        </Badge>
      </div>

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mt-4 flex w-full items-center justify-between gap-2 text-start"
      >
        <span className="font-semibold text-foreground">{plan.courseName}</span>
        {expanded ? (
          <ChevronUp className="size-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <>
          <dl className="mt-3 space-y-2 text-sm">
            <Row label={t("courseFee")} value={formatCurrency(plan.totalAmount, plan.currency)} />
            <Row
              label={t("paid")}
              value={formatCurrency(plan.paid, plan.currency)}
              valueClassName="font-semibold text-success"
            />
            <Row
              label={t("outstanding")}
              value={formatCurrency(outstanding, plan.currency)}
              valueClassName="font-semibold text-destructive"
            />
          </dl>

          <div className="mt-4 space-y-2">
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

          <ul className="mt-4 space-y-3">
            {plan.installments.map((ins) => (
              <li
                key={ins.index}
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-3",
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
                {ins.receiptUrl ? (
                  <div className="relative size-10 shrink-0 overflow-hidden rounded-md border bg-muted">
                    <Image
                      src={ins.receiptUrl}
                      alt=""
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : ins.status === "PAID" ? (
                  <span className="grid size-10 shrink-0 place-items-center rounded-md border bg-muted/60 text-muted-foreground">
                    <Receipt className="size-4" />
                  </span>
                ) : null}
                <Badge
                  className={cn(
                    "shrink-0 border-transparent text-[0.65rem] font-semibold uppercase tracking-wide",
                    INSTALLMENT_STATUS_STYLE[ins.status],
                  )}
                >
                  {tr(
                    `status${ins.status[0]}${ins.status.slice(1).toLowerCase()}`,
                  )}
                </Badge>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export function PaymentCardEmpty({ className }: { className?: string }) {
  const t = useTranslations("Crm");

  return (
    <div
      className={cn(
        "rounded-xl border border-dashed bg-muted/20 p-5 text-center",
        className,
      )}
    >
      <CreditCard className="mx-auto mb-2 size-8 text-muted-foreground/50" />
      <p className="text-sm text-muted-foreground">{t("noPaymentPlan")}</p>
      <Button variant="outline" size="sm" className="mt-3 gap-1.5">
        {t("addPaymentPlan")}
      </Button>
    </div>
  );
}

function Row({
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
