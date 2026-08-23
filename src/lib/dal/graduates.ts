/**
 * Graduates DAL — FULLY LIVE (NestJS `graduates` module).
 * Cohorts = graduation gallery pages at /graduates/:slug; each holds its
 * graduates (name / title / country / photo).
 */
import { ok, type Result } from "@integration/lib/api-client";
import * as svc from "@integration/services/graduates";

export interface Graduate { id: string; name: string; title: string; country: string; photoUrl: string; submittedAt: string }

export interface GraduateCohort {
  id: string;
  name: string;
  slug: string;
  status: "draft" | "published";
  schoolLabel: string;
  programTitle: string;
  programTitleAccent: string;
  kicker: string;
  country: string;
  trainingHours: number;
  classLabel: string;
  classYear: string;
  issuedAt: string;
  footerTitle: string;
  /** Public join form accepts submissions. */
  formEnabled: boolean;
  /** Admin category id ("" = uncategorised). */
  categoryId: string;
  graduates: Graduate[];
  graduatesCount: number;
  previewPhotos: string[];
  views: number;
  createdAt: string;
}

export type GraduateCohortInput = Partial<Omit<GraduateCohort, "id" | "graduates" | "graduatesCount" | "views" | "createdAt">> & {
  graduates?: { id?: string; name: string; title?: string; country?: string; photoUrl?: string }[];
};

const mapGrad = (g: svc.GraduateDto): Graduate => ({
  id: g._id ?? "", name: g.name, title: g.title ?? "", country: g.country ?? "", photoUrl: g.photoUrl ?? "",
  submittedAt: g.submittedAt ? String(g.submittedAt).slice(0, 10) : "",
});
const mapCohort = (d: svc.GraduateCohortDto): GraduateCohort => ({
  id: d._id, name: d.name, slug: d.slug, status: d.status === "published" ? "published" : "draft",
  schoolLabel: d.schoolLabel ?? "", programTitle: d.programTitle ?? "", programTitleAccent: d.programTitleAccent ?? "",
  kicker: d.kicker ?? "", country: d.country ?? "", trainingHours: d.trainingHours ?? 0,
  classLabel: d.classLabel ?? "", classYear: d.classYear ?? "",
  issuedAt: d.issuedAt ? String(d.issuedAt).slice(0, 10) : "",
  footerTitle: d.footerTitle ?? "",
  formEnabled: d.formEnabled !== false,
  categoryId: d.categoryId ? String(d.categoryId) : "",
  graduates: (d.graduates ?? []).map(mapGrad),
  graduatesCount: d.graduatesCount ?? d.graduates?.length ?? 0,
  previewPhotos: d.previewPhotos ?? (d.graduates ?? []).map((g) => g.photoUrl ?? "").filter(Boolean).slice(0, 5),
  views: d.views ?? 0, createdAt: d.createdAt ?? "",
});
const toInput = (i: GraduateCohortInput): svc.GraduateCohortInput => ({
  ...i,
  issuedAt: i.issuedAt === undefined ? undefined : (i.issuedAt || null),
  graduates: i.graduates?.map((g) => ({ _id: g.id || undefined, name: g.name, title: g.title ?? "", country: g.country ?? "", photoUrl: g.photoUrl ?? "" })),
});

/* Admin */
export async function fetchCohorts(): Promise<Result<GraduateCohort[]>> {
  const r = await svc.listCohorts(); return r.ok ? ok(r.data.map(mapCohort)) : r;
}
export async function fetchCohort(id: string): Promise<Result<GraduateCohort>> {
  const r = await svc.getCohort(id); return r.ok ? ok(mapCohort(r.data)) : r;
}
export async function createCohort(input: GraduateCohortInput & { name: string }): Promise<Result<GraduateCohort>> {
  const r = await svc.createCohort(toInput(input)); return r.ok ? ok(mapCohort(r.data)) : r;
}
export async function updateCohort(id: string, input: GraduateCohortInput): Promise<Result<GraduateCohort>> {
  const r = await svc.updateCohort(id, toInput(input)); return r.ok ? ok(mapCohort(r.data)) : r;
}
export async function deleteCohort(id: string): Promise<Result<boolean>> {
  const r = await svc.deleteCohort(id); return r.ok ? ok(true) : r;
}
export async function duplicateCohort(id: string): Promise<Result<GraduateCohort>> {
  const r = await svc.duplicateCohort(id); return r.ok ? ok(mapCohort(r.data)) : r;
}

export async function reorderCohorts(ids: string[]): Promise<Result<boolean>> {
  const r = await svc.reorderCohorts(ids); return r.ok ? ok(true) : r;
}

/* Admin — cohort categories */
export interface GraduateCategory { id: string; name: string; order: number; cohortsCount: number }
const mapCategory = (d: svc.GraduateCategoryDto): GraduateCategory => ({ id: d._id, name: d.name, order: d.order ?? 0, cohortsCount: d.cohortsCount ?? 0 });
export async function fetchCategories(): Promise<Result<GraduateCategory[]>> {
  const r = await svc.listCategories(); return r.ok ? ok(r.data.map(mapCategory)) : r;
}
export async function createCategory(name: string): Promise<Result<GraduateCategory>> {
  const r = await svc.createCategory({ name }); return r.ok ? ok(mapCategory(r.data)) : r;
}
export async function renameCategory(id: string, name: string): Promise<Result<GraduateCategory>> {
  const r = await svc.updateCategory(id, { name }); return r.ok ? ok(mapCategory(r.data)) : r;
}
export async function deleteCategory(id: string): Promise<Result<boolean>> {
  const r = await svc.deleteCategory(id); return r.ok ? ok(true) : r;
}

/* Public */
export async function fetchPublishedCohorts(): Promise<Result<GraduateCohort[]>> {
  const r = await svc.listPublishedCohorts(); return r.ok ? ok(r.data.map(mapCohort)) : r;
}
export async function fetchPublishedCohort(slug: string): Promise<Result<GraduateCohort>> {
  const r = await svc.getPublishedCohort(slug); return r.ok ? ok(mapCohort(r.data)) : r;
}

/* Public join form */
export type JoinInfo = svc.JoinInfoDto;
export async function fetchJoinInfo(slug: string): Promise<Result<JoinInfo>> { return svc.getJoinInfo(slug); }
export async function submitGraduate(
  slug: string,
  input: { firstName: string; lastName: string; country: string; speciality: string; photo: File },
): Promise<Result<{ success: boolean; name: string; cohort: string }>> {
  const form = new FormData();
  form.append("firstName", input.firstName);
  form.append("lastName", input.lastName);
  form.append("country", input.country);
  form.append("speciality", input.speciality);
  form.append("photo", input.photo, input.photo.name);
  return svc.submitGraduate(slug, form);
}
