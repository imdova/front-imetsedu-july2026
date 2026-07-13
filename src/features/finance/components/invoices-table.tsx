"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { ChevronRight, CheckCircle2, Eye, Receipt, Download, Loader2, CalendarClock } from "lucide-react";
import { toast } from "sonner";

import { downloadInvoicePdf } from "@integration/services/invoices";
import { useRouter } from "@/i18n/navigation";
import type { Invoice, Currency } from "@/lib/db/finance";
import { cn, formatCurrency, getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InvoiceStatusBadge } from "./finance-badges";
import { MarkAsPaidModal } from "./mark-as-paid-modal";

// ─── Types ────────────────────────────────────────────────────────────────────

type LeadGroup = {
  key: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  group?: string;
  agentName?: string;
  createdAt?: string; // display
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
        agentName: inv.agentName,
        createdAt: inv.issuedDate,
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
    if (!g.agentName && inv.agentName) g.agentName = inv.agentName;
    if (inv.status === "paid") {
      g.paidAmount += inv.amount;
      g.paidCount += 1;
    }
  }

  for (const g of map.values()) {
    g.installments.sort(
      (a, b) =>
        (a.paymentPlanIndex ?? 0) * 1000 +
        (a.installmentIndex ?? 0) -
        ((b.paymentPlanIndex ?? 0) * 1000 + (b.installmentIndex ?? 0)),
    );
    g.createdAt = g.installments[0]?.issuedDate ?? g.createdAt;
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
  const t = useTranslations("Finance");
  // Optimistic mark-as-paid overrides, keyed by invoice id. Rows derive from the
  // (already-filtered) `initialData` prop so filter changes flow through.
  const [overrides, setOverrides] = React.useState<Map<string, Invoice>>(new Map());
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());
  const [markTarget, setMarkTarget] = React.useState<Invoice | null>(null);

  const rows = React.useMemo(() => initialData.map((r) => overrides.get(r.id) ?? r), [initialData, overrides]);
  const groups = React.useMemo(() => groupByLead(rows), [rows]);

  const toggle = (key: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });

  const handleConfirmed = (updated: Invoice) => {
    setOverrides((prev) => new Map(prev).set(updated.id, updated));
    setMarkTarget(null);
  };

  if (groups.length === 0) return null;

  return (
    <>
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full min-w-[60rem] text-sm">
          <thead>
            <tr className="bg-blue-600 text-xs uppercase tracking-wide text-white [&_th]:text-white">
              <th className="px-4 py-3 text-start font-semibold">{t("colStudent")}</th>
              <th className="px-4 py-3 text-start font-semibold">{t("invAssignedAgent")}</th>
              <th className="px-4 py-3 text-start font-semibold">{t("invCreatedAt")}</th>
              <th className="px-4 py-3 text-start font-semibold">{t("invDueDate")}</th>
              <th className="px-4 py-3 text-end font-semibold">{t("colAmount")}</th>
              <th className="px-4 py-3 text-start font-semibold">{t("colStatus")}</th>
              <th className="w-8 px-3 py-3" />
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <LeadGroupRows
                key={group.key}
                group={group}
                isExpanded={expanded.has(group.key)}
                onToggle={() => toggle(group.key)}
                onMarkPaid={setMarkTarget}
                basePath={basePath}
              />
            ))}
          </tbody>
        </table>
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

// ─── Lead group rows (summary + expandable installments) ──────────────────────

function LeadGroupRows({
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
  const firstUnpaid = group.installments.find((i) => i.status !== "paid");
  const dueDate = allPaid ? t("invAllPaid") : firstUnpaid?.dueDate ?? "—";

  return (
    <>
      {/* Summary row */}
      <tr onClick={onToggle} className="cursor-pointer border-b last:border-0 hover:bg-muted/30">
        <td className="px-4 py-3">
          <div className="flex items-center gap-2.5">
            <ChevronRight className={cn("size-4 shrink-0 text-muted-foreground transition-transform duration-200", isExpanded && "rotate-90")} />
            <Avatar className="size-8 shrink-0 border">
              <AvatarFallback className="bg-primary/10 text-[11px] font-semibold text-primary">{getInitials(group.studentName)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate font-medium leading-tight" dir="auto">{group.studentName}</p>
              <p className="truncate text-xs text-muted-foreground">{group.group || group.studentEmail}</p>
            </div>
          </div>
        </td>
        <td className="px-4 py-3">
          {group.agentName ? (
            <span className="inline-flex items-center gap-2">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-chart-2/20 text-[0.6rem] font-semibold text-chart-2">{getInitials(group.agentName)}</span>
              <span className="truncate text-sm">{group.agentName}</span>
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">{t("invUnassigned")}</span>
          )}
        </td>
        <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{group.createdAt || "—"}</td>
        <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><CalendarClock className="size-3.5" />{dueDate}</span>
        </td>
        <td className="px-4 py-3 text-end font-semibold tabular-nums">{formatCurrency(group.totalAmount, group.currency)}</td>
        <td className="px-4 py-3">
          {allPaid ? (
            <Badge className="border-transparent bg-success/15 text-success">{t("statusPaid")}</Badge>
          ) : nonePaid ? (
            <Badge className="border-transparent bg-muted text-muted-foreground">{t("statusPending")}</Badge>
          ) : (
            <Badge className="border-transparent bg-warning/18 text-warning">{group.paidCount}/{total} {t("statusPaid")}</Badge>
          )}
        </td>
        <td className="px-3 py-3 text-end text-xs text-muted-foreground tabular-nums">{t("invInstallments", { n: total })}</td>
      </tr>

      {/* Expanded installments */}
      {isExpanded && (
        <tr className="border-b last:border-0 bg-muted/20">
          <td colSpan={7} className="px-0 py-0">
            <div className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-x-4 border-b px-12 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
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
                totalPlans={new Set(group.installments.map((i) => i.paymentPlanIndex ?? 0)).size}
                onMarkPaid={onMarkPaid}
                basePath={basePath}
                index={idx}
              />
            ))}
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Single installment row ───────────────────────────────────────────────────

function InstallmentRow({
  inst,
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
  const instIdx = (inst.installmentIndex ?? 0) + 1;
  const label = totalPlans > 1 ? `P${planIdx + 1} · #${instIdx}` : `#${instIdx}`;

  const onDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setDownloading(true);
    const res = await downloadInvoicePdf(inst.id, `${inst.number}.pdf`);
    setDownloading(false);
    if (!res.ok) toast.error(res.error);
  };

  return (
    <div className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-x-4 border-b px-12 py-3 last:border-0">
      <div className="min-w-0">
        <span className="font-mono text-xs font-semibold text-muted-foreground">{label}</span>
        <span className="ms-2 text-xs text-muted-foreground">{inst.number}</span>
      </div>
      <span className="hidden text-sm tabular-nums sm:block">{formatCurrency(inst.amount, inst.currency)}</span>
      <span className="hidden text-xs text-muted-foreground sm:block">{inst.dueDate}</span>
      <InvoiceStatusBadge value={inst.status} />
      <div className="flex items-center gap-1.5">
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
        {!isPaid && (
          <Button size="sm" variant="outline" className="h-7 gap-1 px-2 text-xs" onClick={(e) => { e.stopPropagation(); onMarkPaid(inst); }}>
            <CheckCircle2 className="size-3.5" />{t("markPaid")}
          </Button>
        )}
        <Button size="icon" variant="ghost" className="size-7" disabled={downloading} onClick={onDownload} title={t("downloadBtn")}>
          {downloading ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
        </Button>
        <Button size="icon" variant="ghost" className="size-7" onClick={(e) => { e.stopPropagation(); router.push(`${basePath}/invoices/${inst.id}`); }} title={t("colInvoice")}>
          <Eye className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
