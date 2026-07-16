import { api, type Result } from "@integration/services/http/client";
import type { FreeProgramDto, FreeLectureDto } from "./types";

const PUBLIC = "/free-courses";
const ADMIN = "/admin/free-courses";

/* ── Public (no auth) ──────────────────────────────────────────────────────
 * `requireAuth: false` is load-bearing: without it the client attaches a
 * logged-in admin's bearer token to a public request AND disables ISR
 * (api-client only honours `revalidate` when method === GET && !requireAuth).
 */
export const listPublic = (): Promise<Result<FreeProgramDto[]>> =>
  api.get(PUBLIC, { requireAuth: false, revalidate: 300 });

export const getPublicBySlug = (slug: string): Promise<Result<FreeProgramDto>> =>
  api.get(`${PUBLIC}/${slug}`, { requireAuth: false, revalidate: 120 });

/* ── Admin ── */
export const listAll = (): Promise<Result<FreeProgramDto[]>> =>
  api.get(ADMIN, { revalidate: false });

export const getOne = (id: string): Promise<Result<FreeProgramDto>> =>
  api.get(`${ADMIN}/${id}`, { revalidate: false });

export const create = (input: Record<string, unknown>): Promise<Result<FreeProgramDto>> =>
  api.post(ADMIN, input);

export const update = (id: string, input: Record<string, unknown>): Promise<Result<FreeProgramDto>> =>
  api.patch(`${ADMIN}/${id}`, input);

export const remove = (id: string): Promise<Result<{ success: boolean }>> =>
  api.delete(`${ADMIN}/${id}`);

export const createLecture = (programId: string, input: Record<string, unknown>): Promise<Result<FreeLectureDto>> =>
  api.post(`${ADMIN}/${programId}/lectures`, input);

export const updateLecture = (lectureId: string, input: Record<string, unknown>): Promise<Result<FreeLectureDto>> =>
  api.patch(`${ADMIN}/lectures/${lectureId}`, input);

export const removeLecture = (lectureId: string): Promise<Result<{ success: boolean }>> =>
  api.delete(`${ADMIN}/lectures/${lectureId}`);
