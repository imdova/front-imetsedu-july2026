import { api, type Result } from "@integration/services/http/client";
import type {
  CareerJobDto,
  CareerJobInput,
  CareerJobList,
  CareerJobListParams,
  CareerMatches,
  CareerProfile,
  CareerProfileDto,
} from "./types";

const PUBLIC = "/career-hub/jobs";
const ADMIN = "/career-hub/admin/jobs";
const ME = "/career-hub/me";

/* ── public ── */

/**
 * Anonymous and cached briefly. A new listing should show up within a couple
 * of minutes, not the default five.
 */
export const listJobs = (params: CareerJobListParams = {}): Promise<Result<CareerJobList>> => {
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ""),
  ) as Record<string, string | number>;
  return api.get(PUBLIC, { params: clean, requireAuth: false, revalidate: 120 });
};

export const getJob = (slug: string): Promise<Result<CareerJobDto>> =>
  api.get(`${PUBLIC}/${encodeURIComponent(slug)}`, { requireAuth: false, revalidate: 120 });

/* ── admin ── */

export const adminList = (status?: string): Promise<Result<CareerJobDto[]>> =>
  api.get(ADMIN, { params: status && status !== "all" ? { status } : undefined, revalidate: false });

export const adminCounts = (): Promise<Result<Record<string, number>>> =>
  api.get(`${ADMIN}/counts`, { revalidate: false });

export const create = (input: CareerJobInput): Promise<Result<CareerJobDto>> => api.post(ADMIN, input);

export const update = (id: string, input: Partial<CareerJobInput>): Promise<Result<CareerJobDto>> =>
  api.patch(`${ADMIN}/${id}`, input);

export const remove = (id: string): Promise<Result<{ deleted: boolean }>> => api.delete(`${ADMIN}/${id}`);

/* ── graduate ── */

export const myProfile = (): Promise<Result<CareerProfileDto>> =>
  api.get(`${ME}/profile`, { revalidate: false });

export const saveProfile = (input: CareerProfile): Promise<Result<CareerProfileDto>> =>
  api.put(`${ME}/profile`, input);

export const myMatches = (): Promise<Result<CareerMatches>> => api.get(`${ME}/matches`, { revalidate: false });
