import { api, type Result } from "@integration/services/http/client";
import type { PaymentLinkDto, PublicPaymentLinkDto } from "./types";

const BASE = "/payment-links";

export const list = (): Promise<Result<PaymentLinkDto[]>> =>
  api.get(BASE, { revalidate: false });

export const create = (input: Record<string, unknown>): Promise<Result<PaymentLinkDto>> =>
  api.post(BASE, input);

export const update = (id: string, input: Record<string, unknown>): Promise<Result<PaymentLinkDto>> =>
  api.patch(`${BASE}/${id}`, input);

export const remove = (id: string): Promise<Result<{ success: boolean }>> =>
  api.delete(`${BASE}/${id}`);

// --- Public (no auth) -------------------------------------------------------

export const getPublic = (token: string): Promise<Result<PublicPaymentLinkDto>> =>
  api.get(`${BASE}/public/${token}`, { revalidate: false });

export const markPaid = (
  token: string,
  input: Record<string, unknown>,
): Promise<Result<{ success: boolean }>> =>
  api.post(`${BASE}/public/${token}/paid`, input);
