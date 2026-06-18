/** LMS Management DAL — courses, stats and per-course detail. LIVE. */
import { ok, fail, toMessage, type Result } from "@integration/lib/api-client";
import * as lmsCoursesSvc from "@integration/services/lms-courses";
import * as lmsCategoriesSvc from "@integration/services/lms-categories";
import * as lmsSubCategoriesSvc from "@integration/services/lms-sub-categories";
import type { LmsCourse, LmsStats, LmsCourseDetail, LmsCategory, LmsSubcategory } from "@/lib/db/lms";
import * as assignmentsSvc from "@integration/services/assignments";
import { mapLmsCourse, computeLmsStats, mapLmsCourseDetail, mapLmsCategory, mapLmsSubcategory, mapLmsAssignment, type LmsAssignmentRow } from "@/lib/lms/map-lms";

const arr = <T>(x: unknown): T[] => (Array.isArray(x) ? (x as T[]) : ((x as { data?: T[] })?.data ?? []));

export const fetchLmsCourses = async (): Promise<Result<LmsCourse[]>> => {
  const res = await lmsCoursesSvc.listLmsCourses({ limit: 200 });
  if (!res.ok) return res;
  try {
    return ok(arr<any>(res.data).map(mapLmsCourse));
  } catch (err) {
    return fail(toMessage(err, "Failed to load LMS courses"));
  }
};

export const fetchLmsStats = async (): Promise<Result<LmsStats>> => {
  const res = await lmsCoursesSvc.listLmsCourses({ limit: 200 });
  if (!res.ok) return res;
  try {
    return ok(computeLmsStats(arr<any>(res.data)));
  } catch (err) {
    return fail(toMessage(err, "Failed to load LMS stats"));
  }
};

export const fetchLmsCourse = async (id: string): Promise<Result<LmsCourseDetail | null>> => {
  const res = await lmsCoursesSvc.getLmsCourseById(id);
  if (!res.ok) return res;
  try {
    return ok(res.data ? mapLmsCourseDetail(res.data) : null);
  } catch (err) {
    return fail(toMessage(err, "Failed to load LMS course"));
  }
};

export const fetchLmsCategories = async (): Promise<Result<LmsCategory[]>> => {
  const res = await lmsCategoriesSvc.listLMSCategories();
  if (!res.ok) return res;
  try {
    return ok(arr<any>(res.data).map(mapLmsCategory));
  } catch (err) {
    return fail(toMessage(err, "Failed to load LMS categories"));
  }
};

export const fetchLmsSubcategories = async (): Promise<Result<LmsSubcategory[]>> => {
  const res = await lmsSubCategoriesSvc.listLMSSubCategories();
  if (!res.ok) return res;
  try {
    return ok(arr<any>(res.data).map(mapLmsSubcategory));
  } catch (err) {
    return fail(toMessage(err, "Failed to load LMS sub-categories"));
  }
};

/* ── Assignments (LMS course OR group — LIVE via /assignments?lmsId=|group=) ──
 * A given assignment belongs to exactly one scope: pass `lmsId` for an
 * LMS-course assignment, or `group` for a group assignment — never both,
 * the backend create DTO is scoped to a single owner. */
export const fetchAssignments = async (scope: { lmsId?: string; group?: string }): Promise<Result<LmsAssignmentRow[]>> => {
  const res = await assignmentsSvc.listAssignments({ ...scope, limit: 200 });
  if (!res.ok) return res;
  try {
    return ok(arr<any>(res.data).map(mapLmsAssignment));
  } catch (err) {
    return fail(toMessage(err, "Failed to load assignments"));
  }
};

export const createAssignment = async (input: {
  title: string; dueDate: string; priority?: string; files?: string[]; lmsId?: string; group?: string;
}): Promise<Result<LmsAssignmentRow>> => {
  const res = await assignmentsSvc.createAssignment(input as never);
  if (!res.ok) return res;
  try {
    return ok(mapLmsAssignment(res.data));
  } catch (err) {
    return fail(toMessage(err, "Failed to create assignment"));
  }
};

export const deleteLmsAssignment = (id: string) => assignmentsSvc.deleteAssignment(id);

/* ── Course CRUD (LMS hub) ─────────────────────────────────────────────── */
type CreateCourseInput = Parameters<typeof lmsCoursesSvc.createLmsCourse>[0];
type UpdateCourseInput = Parameters<typeof lmsCoursesSvc.updateLmsCourse>[1];

const mappedCourse = async (
  call: Promise<{ ok: boolean; data?: unknown; error?: string }>,
  msg: string,
): Promise<Result<LmsCourse>> => {
  const res = await call;
  if (!res.ok) return res as Result<LmsCourse>;
  try {
    return ok(mapLmsCourse(res.data));
  } catch (err) {
    return fail(toMessage(err, msg));
  }
};

export const createLmsCourse = (input: CreateCourseInput) =>
  mappedCourse(lmsCoursesSvc.createLmsCourse(input), "Failed to create LMS course");
export const updateLmsCourse = (id: string, input: UpdateCourseInput) =>
  mappedCourse(lmsCoursesSvc.updateLmsCourse(id, input), "Failed to update LMS course");
export const duplicateLmsCourse = (id: string) =>
  mappedCourse(lmsCoursesSvc.duplicateLmsCourse(id), "Failed to duplicate LMS course");
export const toggleLmsCourse = (id: string) =>
  mappedCourse(lmsCoursesSvc.toggleLmsCourseStatus(id), "Failed to toggle status");
export const deleteLmsCourse = (id: string) => lmsCoursesSvc.deleteLmsCourse(id);

/* ── LMS categories / sub-categories (settings) ────────────────────────── */
export const createLmsCategory = async (name: string): Promise<Result<LmsCategory>> => {
  const res = await lmsCategoriesSvc.createLMSCategory({ name });
  if (!res.ok) return res;
  try { return ok(mapLmsCategory(res.data)); } catch (err) { return fail(toMessage(err, "Failed to create category")); }
};
export const renameLmsCategory = async (id: string, name: string): Promise<Result<LmsCategory>> => {
  const res = await lmsCategoriesSvc.updateLMSCategory(id, { name });
  if (!res.ok) return res;
  try { return ok(mapLmsCategory(res.data)); } catch (err) { return fail(toMessage(err, "Failed to update category")); }
};
export const deleteLmsCategory = (id: string) => lmsCategoriesSvc.deleteLMSCategory(id);

export const createLmsSubcategory = async (
  name: string,
  parentId: string,
  parentName?: string,
): Promise<Result<LmsSubcategory>> => {
  const res = await lmsSubCategoriesSvc.createLMSSubCategory({ name, parentCategory: parentId });
  if (!res.ok) return res;
  try {
    const row = mapLmsSubcategory(res.data);
    return ok(row.parentName === "—" && parentName ? { ...row, parentId, parentName } : row);
  } catch (err) {
    return fail(toMessage(err, "Failed to create sub-category"));
  }
};
export const renameLmsSubcategory = async (id: string, name: string): Promise<Result<LmsSubcategory>> => {
  const res = await lmsSubCategoriesSvc.updateLMSSubCategory(id, { name });
  if (!res.ok) return res;
  try { return ok(mapLmsSubcategory(res.data)); } catch (err) { return fail(toMessage(err, "Failed to update sub-category")); }
};
export const deleteLmsSubcategory = (id: string) => lmsSubCategoriesSvc.deleteLMSSubCategory(id);

/* ── Detail tabs: groups / materials / curriculum / students ───────────── */
export const assignLmsGroup = (courseId: string, groupId: string) =>
  lmsCoursesSvc.assignGroupToLmsCourse(courseId, groupId);
export const unassignLmsGroup = (courseId: string, groupId: string) =>
  lmsCoursesSvc.unassignGroupFromLmsCourse(courseId, groupId);

export const addLmsMaterial = (courseId: string, input: { title: string; document: string }) =>
  lmsCoursesSvc.addLmsCourseMaterial(courseId, input);
export const deleteLmsMaterial = (courseId: string, materialId: string) =>
  lmsCoursesSvc.deleteLmsCourseMaterial(courseId, materialId);

export const addLmsModule = async (
  courseId: string,
  title: string,
): Promise<Result<{ id: string; title: string; items: never[] }>> => {
  const res = await lmsCoursesSvc.addLmsModule(courseId, { title });
  if (!res.ok) return res;
  const m = res.data as { _id?: string; id?: string; title?: string };
  return ok({ id: m._id ?? m.id ?? "", title: m.title ?? title, items: [] });
};
export const updateLmsModuleTitle = (courseId: string, moduleId: string, title: string) =>
  lmsCoursesSvc.updateLmsModule(courseId, moduleId, { title });
export const deleteLmsModule = (courseId: string, moduleId: string) =>
  lmsCoursesSvc.deleteLmsModule(courseId, moduleId);

type LessonInput = {
  title?: string;
  type?: "lesson" | "quiz";
  contentType?: "youtube_url" | "vdocipher_embed";
  contentUrl?: string;
};

export const addLmsLesson = async (
  courseId: string,
  moduleId: string,
  input: LessonInput & { title: string },
): Promise<Result<{ id: string; title: string; type: string }>> => {
  const res = await lmsCoursesSvc.addLmsModuleItem(courseId, moduleId, input as never);
  if (!res.ok) return res;
  const it = res.data as { _id?: string; id?: string; title?: string; type?: string };
  return ok({ id: it._id ?? it.id ?? "", title: it.title ?? input.title, type: it.type ?? String(input.type) });
};
export const updateLmsLesson = (
  courseId: string,
  moduleId: string,
  itemId: string,
  input: LessonInput,
) => lmsCoursesSvc.updateLmsModuleItem(courseId, moduleId, itemId, input as never);
export const deleteLmsLesson = (courseId: string, moduleId: string, itemId: string) =>
  lmsCoursesSvc.deleteLmsModuleItem(courseId, moduleId, itemId);

export const assignLmsStudent = (courseId: string, studentId: string) =>
  lmsCoursesSvc.assignStudentToLmsCourse(courseId, studentId);
export const unassignLmsStudent = (courseId: string, studentId: string) =>
  lmsCoursesSvc.unassignStudentFromLmsCourse(courseId, studentId);
