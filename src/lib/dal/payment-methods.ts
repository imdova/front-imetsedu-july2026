/** Payment methods DAL — LIVE against the NestJS `payment-methods` module. */
import { ok, type Result } from "@integration/lib/api-client";
import * as svc from "@integration/services/payment-methods";

export interface PaymentMethod {
  id: string;
  title: string;
  details: string;
  order: number;
}

export type PaymentMethodInput = {
  title: string;
  details?: string;
  order?: number;
};

const map = (d: svc.PaymentMethodDto): PaymentMethod => ({
  id: d._id,
  title: d.title,
  details: d.details ?? "",
  order: d.order ?? 0,
});

export async function fetchPaymentMethods(): Promise<Result<PaymentMethod[]>> {
  const res = await svc.list();
  return res.ok ? ok(res.data.map(map)) : res;
}

export async function createPaymentMethod(input: PaymentMethodInput): Promise<Result<PaymentMethod>> {
  const res = await svc.create(input);
  return res.ok ? ok(map(res.data)) : res;
}

export async function updatePaymentMethod(id: string, input: Partial<PaymentMethodInput>): Promise<Result<PaymentMethod>> {
  const res = await svc.update(id, input);
  return res.ok ? ok(map(res.data)) : res;
}

export async function deletePaymentMethod(id: string): Promise<Result<boolean>> {
  const res = await svc.remove(id);
  return res.ok ? ok(true) : res;
}
