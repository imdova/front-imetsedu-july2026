/**
 * LIVE: Career Hub (`/career-hub/*`).
 *
 * Listings are curated by admins — there is no jobs feed behind them. Browsing
 * and the employer vacancy form are public; the profile and matches belong to
 * the signed-in graduate; everything under `admin` is super-admin only.
 */
import * as svc from "@integration/services/career-hub";
import type {
  CareerJobDto,
  CareerJobFacets,
  CareerJobInput,
  CareerJobList,
  CareerJobListParams,
  CareerJobStatus,
  CareerMatch,
  CareerMatchGap,
  CareerMatchReason,
  CareerMatches,
  CareerOverview,
  CareerProfile,
  CareerProfileAdminParams,
  CareerProfileAdminRow,
  CareerProfileDto,
  CareerVacancyDto,
  CareerVacancyInput,
  CareerVacancyStatus,
} from "@integration/services/career-hub";

import type { Result } from "@integration/lib/api-client";

export type {
  CareerJobDto,
  CareerJobFacets,
  CareerJobInput,
  CareerJobList,
  CareerJobListParams,
  CareerJobStatus,
  CareerMatch,
  CareerMatchGap,
  CareerMatchReason,
  CareerMatches,
  CareerOverview,
  CareerProfile,
  CareerProfileAdminParams,
  CareerProfileAdminRow,
  CareerProfileDto,
  CareerVacancyDto,
  CareerVacancyInput,
  CareerVacancyStatus,
};

/** LIVE: public — open listings with filter facets. */
export const fetchJobs = (params?: CareerJobListParams): Promise<Result<CareerJobList>> => svc.listJobs(params);

/** LIVE: public — one open listing (404 once closed or expired). */
export const fetchJob = (slug: string): Promise<Result<CareerJobDto>> => svc.getJob(slug);

/** LIVE: public — employer submits a vacancy for review. */
export const submitVacancy = (input: CareerVacancyInput): Promise<Result<{ ok: boolean }>> =>
  svc.submitVacancy(input);

/** LIVE: admin — supply, demand and submissions at a glance. */
export const fetchCareerOverview = (): Promise<Result<CareerOverview>> => svc.overview();

/** LIVE: admin — graduate career profiles with contact details and match counts. */
export const fetchCareerProfiles = (params?: CareerProfileAdminParams): Promise<Result<CareerProfileAdminRow[]>> =>
  svc.adminProfiles(params);

/** LIVE: admin — every listing, any status. */
export const fetchAdminJobs = (status?: string): Promise<Result<CareerJobDto[]>> => svc.adminList(status);

/** LIVE: admin — counts by status, plus published-but-expired. */
export const fetchAdminJobCounts = (): Promise<Result<Record<string, number>>> => svc.adminCounts();

/** LIVE: admin. */
export const createJob = (input: CareerJobInput): Promise<Result<CareerJobDto>> => svc.create(input);

/** LIVE: admin. */
export const updateJob = (id: string, input: Partial<CareerJobInput>): Promise<Result<CareerJobDto>> =>
  svc.update(id, input);

/** LIVE: admin. */
export const deleteJob = (id: string): Promise<Result<{ deleted: boolean }>> => svc.remove(id);

/** LIVE: admin — employer vacancy submissions. */
export const fetchVacancies = (status?: string): Promise<Result<CareerVacancyDto[]>> => svc.adminVacancies(status);

/** LIVE: admin. */
export const fetchVacancyCounts = (): Promise<Result<Record<string, number>>> => svc.vacancyCounts();

/** LIVE: admin. */
export const fetchVacancy = (id: string): Promise<Result<CareerVacancyDto>> => svc.adminVacancy(id);

/** LIVE: admin — review status, notes, or the listing it became. */
export const updateVacancy = (
  id: string,
  input: { status?: CareerVacancyStatus; notes?: string; jobId?: string },
): Promise<Result<CareerVacancyDto>> => svc.updateVacancy(id, input);

/** LIVE: admin. */
export const deleteVacancy = (id: string): Promise<Result<{ deleted: boolean }>> => svc.removeVacancy(id);

/** LIVE: graduate — own preferences (prefilled from the account on first visit). */
export const fetchMyCareerProfile = (): Promise<Result<CareerProfileDto>> => svc.myProfile();

/** LIVE: graduate. */
export const saveMyCareerProfile = (input: CareerProfile): Promise<Result<CareerProfileDto>> =>
  svc.saveProfile(input);

/** LIVE: graduate — open listings ranked against the saved profile. */
export const fetchMyCareerMatches = (): Promise<Result<CareerMatches>> => svc.myMatches();
