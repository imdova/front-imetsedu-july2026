"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { ChevronRight, CheckCircle2, Eye, Receipt, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { downloadInvoicePdf } from "@integration/services/invoices";
import { useRouter } from "@/i18n/navigation";
import type { Invoice, Currency } from "@/lib/db/finance";
import { cn, formatCurrency, getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InvoiceStatusBadge } from "./finance-badges";
import { MarkAsPaidModal, type Receipt as ReceiptType } from "./mark-as-paid-modal";

// ─── Types ────────────────────────────────────────────────────────────────────

type LeadGroup = {
  key: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  group?: string;
  currency: Currency;
  installments: Invoice[];
  totalAmount: number;
  paidAmount: number;
  paidCount: number;
};

// ─── Grouping helper ──────────────────────────────────────────────────────────

function groupByLead(rows: Invoice[]): LeadGroup[] {
  const map = new Map<string, LeadGroup>();

  for (const inv of rows) {
    const key = inv.studentId || `_${inv.studentName}`;
    if (!map.has(key)) {
      map.set(key, {
        key,
        studentId: inv.studentId ?? "",
        studentName: inv.studentName,
        studentEmail: inv.studentEmail,
        group: inv.group,
        currency: inv.currency,
        installments: [],
        totalAmount: 0,
        paidAmount: 0,
        paidCount: 0,
      });
    }
    const g = map.get(key)!;
    g.installments.push(inv);
    g.totalAmount += inv.amount;
    if (inv.status === "paid") {
      g.paidAmount += inv.amount;
      g.paidCount += 1;
    }
  }

  for (const g of map.values()) {
    // Sort: plan index first, then installment index
    g.installments.sort(
      (a, b) =>
        (a.paymentPlanIndex ?? 0) * 1000 +
        (a.installmentIndex ?? 0) -
        ((b.paymentPlanIndex ?? 0) * 1000 + (b.installmentIndex ?? 0)),
    );
  }

  return Array.from(map.values());
}

// ─── Main component ───────────────────────────────────────────────────────────

export function InvoicesTable({
  initialData,
  basePath,
}: {
  initialData: Invoice[];
  basePath: string;
}) {
  const [rows, setRows] = React.useState<Invoice[]>(initialData);
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());
  const [markTarget, setMarkTarget] = React.useState<Invoice | null>(null);

  const groups = React.useMemo(() => groupByLead(rows), [rows]);

  const toggle = (key: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const handleConfirmed = (updated: Invoice, _receipt: ReceiptType) => {
    setRows((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    setMarkTarget(null);
  };

  if (groups.length === 0) return null;

  return (
    <>
      <div className="divide-y overflow-hidden rounded-xl border">
        {groups.map((group) => (
          <LeadGroupRow
            key={group.key}
            group={group}
            isExpanded={expanded.has(group.key)}
            onToggle={() => toggle(group.key)}
            onMarkPaid={setMarkTarget}
            basePath={basePath}
          />
        ))}
      </div>

      {markTarget && (
        <MarkAsPaidModal
          invoice={markTarget}
          open
          onOpenChange={(o) => !o && setMarkTarget(null)}
          onConfirmed={handleConfirmed}
        />
      )}
    </>
  );
}

// ─── Lead group row ───────────────────────────────────────────────────────────

function LeadGroupRow({
  group,
  isExpanded,
  onToggle,
  onMarkPaid,
  basePath,
}: {
  group: LeadGroup;
  isExpanded: boolean;
  onToggle: () => void;
  onMarkPaid: (inv: Invoice) => void;
  basePath: string;
}) {
  const t = useTranslations("Finance");
  const total = group.installments.length;
  const allPaid = group.paidCount === total;
  const nonePaid = group.paidCount === 0;

  return (
    <div>
      {/* ── Lead summary row ── */}
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-start transition-colors hover:bg-muted/40"
      >
        {/* Chevron */}
        <ChevronRight
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
            isExpanded && "rotate-90",
          )}
        />

        {/* Avatar + Name */}
        <Avatar className="size-9 shrink-0 border">
          <AvatarFallback className="bg-primary/10 text-[11px] font-semibold text-primary">
            {getInitials(group.studentName)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium leading-tight">{group.studentName}</p>
          <p className="truncate text-xs text-muted-foreground">{group.group || group.studentEmail}</p>
        </div>

        {/* Summary info */}
        <div className="flex shrink-0 items-center gap-4">
          {/* Installment progress */}
          <span className="hidden text-xs text-muted-foreground sm:block">
            {t("invInstallments", { n: total })}
          </span>

          {/* Paid fraction badge */}
          {allPaid ? (
            <Badge className="border-transparent bg-success/15 text-success">{t("statusPaid")}</Badge>
          ) : nonePaid ? (
            <Badge className="border-transparent bg-muted text-muted-foreground">{t("statusPending")}</Badge>
          ) : (
            <Badge className="border-transparent bg-warning/18 text-warning">
              {group.paidCount}/{total} {t("statusPaid")}
            </Badge>
          )}

          {/* Total amount */}
          <span className="hidden min-w-[80px] text-end text-sm font-semibold tabular-nums sm:block">
            {formatCurrency(group.totalAmount, group.currency)}
          </span>
        </div>
      </button>

      {/* ── Expanded installments ── */}
      {isExpanded && (
        <div className="border-t bg-muted/20">
          {/* Column headers */}
          <div className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-x-4 border-b px-10 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <span>{t("colInvoice")}</span>
            <span className="hidden sm:block">{t("colAmount")}</span>
            <span className="hidden sm:block">{t("colDue")}</span>
            <span>{t("colStatus")}</span>
            <span />
          </div>

          {group.installments.map((inst, idx) => (
            <InstallmentRow
              key={inst.id}
              inst={inst}
              index={idx}
              totalPlans={new Set(group.installments.map((i) => i.paymentPlanIndex ?? 0)).size}
              onMarkPaid={onMarkPaid}
              basePath={basePath}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Single installment row ───────────────────────────────────────────────────

function InstallmentRow({
  inst,
  index,
  totalPlans,
  onMarkPaid,
  basePath,
}: {
  inst: Invoice;
  index: number;
  totalPlans: number;
  onMarkPaid: (inv: Invoice) => void;
  basePath: string;
}) {
  const router = useRouter();
  const t = useTranslations("Finance");
  const [downloading, setDownloading] = React.useState(false);
  const isPaid = inst.status === "paid";
  const planIdx = inst.paymentPlanIndex ?? 0;

  const onDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setDownloading(true);
    const res = await downloadInvoicePdf(inst.id, `${inst.number}.pdf`);
    setDownloading(false);
    if (!res.ok) toast.error(res.error);
  };
  const instIdx = (inst.installmentIndex ?? 0) + 1;
  const label =
    totalPlans > 1
      ? `P${planIdx + 1} · #${instIdx}`
      : `#${instIdx}`;

  return (
    <div className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-x-4 border-b px-10 py-3 last:border-0">
      {/* Number + invoice number */}
      <div className="min-w-0">
        <span className="font-mono text-xs font-semibold text-muted-foreground">{label}</span>
        <span className="ms-2 text-xs text-muted-foreground">{inst.number}</span>
      </div>

      {/* Amount */}
      <span className="hidden text-sm tabular-nums sm:block">
        {formatCurrency(inst.amount, inst.currency)}
      </span>

      {/* Due date */}
      <span className="hidden text-xs text-muted-foreground sm:block">{inst.dueDate}</span>

      {/* Status */}
      <InvoiceStatusBadge value={inst.status} />

      {/* Actions */}
      <div className="flex items-center gap-1.5">
        {/* Receipt link (if paid and has receipt) */}
        {isPaid && inst.paymentReceipt?.dataUrl && (
          <a
            href={inst.paymentReceipt.dataUrl}
            target="_blank"
            rel="noreferrer"
            title={t("receiptBtn")}
            className="inline-flex size-7 items-center justify-center rounded-md text-success transition-colors hover:bg-success/10"
          >
            <Receipt className="size-4" />
          </a>
        )}

        {/* Mark as paid (if pending) */}
        {!isPaid && (
          <Button
            size="sm"
            variant="outline"
            className="h-7 gap-1 px-2 text-xs"
            onClick={(e) => { e.stopPropagation(); onMarkPaid(inst); }}
          >
            <CheckCircle2 className="size-3.5" />
            {t("markPaid")}
          </Button>
        )}

        {/* Download PDF */}
        <Button
          size="icon"
          variant="ghost"
          className="size-7"
          disabled={downloading}
          onClick={onDownload}
          title={t("downloadBtn")}
        >
          {downloading ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
        </Button>

        {/* View detail */}
        <Button
          size="icon"
          variant="ghost"
          className="size-7"
          onClick={(e) => { e.stopPropagation(); router.push(`${basePath}/invoices/${inst.id}`); }}
          title={t("colInvoice")}
        >
          <Eye className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
