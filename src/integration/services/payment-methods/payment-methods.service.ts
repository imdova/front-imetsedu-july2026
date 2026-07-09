import { api, type Result } from "@integration/services/http/client";
import type { PaymentMethodDto } from "./types";

const BASE = "/payment-methods";

export const list = (): Promise<Result<PaymentMethodDto[]>> =>
  api.get(BASE, { revalidate: false });

export const create = (input: Record<string, unknown>): Promise<Result<PaymentMethodDto>> =>
  api.post(BASE, input);

export const update = (id: string, input: Record<string, unknown>): Promise<Result<PaymentMethodDto>> =>
  api.patch(`${BASE}/${id}`, input);

export const remove = (id: string): Promise<Result<{ success: boolean }>> =>
  api.delete(`${BASE}/${id}`);
