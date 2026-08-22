/**
 * Graduates DAL — FULLY LIVE (NestJS `graduates` module).
 * Cohorts = graduation gallery pages at /graduates/:slug; each holds its
 * graduates (name / title / country / photo).
 */
import { ok, type Result } from "@integration/lib/api-client";
import * as svc from "@integration/services/graduates";

export interface Graduate { id: string; name: string; title: string; country: string; photoUrl: string }

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
  graduates: Graduate[];
  graduatesCount: number;
  views: number;
  createdAt: string;
}

export type GraduateCohortInput = Partial<Omit<GraduateCohort, "id" | "graduates" | "graduatesCount" | "views" | "createdAt">> & {
  graduates?: { id?: string; name: string; title?: string; country?: string; photoUrl?: string }[];
};

const mapGrad = (g: svc.GraduateDto): Graduate => ({
  id: g._id ?? "", name: g.name, title: g.title ?? "", country: g.country ?? "", photoUrl: g.photoUrl ?? "",
});
const mapCohort = (d: svc.GraduateCohortDto): GraduateCohort => ({
  id: d._id, name: d.name, slug: d.slug, status: d.status === "published" ? "published" : "draft",
  schoolLabel: d.schoolLabel ?? "", programTitle: d.programTitle ?? "", programTitleAccent: d.programTitleAccent ?? "",
  kicker: d.kicker ?? "", country: d.country ?? "", trainingHours: d.trainingHours ?? 0,
  classLabel: d.classLabel ?? "", classYear: d.classYear ?? "",
  issuedAt: d.issuedAt ? String(d.issuedAt).slice(0, 10) : "",
  footerTitle: d.footerTitle ?? "",
  graduates: (d.graduates ?? []).map(mapGrad),
  graduatesCount: d.graduatesCount ?? d.graduates?.length ?? 0,
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

/* Public */
export async function fetchPublishedCohorts(): Promise<Result<GraduateCohort[]>> {
  const r = await svc.listPublishedCohorts(); return r.ok ? ok(r.data.map(mapCohort)) : r;
}
export async function fetchPublishedCohort(slug: string): Promise<Result<GraduateCohort>> {
  const r = await svc.getPublishedCohort(slug); return r.ok ? ok(mapCohort(r.data)) : r;
}
