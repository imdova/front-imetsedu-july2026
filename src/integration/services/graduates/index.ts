import { api, type Result } from "@integration/services/http/client";

const BASE = "/admin/graduates";
const PUBLIC = "/graduates";

export interface GraduateDto { _id?: string; name: string; title?: string; country?: string; photoUrl?: string; submittedAt?: string | null }

export interface GraduateCohortDto {
  _id: string;
  name: string;
  slug: string;
  status: "draft" | "published";
  schoolLabel?: string;
  programTitle?: string;
  programTitleAccent?: string;
  kicker?: string;
  country?: string;
  trainingHours?: number;
  classLabel?: string;
  classYear?: string;
  issuedAt?: string | null;
  footerTitle?: string;
  formEnabled?: boolean;
  categoryId?: string | null;
  graduates?: GraduateDto[];
  /** Present on list endpoints (graduates omitted). */
  graduatesCount?: number;
  /** Public list only: first few graduate photo URLs for card avatar stacks. */
  previewPhotos?: string[];
  views?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type GraduateCohortInput = Partial<Omit<GraduateCohortDto, "_id" | "graduatesCount" | "views" | "createdAt" | "updatedAt">> & { name?: string };

/* Admin — categories */
export interface GraduateCategoryDto { _id: string; name: string; order?: number; cohortsCount?: number }
export const listCategories = (): Promise<Result<GraduateCategoryDto[]>> => api.get(`${BASE}/categories`, { revalidate: false });
export const createCategory = (input: { name: string }): Promise<Result<GraduateCategoryDto>> => api.post(`${BASE}/categories`, input);
export const updateCategory = (id: string, input: { name?: string; order?: number }): Promise<Result<GraduateCategoryDto>> =>
  api.patch(`${BASE}/categories/${id}`, input);
export const deleteCategory = (id: string): Promise<Result<{ success: boolean }>> => api.delete(`${BASE}/categories/${id}`);

/* Admin */
export const listCohorts = (): Promise<Result<GraduateCohortDto[]>> => api.get(BASE, { revalidate: false });
export const getCohort = (id: string): Promise<Result<GraduateCohortDto>> => api.get(`${BASE}/${id}`, { revalidate: false });
export const createCohort = (input: GraduateCohortInput): Promise<Result<GraduateCohortDto>> => api.post(BASE, input);
export const updateCohort = (id: string, input: GraduateCohortInput): Promise<Result<GraduateCohortDto>> => api.patch(`${BASE}/${id}`, input);
export const deleteCohort = (id: string): Promise<Result<{ success: boolean }>> => api.delete(`${BASE}/${id}`);
export const duplicateCohort = (id: string): Promise<Result<GraduateCohortDto>> => api.post(`${BASE}/${id}/duplicate`, {});

/* Public */
export const listPublishedCohorts = (): Promise<Result<GraduateCohortDto[]>> => api.get(PUBLIC, { requireAuth: false, revalidate: false });
export const getPublishedCohort = (slug: string): Promise<Result<GraduateCohortDto>> =>
  api.get(`${PUBLIC}/${encodeURIComponent(slug)}`, { requireAuth: false, revalidate: false });

/* Public join form */
export interface JoinInfoDto { name: string; slug: string; programTitle?: string; programTitleAccent?: string; country?: string; status: string; formEnabled?: boolean }
export const getJoinInfo = (slug: string): Promise<Result<JoinInfoDto>> =>
  api.get(`${PUBLIC}/${encodeURIComponent(slug)}/join`, { requireAuth: false, revalidate: false });
export const submitGraduate = (slug: string, form: FormData): Promise<Result<{ success: boolean; name: string; cohort: string }>> =>
  api.post(`${PUBLIC}/${encodeURIComponent(slug)}/submissions`, form, { requireAuth: false });
