"use client";

import { useState } from "react";
import {
  CreditCard, AlertCircle, Info, Clock, Check, Download, ChevronDown, ChevronUp,
} from "lucide-react";
import { toast } from "sonner";

/* ─── Shared types (exported so page.tsx can import) ─────────── */

export type RoadmapItemStatus = "paid" | "overdue" | "due" | "upcoming";

export interface RoadmapItem {
  id: string;
  title: string;
  dateLabel: string;
  amount: string;
  status: RoadmapItemStatus;
  receiptAvailable?: boolean;
  receiptFileName?: string;
  receiptUrl?: string;
}

export interface ProcessedPlan {
  courseName: string;
  courseImage: string | null;
  currencySymbol: string;
  totalFeeNum: number;
  totalFee: string;
  totalPaidNum: number;
  totalPaid: string;
  totalRemainingNum: number;
  totalRemaining: string;
  percentComplete: number;
  paymentMethod: string | null;
  roadmap: RoadmapItem[];
  status: string;
}

export interface InstallmentsPageData {
  plans: ProcessedPlan[];
  summaryCurrencySymbol: string;
  grandTotalFee: string;
  grandTotalPaid: string;
  grandTotalRemaining: string;
  grandPercent: number;
  nextInstallment: { title: string; dueDate: string; amount: string };
  overdueReminder: { show: boolean; description: string };
}

/* ─── PlanSection (collapsible) ─────────────────────────────── */

function PlanSection({
  plan,
  planIndex,
  totalPlans,
}: {
  plan: ProcessedPlan;
  planIndex: number;
  totalPlans: number;
}) {
  const [open, setOpen] = useState(true);

  const statusStyle =
    plan.status === "PAID"
      ? "text-emerald-700 bg-emerald-50"
      : plan.status === "PARTIAL"
        ? "text-orange-700 bg-orange-50"
        : "text-muted-foreground bg-muted";

  return (
    <section className="overflow-hidden rounded-2xl border bg-card shadow-xs">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full cursor-pointer items-start justify-between gap-4 border-0 bg-card p-5 text-left transition-colors hover:bg-muted/20"
        aria-expanded={open}
      >
        <div className="flex min-w-0 flex-1 items-start gap-3">
          {plan.courseImage && (
            <img
              src={plan.courseImage}
              alt={plan.courseName}
              className="size-12 shrink-0 rounded-lg border object-cover"
            />
          )}
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              {totalPlans > 1 && (
                <span className="text-xs font-semibold text-muted-foreground">Plan {planIndex + 1}</span>
              )}
              <h2 className="m-0 text-base font-bold">{plan.courseName}</h2>
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusStyle}`}>
                {plan.status}
              </span>
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span>Total: <strong className="text-foreground">{plan.currencySymbol}{plan.totalFee}</strong></span>
              <span>Paid: <strong className="text-emerald-600">{plan.currencySymbol}{plan.totalPaid}</strong></span>
              <span>Remaining: <strong className="text-foreground">{plan.currencySymbol}{plan.totalRemaining}</strong></span>
              {plan.paymentMethod && <span>Via: <strong className="text-foreground">{plan.paymentMethod}</strong></span>}
            </div>
          </div>
        </div>
        <div className="mt-0.5 flex shrink-0 items-center gap-3">
          <div className="hidden items-center gap-2 sm:flex">
            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${plan.percentComplete}%` }} />
            </div>
            <span className="text-xs font-semibold text-emerald-600">{plan.percentComplete}%</span>
          </div>
          <span className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            {open ? <ChevronUp className="size-4" strokeWidth={2} /> : <ChevronDown className="size-4" strokeWidth={2} />}
          </span>
        </div>
      </button>

      {open && (
        <div className="relative border-t px-5 pb-5 pt-4">
          {/* Vertical timeline line */}
          <div className="absolute bottom-6 left-[2.6rem] top-14 w-0.5 rounded-sm bg-border" />
          <div className="flex flex-col gap-0">
            {plan.roadmap.map((item) => (
              <RoadmapItemRow key={item.id} item={item} currencySymbol={plan.currencySymbol} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

/* ─── RoadmapItemRow ─────────────────────────────────────────── */

function RoadmapItemRow({ item, currencySymbol }: { item: RoadmapItem; currencySymbol: string }) {
  const isPaid = item.status === "paid";
  const isOverdue = item.status === "overdue";
  const isDue = item.status === "due";
  const isUpcoming = item.status === "upcoming";

  return (
    <div className="relative z-10 flex gap-4 border-b py-5 last:border-b-0 last:pb-0">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full">
        {isPaid && (
          <Check className="size-5 rounded-full bg-emerald-50 p-1 text-emerald-600" strokeWidth={2} />
        )}
        {isOverdue && (
          <AlertCircle className="size-5 rounded-full bg-destructive/10 p-1 text-destructive" strokeWidth={2} />
        )}
        {(isDue || isUpcoming) && (
          <Clock
            className={`size-5 rounded-full p-1 ${
              isDue ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            }`}
            strokeWidth={2}
          />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-start justify-between gap-3">
          <h4 className={`m-0 text-sm font-semibold ${isOverdue ? "text-destructive" : ""}`}>{item.title}</h4>
          <span className="text-sm font-semibold">{currencySymbol}{item.amount}</span>
        </div>
        <p className={`m-0 mb-3 text-xs ${isOverdue ? "text-destructive" : "text-muted-foreground"}`}>
          {item.dateLabel}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {isPaid && (
            <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
              Paid
            </span>
          )}
          {isPaid && item.receiptAvailable && (
            item.receiptUrl ? (
              <a
                href={item.receiptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border bg-card px-3.5 py-2 text-xs font-semibold text-muted-foreground no-underline transition-colors hover:border-primary/30 hover:bg-muted/20 hover:text-primary"
              >
                <Download className="size-3.5" strokeWidth={2} />
                View receipt
              </a>
            ) : (
              <button
                type="button"
                onClick={() => toast.success(`Downloading ${item.receiptFileName ?? "receipt"}…`)}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border bg-card px-3.5 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/30 hover:bg-muted/20 hover:text-primary"
              >
                <Download className="size-3.5" strokeWidth={2} />
                Download receipt
              </button>
            )
          )}
          {isDue && (
            <button
              type="button"
              className="inline-flex cursor-pointer items-center rounded-lg border bg-card px-4 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted/20"
            >
              Request Extension
            </button>
          )}
          {isUpcoming && (
            <span className="rounded-full bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground">
              Upcoming
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── KPI card ───────────────────────────────────────────────── */

function KpiCard({
  label,
  value,
  sub,
  subNode,
}: {
  label: string;
  value: string;
  sub?: string;
  subNode?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-xs">
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <p className="mb-1.5 text-2xl font-bold leading-none">{value}</p>
      {subNode ?? (sub && <p className="text-xs text-muted-foreground">{sub}</p>)}
    </div>
  );
}

/* ─── Main export ────────────────────────────────────────────── */

export function InstallmentsView({ data }: { data: InstallmentsPageData | null }) {
  if (!data) {
    return (
      <div className="flex min-h-75 flex-col items-center justify-center rounded-2xl border bg-card p-8 text-center shadow-xs">
        <Info className="mb-3 size-12 text-muted-foreground" />
        <h3 className="mb-1 text-base font-bold">No Payment Plan Assigned</h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          There is currently no active payment plan linked to your student account. Please contact
          student success or admissions.
        </p>
      </div>
    );
  }

  const { plans, summaryCurrencySymbol, grandTotalFee, grandTotalPaid, grandTotalRemaining, grandPercent, nextInstallment, overdueReminder } = data;

  return (
    <div className="space-y-6">
      {/* Overdue reminder */}
      {overdueReminder.show && (
        <div className="flex flex-col gap-4 rounded-xl border border-destructive/30 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:px-5">
          <AlertCircle className="shrink-0 text-destructive" strokeWidth={2} />
          <div className="min-w-0 flex-1">
            <h2 className="mb-1.5 text-base font-bold leading-snug text-destructive">Overdue Payment Reminder</h2>
            <p className="text-sm leading-relaxed">{overdueReminder.description}</p>
          </div>
        </div>
      )}

      {/* KPI summary grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Total Fee"
          value={`${summaryCurrencySymbol}${grandTotalFee}`}
          subNode={
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Info className="size-4 shrink-0" strokeWidth={2} />
              Across {plans.length} plan{plans.length !== 1 ? "s" : ""}
            </p>
          }
        />
        <KpiCard
          label="Total Paid"
          value={`${summaryCurrencySymbol}${grandTotalPaid}`}
          subNode={
            <div className="mt-2.5 flex items-center gap-3">
              <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${grandPercent}%` }} />
              </div>
              <p className="shrink-0 text-sm font-semibold text-emerald-600">{grandPercent}% Complete</p>
            </div>
          }
        />
        <KpiCard
          label="Total Remaining"
          value={`${summaryCurrencySymbol}${grandTotalRemaining}`}
          sub="Amount left to pay"
        />
        <KpiCard
          label="Next Installment"
          value={`${summaryCurrencySymbol}${nextInstallment.amount}`}
          subNode={
            nextInstallment.dueDate !== "N/A" ? (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="size-4 shrink-0 text-orange-500" strokeWidth={2} />
                {nextInstallment.title} due {nextInstallment.dueDate}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">No unpaid installments</p>
            )
          }
        />
      </div>

      {/* One collapsible section per plan */}
      <div className="flex flex-col gap-6">
        {plans.map((plan, idx) => (
          <PlanSection key={idx} plan={plan} planIndex={idx} totalPlans={plans.length} />
        ))}
      </div>

      {/* Footer */}
      <footer className="mt-8 border-t pt-6 text-center text-xs text-muted-foreground">
        <p>© 2024 IMETS Academy. All student financial records are encrypted and secure.</p>
      </footer>
    </div>
  );
}
