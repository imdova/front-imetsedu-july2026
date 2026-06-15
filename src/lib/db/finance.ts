/**
 * Finance seed + actions: invoices (one-off & installment), payment records and
 * refunds — multi-currency (EGP/SAR/USD), per FR-FIN-1..6 and the Data
 * Dictionary. Installment invoices carry a schedule with per-line status.
 */
import { clone, delay, respond } from "./delay";

export type Currency = "EGP" | "SAR" | "USD";
export type InvoiceType = "one-off" | "installment";
export type InvoiceStatus = "draft" | "sent" | "partial" | "paid" | "overdue";
export type InstallmentStatus = "PAID" | "DUE" | "SCHEDULED";
export type PaymentMethod = "Bank transfer" | "Card" | "Cash" | "Fawry" | "Paymob";
export type PaymentStatus = "completed" | "pending";
export type RefundStatus = "requested" | "approved" | "processed" | "rejected";

export interface Installment {
  index: number;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: InstallmentStatus;
}

export interface Invoice {
  id: string;
  number: string;
  studentName: string;
  studentEmail: string;
  type: InvoiceType;
  amount: number;
  paid: number;
  currency: Currency;
  status: InvoiceStatus;
  issuedDate: string;
  dueDate: string;
  group?: string;
  /** The course selected in the installment plan (for the invoice line item). */
  courseId?: string;
  courseTitle?: string;
  courseThumbnail?: string;
  installments?: Installment[];
}

export interface Payment {
  id: string;
  number: string;
  studentName: string;
  invoiceNumber: string;
  amount: number;
  currency: Currency;
  method: PaymentMethod;
  date: string;
  status: PaymentStatus;
}

export interface Refund {
  id: string;
  number: string;
  studentName: string;
  invoiceNumber: string;
  amount: number;
  currency: Currency;
  status: RefundStatus;
  reason: string;
  date: string;
}

const NAMES = [
  "Ahmed Al-Otaibi", "Layla Habib", "Omar Mansour", "Fatima Saleh", "Yousef Rashad",
  "Mariam Al-Mutairi", "Khalid Hassan", "Nour Awad", "Hassan Fathy", "Sara Adel",
  "Tariq Salim", "Huda Al-Otaibi", "Bilal Hassan", "Rana Saleh",
];
const COURSES = ["Advanced Financial Modeling", "Digital Marketing Strategy", "PMP Certification Prep", "Strategic HR"];
const METHODS: PaymentMethod[] = ["Bank transfer", "Card", "Cash", "Fawry", "Paymob"];
const CURRENCIES: Currency[] = ["EGP", "EGP", "EGP", "SAR", "USD"];

function buildInvoice(i: number): Invoice {
  const name = NAMES[i % NAMES.length];
  const currency = CURRENCIES[i % CURRENCIES.length];
  const amount = [9900, 8400, 6200, 12000, 5500][i % 5];
  const type: InvoiceType = i % 3 === 0 ? "installment" : "one-off";
  const statusPool: InvoiceStatus[] = ["paid", "partial", "sent", "overdue", "paid", "draft"];
  const status = statusPool[i % statusPool.length];
  const paid = status === "paid" ? amount : status === "partial" ? Math.round(amount / 3) : 0;

  let installments: Installment[] | undefined;
  if (type === "installment") {
    const n = 3;
    const per = Math.round(amount / n);
    installments = Array.from({ length: n }, (_, k) => {
      const paidLine = status === "paid" || (status === "partial" && k === 0);
      return {
        index: k + 1,
        amount: per,
        dueDate: `${(k + 1) * 30} days`,
        paidDate: paidLine ? "paid" : undefined,
        status: (paidLine ? "PAID" : k === 0 ? "DUE" : "SCHEDULED") as InstallmentStatus,
      };
    });
  }

  return {
    id: `inv_${i}`,
    number: `INV-2026-${String(1001 + i).padStart(4, "0")}`,
    studentName: name,
    studentEmail: `${name.split(" ")[0].toLowerCase()}@example.com`,
    type,
    amount,
    paid,
    currency,
    status,
    issuedDate: `${(i % 20) + 1} days ago`,
    dueDate: status === "overdue" ? "5 days ago" : `${(i % 14) + 3} days`,
    group: COURSES[i % COURSES.length],
    installments,
  };
}

let invoices: Invoice[] = Array.from({ length: 14 }, (_, i) => buildInvoice(i));

let payments: Payment[] = Array.from({ length: 14 }, (_, i) => {
  const name = NAMES[(i + 2) % NAMES.length];
  return {
    id: `pay_${i}`,
    number: `PMT-2026-${String(2001 + i).padStart(4, "0")}`,
    studentName: name,
    invoiceNumber: `INV-2026-${String(1001 + (i % 14)).padStart(4, "0")}`,
    amount: [9900, 3300, 6200, 4000, 5500][i % 5],
    currency: CURRENCIES[i % CURRENCIES.length],
    method: METHODS[i % METHODS.length],
    date: `${(i % 18) + 1} days ago`,
    status: (i % 5 === 0 ? "pending" : "completed") as PaymentStatus,
  };
});

let refunds: Refund[] = Array.from({ length: 8 }, (_, i) => {
  const name = NAMES[(i + 5) % NAMES.length];
  const statusPool: RefundStatus[] = ["requested", "approved", "processed", "rejected"];
  return {
    id: `ref_${i}`,
    number: `RFD-2026-${String(3001 + i).padStart(4, "0")}`,
    studentName: name,
    invoiceNumber: `INV-2026-${String(1001 + (i % 14)).padStart(4, "0")}`,
    amount: [4950, 3300, 2000, 9900][i % 4],
    currency: CURRENCIES[i % CURRENCIES.length],
    status: statusPool[i % statusPool.length],
    reason: ["Withdrew before start", "Duplicate payment", "Course rescheduled", "Dissatisfied"][i % 4],
    date: `${(i % 12) + 1} days ago`,
  };
});

export interface FinanceStats {
  collected: number;
  outstanding: number;
  overdue: number;
  refunded: number;
}

export async function getFinanceStats(): Promise<FinanceStats> {
  await delay();
  const snap = clone(invoices);
  return {
    collected: snap.reduce((s, i) => s + i.paid, 0),
    outstanding: snap.reduce((s, i) => s + (i.amount - i.paid), 0),
    overdue: snap.filter((i) => i.status === "overdue").reduce((s, i) => s + (i.amount - i.paid), 0),
    refunded: clone(refunds).filter((r) => r.status === "processed").reduce((s, r) => s + r.amount, 0),
  };
}

export const getInvoices = () => respond(invoices);
export const getPayments = () => respond(payments);
export const getRefunds = () => respond(refunds);

export async function getInvoiceById(id: string): Promise<Invoice | null> {
  await delay(200);
  const found = invoices.find((i) => i.id === id);
  return found ? clone(found) : null;
}

export async function markInvoicePaid(id: string): Promise<Invoice | null> {
  await delay(300);
  const idx = invoices.findIndex((i) => i.id === id);
  if (idx === -1) return null;
  invoices[idx] = {
    ...invoices[idx],
    paid: invoices[idx].amount,
    status: "paid",
    installments: invoices[idx].installments?.map((x) => ({ ...x, status: "PAID", paidDate: "paid" })),
  };
  return clone(invoices[idx]);
}

export async function updateRefundStatus(id: string, status: RefundStatus): Promise<Refund | null> {
  await delay(250);
  const idx = refunds.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  refunds[idx] = { ...refunds[idx], status };
  return clone(refunds[idx]);
}
