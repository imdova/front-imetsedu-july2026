import { api, type Result } from "@integration/lib/api-client";
import {
  API_STUDENT_REVIEWS,
  API_ADMIN_STUDENT_REVIEWS,
  apiAdminStudentReview,
} from "@integration/constants/api/student-reviews";
import type { StudentReviewDto, StudentReviewBody } from "./types";

const kindParams = (kind?: string) => (kind ? { params: { kind } } : undefined);

export const listPublicReviews = (kind?: string): Promise<Result<StudentReviewDto[]>> =>
  api.get<StudentReviewDto[]>(API_STUDENT_REVIEWS, { requireAuth: false, revalidate: 120, ...kindParams(kind) });

export const listAdminReviews = (kind?: string): Promise<Result<StudentReviewDto[]>> =>
  api.get<StudentReviewDto[]>(API_ADMIN_STUDENT_REVIEWS, kindParams(kind));

export const createReview = (body: StudentReviewBody): Promise<Result<StudentReviewDto>> =>
  api.post<StudentReviewDto>(API_ADMIN_STUDENT_REVIEWS, body);

export const updateReview = (id: string, body: Partial<StudentReviewBody>): Promise<Result<StudentReviewDto>> =>
  api.patch<StudentReviewDto>(apiAdminStudentReview(id), body);

export const deleteReview = (id: string): Promise<Result<{ success: boolean }>> =>
  api.delete<{ success: boolean }>(apiAdminStudentReview(id));
