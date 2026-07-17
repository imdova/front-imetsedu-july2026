import { api, type Result } from "@integration/services/http/client";
import type {
  InstructorApplicationDto,
  InstructorApplicationInput,
} from "./types";

const BASE = "/instructor-applications";

/**
 * Public submit. `requireAuth: false` so an admin who happens to be logged in
 * does not attach their bearer token to an anonymous marketing-form post —
 * matching how the landing capture endpoints are called.
 */
export const submit = (
  input: InstructorApplicationInput,
): Promise<Result<{ ok: boolean; id: string }>> =>
  api.post(BASE, input, { requireAuth: false });

/**
 * Public CV upload. Multipart, so no Content-Type is set by hand — the browser
 * must add its own multipart boundary.
 */
export const uploadCv = (
  file: File,
): Promise<Result<{ url: string; originalName: string; size: number }>> => {
  const form = new FormData();
  form.append("file", file);
  return api.post(`${BASE}/cv`, form, { requireAuth: false });
};

/* ── admin ── */

export const list = (status?: string): Promise<Result<InstructorApplicationDto[]>> =>
  api.get(BASE, { params: status && status !== "all" ? { status } : undefined, revalidate: false });

export const counts = (): Promise<Result<Record<string, number>>> =>
  api.get(`${BASE}/counts`, { revalidate: false });

export const update = (
  id: string,
  input: Record<string, unknown>,
): Promise<Result<InstructorApplicationDto>> => api.patch(`${BASE}/${id}`, input);

export const remove = (id: string): Promise<Result<{ deleted: boolean }>> =>
  api.delete(`${BASE}/${id}`);
