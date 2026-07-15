import { api, type Result } from "@integration/services/http/client";
import type { ShipmentDto } from "./types";

const BASE = "/shipments";

export const list = (): Promise<Result<ShipmentDto[]>> =>
  api.get(BASE, { revalidate: false });

export const create = (input: Record<string, unknown>): Promise<Result<ShipmentDto>> =>
  api.post(BASE, input);

export const update = (id: string, input: Record<string, unknown>): Promise<Result<ShipmentDto>> =>
  api.patch(`${BASE}/${id}`, input);

export const remove = (id: string): Promise<Result<{ success: boolean }>> =>
  api.delete(`${BASE}/${id}`);
