import { api, type Result } from "@integration/services/http/client";
import type { CrmRuleDto } from "./types";

const BASE = "/crm-rules";

export const list = (): Promise<Result<CrmRuleDto[]>> =>
  api.get(BASE, { revalidate: false });

export const create = (input: Record<string, unknown>): Promise<Result<CrmRuleDto>> =>
  api.post(BASE, input);

export const update = (id: string, input: Record<string, unknown>): Promise<Result<CrmRuleDto>> =>
  api.patch(`${BASE}/${id}`, input);

export const remove = (id: string): Promise<Result<{ success: boolean }>> =>
  api.delete(`${BASE}/${id}`);
