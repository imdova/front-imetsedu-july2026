import { api, type Result } from "@integration/services/http/client";
import type {
  CareerJobDto,
  CareerJobInput,
  CareerJobList,
  CareerJobListParams,
  CareerMatches,
  CareerOverview,
  CareerProfile,
  CareerProfileAdminParams,
  CareerProfileAdminRow,
  CareerProfileDto,
  CareerVacancyDto,
  CareerVacancyInput,
  CareerVacancyStatus,
} from "./types";

const PUBLIC = "/career-hub/jobs";
const ADMIN = "/career-hub/admin";
const ME = "/career-hub/me";

const compact = (params: object) =>
  Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ""),
  ) as Record<string, string | number>;

/* ── public ── */

/**
 * Anonymous and cached briefly. A new listing should show up within a couple
 * of minutes, not the default five.
 */
export const listJobs = (params: CareerJobListParams = {}): Promise<Result<CareerJobList>> =>
  api.get(PUBLIC, { params: compact(params), requireAuth: false, revalidate: 120 });

export const getJob = (slug: string): Promise<Result<CareerJobDto>> =>
  api.get(`${PUBLIC}/${encodeURIComponent(slug)}`, { requireAuth: false, revalidate: 120 });

/** Employer vacancy form — anonymous, so a logged-in admin's token isn't attached. */
export const submitVacancy = (input: CareerVacancyInput): Promise<Result<{ ok: boolean }>> =>
  api.post("/career-hub/vacancies", input, { requireAuth: false });

/* ── admin: overview + profiles ── */

export const overview = (): Promise<Result<CareerOverview>> => api.get(`${ADMIN}/overview`, { revalidate: false });

export const adminProfiles = (params: CareerProfileAdminParams = {}): Promise<Result<CareerProfileAdminRow[]>> =>
  api.get(`${ADMIN}/profiles`, { params: compact(params), revalidate: false });

/* ── admin: jobs ── */

export const adminList = (status?: string): Promise<Result<CareerJobDto[]>> =>
  api.get(`${ADMIN}/jobs`, { params: status && status !== "all" ? { status } : undefined, revalidate: false });

export const adminCounts = (): Promise<Result<Record<string, number>>> =>
  api.get(`${ADMIN}/jobs/counts`, { revalidate: false });

export const create = (input: CareerJobInput): Promise<Result<CareerJobDto>> => api.post(`${ADMIN}/jobs`, input);

export const update = (id: string, input: Partial<CareerJobInput>): Promise<Result<CareerJobDto>> =>
  api.patch(`${ADMIN}/jobs/${id}`, input);

export const remove = (id: string): Promise<Result<{ deleted: boolean }>> => api.delete(`${ADMIN}/jobs/${id}`);

/* ── admin: vacancies ── */

export const adminVacancies = (status?: string): Promise<Result<CareerVacancyDto[]>> =>
  api.get(`${ADMIN}/vacancies`, { params: status && status !== "all" ? { status } : undefined, revalidate: false });

export const vacancyCounts = (): Promise<Result<Record<string, number>>> =>
  api.get(`${ADMIN}/vacancies/counts`, { revalidate: false });

export const adminVacancy = (id: string): Promise<Result<CareerVacancyDto>> =>
  api.get(`${ADMIN}/vacancies/${id}`, { revalidate: false });

export const updateVacancy = (
  id: string,
  input: { status?: CareerVacancyStatus; notes?: string; jobId?: string },
): Promise<Result<CareerVacancyDto>> => api.patch(`${ADMIN}/vacancies/${id}`, input);

export const removeVacancy = (id: string): Promise<Result<{ deleted: boolean }>> =>
  api.delete(`${ADMIN}/vacancies/${id}`);

/* ── graduate ── */

export const myProfile = (): Promise<Result<CareerProfileDto>> =>
  api.get(`${ME}/profile`, { revalidate: false });

export const saveProfile = (input: CareerProfile): Promise<Result<CareerProfileDto>> =>
  api.put(`${ME}/profile`, input);

export const myMatches = (): Promise<Result<CareerMatches>> => api.get(`${ME}/matches`, { revalidate: false });
