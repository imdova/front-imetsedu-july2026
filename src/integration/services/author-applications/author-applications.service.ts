import { api, type Result } from "@integration/services/http/client";
import type { AuthorApplicationDto, AuthorApplicationInput } from "./types";

const BASE = "/author-applications";

/**
 * Public submit. `requireAuth: false` so an admin who happens to be logged in
 * doesn't attach their bearer token to an anonymous marketing-form post.
 */
export const submit = (input: AuthorApplicationInput): Promise<Result<{ ok: boolean }>> =>
  api.post(BASE, input, { requireAuth: false });

/* ── admin ── */

export const list = (status?: string): Promise<Result<AuthorApplicationDto[]>> =>
  api.get(BASE, { params: status && status !== "all" ? { status } : undefined, revalidate: false });

export const counts = (): Promise<Result<Record<string, number>>> =>
  api.get(`${BASE}/counts`, { revalidate: false });

export const update = (
  id: string,
  input: { status?: string; notes?: string },
): Promise<Result<AuthorApplicationDto>> => api.patch(`${BASE}/${id}`, input);

export const remove = (id: string): Promise<Result<{ deleted: boolean }>> =>
  api.delete(`${BASE}/${id}`);
