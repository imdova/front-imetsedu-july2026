import { api, type Result } from "@integration/services/http/client";
import type { MessageTemplateDto } from "./types";

const BASE = "/message-templates";

export const list = (courseId?: string): Promise<Result<MessageTemplateDto[]>> =>
  api.get(BASE, { params: courseId !== undefined ? { courseId } : {}, revalidate: false });

export const get = (id: string): Promise<Result<MessageTemplateDto>> =>
  api.get(`${BASE}/${id}`, { revalidate: false });

export const create = (input: Record<string, unknown>): Promise<Result<MessageTemplateDto>> =>
  api.post(BASE, input);

export const update = (id: string, input: Record<string, unknown>): Promise<Result<MessageTemplateDto>> =>
  api.patch(`${BASE}/${id}`, input);

export const remove = (id: string): Promise<Result<{ success: boolean }>> =>
  api.delete(`${BASE}/${id}`);
