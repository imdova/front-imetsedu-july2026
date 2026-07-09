import { api, type Result } from "@integration/services/http/client";
import type { RegBoardDto, RegColumnDto, RegCardDto } from "./types";

const BASE = "/registration-sheets";

export const getBoard = (): Promise<Result<RegBoardDto>> =>
  api.get(BASE, { revalidate: false });

export const createColumn = (input: Record<string, unknown>): Promise<Result<RegColumnDto>> =>
  api.post(`${BASE}/columns`, input);
export const updateColumn = (id: string, input: Record<string, unknown>): Promise<Result<RegColumnDto>> =>
  api.patch(`${BASE}/columns/${id}`, input);
export const removeColumn = (id: string): Promise<Result<{ success: boolean }>> =>
  api.delete(`${BASE}/columns/${id}`);

export const createCard = (input: Record<string, unknown>): Promise<Result<RegCardDto>> =>
  api.post(`${BASE}/cards`, input);
export const updateCard = (id: string, input: Record<string, unknown>): Promise<Result<RegCardDto>> =>
  api.patch(`${BASE}/cards/${id}`, input);
export const removeCard = (id: string): Promise<Result<{ success: boolean }>> =>
  api.delete(`${BASE}/cards/${id}`);
