import { api, type Result } from "@integration/services/http/client";
import { COURSES_API } from "@integration/constants/api/courses";
import type { CourseStats, CourseRegistrationsResponse } from "./types";
import type { Course } from "@integration/types/course";

export function listCourses(query?: any): Promise<Result<Course[]>> {
  return api.get<Course[]>(COURSES_API.LIST, { params: query, requireAuth: false, revalidate: 300 });
}

export function getCourseById(id: string): Promise<Result<any>> {
  return api.get<any>(COURSES_API.GET_BY_ID(id));
}

export function getCourseBySlug(slug: string): Promise<Result<any>> {
  return api.get<any>(COURSES_API.GET_BY_SLUG(slug));
}

export function getCourseStats(): Promise<Result<CourseStats>> {
  return api.get<CourseStats>(COURSES_API.STATS);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createCourse(data: any): Promise<Result<any>> {
  return api.post(COURSES_API.CREATE, data);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function updateCourse(id: string, data: any): Promise<Result<any>> {
  return api.patch(COURSES_API.UPDATE(id), data);
}

export function deleteCourse(id: string): Promise<Result<any>> {
  return api.delete(COURSES_API.DELETE(id));
}

export function duplicateCourse(id: string): Promise<Result<any>> {
  return api.post(COURSES_API.DUPLICATE(id), {});
}

export function listCourseRegistrations(params?: any): Promise<Result<CourseRegistrationsResponse>> {
  return api.get<CourseRegistrationsResponse>(COURSES_API.REGISTRATIONS, { params });
}

export function downloadRegistrations(filename: string, params?: any): Promise<Result<void>> {
  return api.download(COURSES_API.REGISTRATIONS_EXPORT, filename, { params });
}


