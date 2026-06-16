/**
 * Maps backend CRM finance shapes (`GET /crm/invoices`) to the UI finance
 * shapes. Backend invoices are installment-derived rows; each carries an
 * embedded `invoice` document. Pure + client-safe.
 */
import type { Invoice, InvoiceStatus, InstallmentStatus, Installment, Currency, FinanceStats, Payment, PaymentMethod } from "@/lib/db/finance";

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
  // List rows embed an `invoice` sub-doc; detail endpoint may return the
  // BackendInvoice row directly (no sub-doc) — handle both.
  const inv = raw?.invoice ?? {};
  const rawStatus = (inv.status ?? raw.status ?? raw.installment?.status ?? "").toLowerCase();
  const status: InvoiceStatus = STATUS_MAP[rawStatus] ?? "sent";
  const amount = inv.totalDue ?? raw.totalDue ?? raw.installment?.amount ?? 0;

  const rawCourse = Array.isArray(raw.courses) ? raw.courses[0] : undefined;
  const courseId = rawCourse?._id ?? rawCourse?.id ?? (typeof rawCourse === "string" ? rawCourse : undefined) ?? raw.invoice?.coursicesIds?.[0] ?? raw.coursicesIds?.[0] ?? raw.paymentPlan?.courses?.[0];
  const courseTitle = rawCourse?.titleEn ?? rawCourse?.titleAr ?? raw.paymentPlan?.courseName ?? raw.invoice?.courseName;
  const courseThumbnail = rawCourse?.image ?? rawCourse?.thumbnail ?? rawCourse?.cover;

  // Compound id for installment rows so the detail endpoint receives the
  // leadId-planIndex-installmentIndex format it expects.
  const isInstallment = raw._type === "installment";
  const compoundId =
    isInstallment && raw._id && raw.paymentPlanIndex != null && raw.installmentIndex != null
      ? `${raw._id}-${raw.paymentPlanIndex}-${raw.installmentIndex}`
      : null;

  let paymentReceipt: any = undefined;
  // Try to read from raw.receipts first
  const firstReceipt = raw.receipts?.[0] ?? inv.receipts?.[0] ?? raw.invoice?.receipts?.[0];
  if (firstReceipt) {
    paymentReceipt = {
      dataUrl: firstReceipt.previewUrl,
      filename: firstReceipt.name,
      mimeType: firstReceipt.type,
      size: firstReceipt.size,
      uploadedAt: firstReceipt.attachedAt ?? new Date().toISOString(),
    };
  } else {
    // Fallback to paymentReceipt (for both manual and installment if receipts list is empty)
    const rawReceipt = raw.paymentReceipt ?? inv.paymentReceipt ?? raw.invoice?.paymentReceipt;
    if (rawReceipt) {
      if (typeof rawReceipt === "string") {
        const isImage = /\.(png|jpe?g|webp|gif|bmp)(\?|$)/i.test(rawReceipt);
        paymentReceipt = {
          dataUrl: rawReceipt,
          filename: rawReceipt.split("/").pop() || "receipt",
          mimeType: isImage ? "image/jpeg" : "application/pdf",
          size: 0,
        };
      } else if (typeof rawReceipt === "object") {
        paymentReceipt = {
          dataUrl: rawReceipt.url || rawReceipt.dataUrl || rawReceipt.link || "",
          filename: rawReceipt.filename || rawReceipt.name || "receipt",
          mimeType: rawReceipt.mimeType || rawReceipt.type || "image/jpeg",
          size: rawReceipt.size || 0,
          method: rawReceipt.method,
          reference: rawReceipt.reference,
          paidOn: rawReceipt.paidOn ?? raw.paidOn ?? raw.paidAt ?? inv.paidOn ?? inv.paidAt,
        };
      }
    }
  }

  const studentId = raw.leadId ?? (raw.leadId as any)?._id ?? inv.leadId ?? (inv.leadId as any)?._id;
  const installmentIndex = raw.installmentIndex ?? (raw.installment?.index != null ? raw.installment.index - 1 : undefined);

  return {
    id: compoundId ?? inv._id ?? raw._id,
    number: inv.invoiceNumber ?? raw.invoiceNumber ?? "—",
    studentName: raw.fullName ?? (raw.leadId as any)?.fullName ?? "—",
    studentEmail: raw.email ?? (raw.leadId as any)?.email ?? "",
    type: isInstallment ? "installment" : "one-off",
    amount,
    paid: status === "paid" ? amount : status === "partial" ? (raw.installment?.amount ?? 0) : 0,
    currency: (inv.currency ?? raw.currency ?? raw.paymentPlan?.currency ?? "EGP") as Currency,
    status,
    issuedDate: fmtDate(inv.issueDate ?? raw.issueDate ?? raw.paymentPlan?.createdAt),
    issuedAtISO: inv.issueDate ?? raw.issueDate ?? raw.paymentPlan?.createdAt ?? undefined,
    dueDate: fmtDate(inv.dueDate ?? raw.dueDate ?? raw.installment?.dueDate),
    group: raw.group?.title,
    courseId,
    courseTitle,
    courseThumbnail,
    method: raw.paymentPlan?.paymentMethod,
    paymentReceipt,
    studentId,
    installmentIndex,
  };
}

/** Maps a lead (from GET /crm/payments leadPayments.data) with its full payment
 * plan to an Invoice with all installments populated. */
export function mapLeadPaymentPlanToInvoice(lead: any): Invoice {
  const plan = lead?.paymentPlan ?? {};
  const rawInsts: any[] = plan.installments ?? [];
  const installments: Installment[] = rawInsts.map((inst: any) => {
    const instStatus: InstallmentStatus =
      inst.status === "PAID" ? "PAID" : inst.status === "DUE" ? "DUE" : "SCHEDULED";
    return {
      index: inst.index ?? 0,
      amount: inst.amount ?? 0,
      dueDate: fmtDate(inst.dueDate),
      paidDate: inst.paidDate ? fmtDate(inst.paidDate) : undefined,
      status: instStatus,
    };
  });

  const paid = installments.filter((i) => i.status === "PAID").reduce((s, i) => s + i.amount, 0);
  const totalAmount = plan.totalAmount ?? 0;
  const hasOverdue = installments.some((i) => i.status === "DUE");
  const allPaid = installments.length > 0 && installments.every((i) => i.status === "PAID");
  const status: InvoiceStatus = allPaid ? "paid" : hasOverdue ? "overdue" : "sent";
  const firstUnpaid = installments.find((i) => i.status !== "PAID");

  return {
    id: lead._id ?? lead.id ?? "",
    number: `PP-${String(lead._id ?? "").slice(-6).toUpperCase()}`,
    studentName: lead.fullName ?? "—",
    studentEmail: lead.email ?? "",
    type: "installment",
    amount: totalAmount,
    paid,
    currency: (plan.currency ?? "EGP") as Currency,
    status,
    issuedDate: fmtDate(plan.createdAt),
    issuedAtISO: plan.createdAt,
    dueDate: firstUnpaid?.dueDate ?? "—",
    group: lead.group?.title,
    courseId: plan.courses?.[0] ?? undefined,
    courseTitle: lead.group?.course?.title ?? plan.courseName ?? undefined,
    installments,
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
