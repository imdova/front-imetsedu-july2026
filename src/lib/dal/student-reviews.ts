/** Student reviews DAL — LIVE. Public success-stories page + admin management,
 * backed by the NestJS `student-reviews` module. */
import { ok, type Result } from "@integration/lib/api-client";
import * as svc from "@integration/services/student-reviews";
import type { StudentReview, StudentReviewInput, ReviewKind } from "@/lib/db/student-reviews";

const map = (d: svc.StudentReviewDto): StudentReview => ({
  id: d._id,
  kind: d.kind,
  studentName: d.studentName ?? "",
  role: d.role ?? "",
  country: d.country ?? "",
  caption: d.caption ?? "",
  videoUrl: d.videoUrl ?? "",
  orientation: d.orientation ?? "landscape",
  imageUrl: d.imageUrl ?? "",
  rank: d.rank ?? 0,
  isPublished: d.isPublished ?? true,
});

export async function fetchPublicReviews(kind?: ReviewKind): Promise<Result<StudentReview[]>> {
  const res = await svc.listPublicReviews(kind);
  return res.ok ? ok(res.data.map(map)) : res;
}

export async function fetchAdminReviews(kind?: ReviewKind): Promise<Result<StudentReview[]>> {
  const res = await svc.listAdminReviews(kind);
  return res.ok ? ok(res.data.map(map)) : res;
}

export async function createReview(input: StudentReviewInput): Promise<Result<StudentReview>> {
  const res = await svc.createReview(input);
  return res.ok ? ok(map(res.data)) : res;
}

export async function updateReview(id: string, patch: Partial<StudentReviewInput>): Promise<Result<StudentReview>> {
  const res = await svc.updateReview(id, patch);
  return res.ok ? ok(map(res.data)) : res;
}

export async function deleteReview(id: string): Promise<Result<boolean>> {
  const res = await svc.deleteReview(id);
  return res.ok ? ok(true) : res;
}
