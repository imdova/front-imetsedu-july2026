/** Free-courses DAL — LIVE against the NestJS `free-courses` module. */
import { ok, type Result } from "@integration/lib/api-client";
import * as svc from "@integration/services/free-courses";

export type VideoProvider = "youtube" | "vdocipher";

export interface FreeLecture {
  id: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  videoProvider: VideoProvider;
  videoUrl: string;
  durationMinutes: number;
  resourceUrl: string;
  order: number;
  isPublished: boolean;
}

export interface FreeProgram {
  id: string;
  titleEn: string;
  titleAr: string;
  slug: string;
  descriptionEn: string;
  descriptionAr: string;
  thumbnailUrl: string;
  order: number;
  isPublished: boolean;
  seoTitle: string;
  seoDescription: string;
  lectureCount: number;
  lectures: FreeLecture[];
}

export type FreeProgramInput = {
  titleEn: string;
  titleAr: string;
  slug: string;
  descriptionEn?: string;
  descriptionAr?: string;
  thumbnailUrl?: string;
  order?: number;
  isPublished?: boolean;
  seoTitle?: string;
  seoDescription?: string;
};

export type FreeLectureInput = {
  titleEn: string;
  titleAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  videoProvider?: VideoProvider;
  videoUrl?: string;
  durationMinutes?: number;
  resourceUrl?: string;
  order?: number;
  isPublished?: boolean;
};

const mapLecture = (d: svc.FreeLectureDto): FreeLecture => ({
  id: d._id,
  titleEn: d.titleEn,
  titleAr: d.titleAr,
  descriptionEn: d.descriptionEn ?? "",
  descriptionAr: d.descriptionAr ?? "",
  videoProvider: (d.videoProvider as VideoProvider) ?? "youtube",
  videoUrl: d.videoUrl ?? "",
  durationMinutes: d.durationMinutes ?? 0,
  resourceUrl: d.resourceUrl ?? "",
  order: d.order ?? 0,
  isPublished: d.isPublished !== false,
});

const map = (d: svc.FreeProgramDto): FreeProgram => ({
  id: d._id,
  titleEn: d.titleEn,
  titleAr: d.titleAr,
  slug: d.slug,
  descriptionEn: d.descriptionEn ?? "",
  descriptionAr: d.descriptionAr ?? "",
  thumbnailUrl: d.thumbnailUrl ?? "",
  order: d.order ?? 0,
  isPublished: !!d.isPublished,
  seoTitle: d.seoTitle ?? "",
  seoDescription: d.seoDescription ?? "",
  lectureCount: d.lectureCount ?? d.lectures?.length ?? 0,
  lectures: (d.lectures ?? []).map(mapLecture),
});

/* ── Public ── */

export async function fetchFreePrograms(): Promise<Result<FreeProgram[]>> {
  const res = await svc.listPublic();
  return res.ok ? ok(res.data.map(map)) : res;
}

export async function fetchFreeProgram(slug: string): Promise<Result<FreeProgram>> {
  const res = await svc.getPublicBySlug(slug);
  return res.ok ? ok(map(res.data)) : res;
}

/* ── Admin ── */

export async function fetchAllFreePrograms(): Promise<Result<FreeProgram[]>> {
  const res = await svc.listAll();
  return res.ok ? ok(res.data.map(map)) : res;
}

export async function fetchFreeProgramById(id: string): Promise<Result<FreeProgram>> {
  const res = await svc.getOne(id);
  return res.ok ? ok(map(res.data)) : res;
}

export async function createFreeProgram(input: FreeProgramInput): Promise<Result<FreeProgram>> {
  const res = await svc.create(input);
  return res.ok ? ok(map(res.data)) : res;
}

export async function updateFreeProgram(id: string, input: Partial<FreeProgramInput>): Promise<Result<FreeProgram>> {
  const res = await svc.update(id, input);
  return res.ok ? ok(map(res.data)) : res;
}

export async function deleteFreeProgram(id: string): Promise<Result<boolean>> {
  const res = await svc.remove(id);
  return res.ok ? ok(true) : res;
}

export async function createFreeLecture(programId: string, input: FreeLectureInput): Promise<Result<FreeLecture>> {
  const res = await svc.createLecture(programId, input);
  return res.ok ? ok(mapLecture(res.data)) : res;
}

export async function updateFreeLecture(lectureId: string, input: Partial<FreeLectureInput>): Promise<Result<FreeLecture>> {
  const res = await svc.updateLecture(lectureId, input);
  return res.ok ? ok(mapLecture(res.data)) : res;
}

export async function deleteFreeLecture(lectureId: string): Promise<Result<boolean>> {
  const res = await svc.removeLecture(lectureId);
  return res.ok ? ok(true) : res;
}
