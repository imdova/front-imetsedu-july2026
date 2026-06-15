/**
 * Maps backend CRM finance shapes (`GET /crm/invoices`) to the UI finance
 * shapes. Backend invoices are installment-derived rows; each carries an
 * embedded `invoice` document. Pure + client-safe.
 */
import type { Invoice, InvoiceStatus, Currency, FinanceStats, Payment, PaymentMethod } from "@/lib/db/finance";

const STATUS_MAP: Record<string, InvoiceStatus> = {
  paid: "paid",
  already_paid: "paid",
  partial: "partial",
  pending: "sent",
  sent: "sent",
  overdue: "overdue",
  cancelled: "draft",
  draft: "draft",
};

function fmtDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function mapInvoice(raw: any): Invoice {
  const inv = raw?.invoice ?? {};
  const status: InvoiceStatus = STATUS_MAP[inv.status ?? raw.installment?.status?.toLowerCase?.()] ?? "sent";
  const amount = inv.totalDue ?? raw.installment?.amount ?? 0;
  return {
    id: inv._id ?? raw._id,
    number: inv.invoiceNumber ?? "—",
    studentName: raw.fullName ?? "—",
    studentEmail: raw.email ?? "",
    type: raw._type === "installment" ? "installment" : "one-off",
    amount,
    paid: status === "paid" ? amount : status === "partial" ? (raw.installment?.amount ?? 0) : 0,
    currency: (inv.currency ?? raw.paymentPlan?.currency ?? "EGP") as Currency,
    status,
    issuedDate: fmtDate(inv.issueDate ?? raw.paymentPlan?.createdAt),
    dueDate: fmtDate(inv.dueDate ?? raw.installment?.dueDate),
    group: raw.group?.title,
  };
}

const METHOD_MAP: Record<string, PaymentMethod> = {
  "bank transfer": "Bank transfer",
  card: "Card",
  cash: "Cash",
  fawry: "Fawry",
  paymob: "Paymob",
};
function mapMethod(m?: string): PaymentMethod {
  return METHOD_MAP[(m ?? "").toLowerCase()] ?? "Cash";
}

/** Flattens leadPayments rows (leads with payment plans) into paid-installment
 * payment records for the UI payments list. */
export function mapPayments(rows: any[]): Payment[] {
  const out: Payment[] = [];
  for (const lead of rows ?? []) {
    const plan = lead?.paymentPlan;
    if (!plan) continue;
    for (const it of plan.installments ?? []) {
      if (it?.status !== "PAID") continue;
      out.push({
        id: `${lead._id}-${it.index}`,
        number: `PMT-${String(lead._id).slice(-6).toUpperCase()}-${it.index}`,
        studentName: lead.fullName ?? "—",
        invoiceNumber: lead.invoiceNumber ?? "—",
        amount: it.amount ?? 0,
        currency: (plan.currency ?? "EGP") as Currency,
        method: mapMethod(plan.paymentMethod),
        date: it.paidDate ?? fmtDate(it.dueDate),
        status: "completed",
      });
    }
  }
  return out;
}

export function mapFinanceStats(rawStats: any): FinanceStats {
  return {
    collected: rawStats?.collected ?? 0,
    outstanding: rawStats?.outstanding ?? 0,
    overdue: rawStats?.overdue ?? 0,
    refunded: rawStats?.refunded ?? 0,
  };
}
