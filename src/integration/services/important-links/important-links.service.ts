import { api, type Result } from "@integration/services/http/client";
import type { ImportantLinkDto } from "./types";

const BASE = "/important-links";

export const list = (): Promise<Result<ImportantLinkDto[]>> =>
  api.get(BASE, { revalidate: false });

export const create = (input: Record<string, unknown>): Promise<Result<ImportantLinkDto>> =>
  api.post(BASE, input);

export const update = (id: string, input: Record<string, unknown>): Promise<Result<ImportantLinkDto>> =>
  api.patch(`${BASE}/${id}`, input);

export const remove = (id: string): Promise<Result<{ success: boolean }>> =>
  api.delete(`${BASE}/${id}`);
