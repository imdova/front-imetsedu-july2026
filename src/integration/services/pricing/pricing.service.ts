import { api, type Result } from "@integration/services/http/client";
import type { PriceRowDto } from "./types";

const BASE = "/pricing";

export const list = (): Promise<Result<PriceRowDto[]>> =>
  api.get(BASE, { revalidate: false });

export const create = (input: Record<string, unknown>): Promise<Result<PriceRowDto>> =>
  api.post(BASE, input);

export const update = (id: string, input: Record<string, unknown>): Promise<Result<PriceRowDto>> =>
  api.patch(`${BASE}/${id}`, input);

export const remove = (id: string): Promise<Result<{ success: boolean }>> =>
  api.delete(`${BASE}/${id}`);
