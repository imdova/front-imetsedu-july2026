import { api, type Result } from "@integration/services/http/client";
import { API_LMS_COURSES, apiLmsCourseById, apiLmsCourseDuplicate } from "@integration/constants/api/lms-courses";
import {
  type LmsCourse,
  type LmsCourseListResponse,
  type CreateLmsCourseInput,
  type UpdateLmsCourseInput,
  type LmsModule,
  type LmsModuleItem,
  LmsModuleItemType,
  LmsLessonContentType,
} from "./types";

export function createLmsCourse(
  input: CreateLmsCourseInput
): Promise<Result<LmsCourse>> {
  return api.post<LmsCourse>(API_LMS_COURSES, input);
}

export function listLmsCourses(params: any = {}): Promise<Result<LmsCourseListResponse>> {
  return api.get<LmsCourseListResponse>(API_LMS_COURSES, { params });
}

export function getLmsCourseById(id: string): Promise<Result<LmsCourse>> {
  return api.get<LmsCourse>(apiLmsCourseById(id));
}

export function updateLmsCourse(
  id: string,
  input: UpdateLmsCourseInput
): Promise<Result<LmsCourse>> {
  return api.patch<LmsCourse>(apiLmsCourseById(id), input);
}

export function deleteLmsCourse(id: string): Promise<Result<void>> {
  return api.delete<void>(apiLmsCourseById(id));
}

export function duplicateLmsCourse(id: string): Promise<Result<LmsCourse>> {
  return api.post<LmsCourse>(apiLmsCourseDuplicate(id), {});
}

export function toggleLmsCourseStatus(id: string): Promise<Result<LmsCourse>> {
  return api.patch<LmsCourse>(`${apiLmsCourseById(id)}/toggle-status`, {});
}

export function assignGroupToLmsCourse(
  courseId: string,
  groupId: string
): Promise<Result<void>> {
  return api.post<void>(`${apiLmsCourseById(courseId)}/groups/${groupId}`, {});
}

export function unassignGroupFromLmsCourse(
  courseId: string,
  groupId: string
): Promise<Result<void>> {
  return api.delete<void>(`${apiLmsCourseById(courseId)}/groups/${groupId}`);
}

// ── Modules ──────────────────────────────────────────────────────────

export function addLmsModule(
  courseId: string,
  input: { title: string; items?: any[] }
): Promise<Result<LmsModule>> {
  return api.post<LmsModule>(`${apiLmsCourseById(courseId)}/modules`, input);
}

export function updateLmsModule(
  courseId: string,
  moduleId: string,
  input: { title?: string }
): Promise<Result<LmsModule>> {
  return api.patch<LmsModule>(`${apiLmsCourseById(courseId)}/modules/${moduleId}`, input);
}

export function deleteLmsModule(
  courseId: string,
  moduleId: string
): Promise<Result<void>> {
  return api.delete<void>(`${apiLmsCourseById(courseId)}/modules/${moduleId}`);
}

// ── Module Items ──────────────────────────────────────────────────────

export function addLmsModuleItem(
  courseId: string,
  moduleId: string,
  input: {
    title: string;
    type: LmsModuleItemType;
    contentType?: LmsLessonContentType;
    contentUrl?: string;
    quiz?: string;
  }
): Promise<Result<LmsModuleItem>> {
  return api.post<LmsModuleItem>(`${apiLmsCourseById(courseId)}/modules/${moduleId}/items`, input);
}

export function updateLmsModuleItem(
  courseId: string,
  moduleId: string,
  itemId: string,
  input: {
    title?: string;
    type?: LmsModuleItemType;
    contentType?: LmsLessonContentType;
    contentUrl?: string;
    quiz?: string;
  }
): Promise<Result<LmsModuleItem>> {
  return api.patch<LmsModuleItem>(`${apiLmsCourseById(courseId)}/modules/${moduleId}/items/${itemId}`, input);
}

export function deleteLmsModuleItem(
  courseId: string,
  moduleId: string,
  itemId: string
): Promise<Result<void>> {
  return api.delete<void>(`${apiLmsCourseById(courseId)}/modules/${moduleId}/items/${itemId}`);
}

// ── Course Materials ──────────────────────────────────────────────────

export function addLmsCourseMaterial(
  courseId: string,
  input: {
    title: string;
    document: string;
  }
): Promise<Result<any>> {
  return api.post<any>(`${apiLmsCourseById(courseId)}/materials`, input);
}

export function updateLmsCourseMaterial(
  courseId: string,
  materialId: string,
  input: {
    title?: string;
    document?: string;
  }
): Promise<Result<any>> {
  return api.patch<any>(`${apiLmsCourseById(courseId)}/materials/${materialId}`, input);
}

export function deleteLmsCourseMaterial(
  courseId: string,
  materialId: string
): Promise<Result<void>> {
  return api.delete<void>(`${apiLmsCourseById(courseId)}/materials/${materialId}`);
}

export function assignStudentToLmsCourse(
  courseId: string,
  studentId: string
): Promise<Result<void>> {
  return api.post<void>(`${apiLmsCourseById(courseId)}/students`, { studentId });
}

export function unassignStudentFromLmsCourse(
  courseId: string,
  studentId: string
): Promise<Result<void>> {
  return api.delete<void>(`${apiLmsCourseById(courseId)}/students/${studentId}`);
}

export function downloadLmsCourse(id: string, filename: string): Promise<Result<void>> {
  return api.download(`${apiLmsCourseById(id)}/download`, filename);
}

