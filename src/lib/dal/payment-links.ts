/** Payment links DAL — LIVE against the NestJS `payment-links` module. */
import { ok, type Result } from "@integration/lib/api-client";
import * as svc from "@integration/services/payment-links";

export type PaymentType = "cash" | "installment_1" | "installment_2" | "installment_3";

export interface PaymentLink {
  id: string;
  token: string;
  courseId: string;
  courseTitle: string;
  courseImage: string;
  paymentType: PaymentType;
  amount: number;
  discount: number;
  tax: number;
  subtotal: number;
  total: number;
  currency: string;
  status: string;
  payments: PaymentEntry[];
  createdAt: string;
}

export interface PaymentEntry {
  transactionId: string;
  payerName: string;
  payerEmail: string;
  amount: number;
  paidAt: string;
}

export interface PublicPaymentLink {
  token: string;
  courseTitle: string;
  courseImage: string;
  paymentType: PaymentType;
  amount: number;
  discount: number;
  tax: number;
  subtotal: number;
  total: number;
  currency: string;
  status: string;
}

export type PaymentLinkInput = {
  courseTitle: string;
  courseId?: string;
  courseImage?: string;
  paymentType?: PaymentType;
  amount?: number;
  discount?: number;
  tax?: number;
  currency?: string;
};

const map = (d: svc.PaymentLinkDto): PaymentLink => ({
  id: d._id,
  token: d.token,
  courseId: d.courseId ?? "",
  courseTitle: d.courseTitle,
  courseImage: d.courseImage ?? "",
  paymentType: (d.paymentType as PaymentType) ?? "cash",
  amount: d.amount ?? 0,
  discount: d.discount ?? 0,
  tax: d.tax ?? 0,
  subtotal: d.subtotal ?? 0,
  total: d.total ?? 0,
  currency: d.currency ?? "USD",
  status: d.status ?? "active",
  payments: (d.payments ?? []).map((p) => ({
    transactionId: p.transactionId ?? "",
    payerName: p.payerName ?? "",
    payerEmail: p.payerEmail ?? "",
    amount: p.amount ?? 0,
    paidAt: p.paidAt ?? "",
  })),
  createdAt: d.createdAt ?? "",
});

export async function fetchPaymentLinks(): Promise<Result<PaymentLink[]>> {
  const res = await svc.list();
  return res.ok ? ok(res.data.map(map)) : res;
}

export async function createPaymentLink(input: PaymentLinkInput): Promise<Result<PaymentLink>> {
  const res = await svc.create(input);
  return res.ok ? ok(map(res.data)) : res;
}

export async function updatePaymentLink(id: string, input: Partial<PaymentLinkInput>): Promise<Result<PaymentLink>> {
  const res = await svc.update(id, input);
  return res.ok ? ok(map(res.data)) : res;
}

export async function deletePaymentLink(id: string): Promise<Result<boolean>> {
  const res = await svc.remove(id);
  return res.ok ? ok(true) : res;
}

export async function fetchPublicPaymentLink(token: string): Promise<Result<PublicPaymentLink>> {
  const res = await svc.getPublic(token);
  if (!res.ok) return res;
  const d = res.data;
  return ok({
    token: d.token,
    courseTitle: d.courseTitle,
    courseImage: d.courseImage ?? "",
    paymentType: (d.paymentType as PaymentType) ?? "cash",
    amount: d.amount ?? 0,
    discount: d.discount ?? 0,
    tax: d.tax ?? 0,
    subtotal: d.subtotal ?? 0,
    total: d.total ?? 0,
    currency: d.currency ?? "USD",
    status: d.status ?? "active",
  });
}

export async function markPaymentLinkPaid(
  token: string,
  input: { transactionId?: string; payerName?: string; payerEmail?: string },
): Promise<Result<boolean>> {
  const res = await svc.markPaid(token, input);
  return res.ok ? ok(true) : res;
}
