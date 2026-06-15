import { STUDENT_PORTAL } from "@integration/constants/api/student-portal";
import { api, fail, toMessage, type Result } from "@integration/services/http/client";
import {
  findFirstLessonSlug,
  normalizeCourseCard,
  normalizeCourseDetailInfo,
  normalizeCurriculum,
  normalizeMaterials,
  unwrapCourseDetail,
  unwrapCourseList,
} from "./normalize";
import type {
  CourseDetailInfo,
  CurriculumModule,
  MyCourseCard,
  StudyMaterialsModule,
} from "./view-models";
import type {
  StudentPortalCourseDetail,
  StudentPortalCourseListItem,
} from "./types";
export interface StudentCourseDetailView {
  raw: StudentPortalCourseDetail;
  course: CourseDetailInfo;
  curriculum: CurriculumModule[];
  materials: StudyMaterialsModule[];
  firstLessonSlug: string | null;
}

export async function getStudentCourses(): Promise<Result<MyCourseCard[]>> {
  const res = await api.get<
    StudentPortalCourseListItem[] | { data?: StudentPortalCourseListItem[] }
  >(STUDENT_PORTAL.COURSES);

  if (!res.ok) {
    return fail(typeof res.error === "string" ? res.error : "Failed to load courses");
  }

  try {
    const list = unwrapCourseList(res.data);
    return { ok: true, data: list.map(normalizeCourseCard) };
  } catch (err) {
    return fail(toMessage(err, "Failed to load courses"));
  }
}

export async function getStudentCourseById(
  id: string,
  storedProgress?: number | null,
): Promise<Result<StudentCourseDetailView>> {
  const res = await api.get<
    StudentPortalCourseDetail | { data?: StudentPortalCourseDetail }
  >(STUDENT_PORTAL.courseDetail(id));

  if (!res.ok) {
    return fail(typeof res.error === "string" ? res.error : "Failed to load course");
  }

  try {
    const raw = unwrapCourseDetail(res.data);
    if (!raw) {
      return fail("Course not found");
    }

    return {
      ok: true,
      data: {
        raw,
        course: normalizeCourseDetailInfo(raw, storedProgress),
        curriculum: normalizeCurriculum(raw.modules),
        materials: normalizeMaterials(raw.materials),
        firstLessonSlug: findFirstLessonSlug(raw.modules),
      },
    };
  } catch (err) {
    return fail(toMessage(err, "Failed to load course"));
  }
}

export async function updateCourseProgress(
  courseId: string,
  progress: number,
): Promise<Result<void>> {
  const clamped = Math.min(100, Math.max(0, Math.round(progress)));
  const res = await api.patch<void>(STUDENT_PORTAL.courseProgress(courseId), {
    progress: clamped,
  });
  if (!res.ok) {
    return fail(typeof res.error === "string" ? res.error : "Failed to update progress");
  }
  return { ok: true, data: undefined };
}

export async function getStudentCourseRaw(
  id: string,
): Promise<Result<StudentPortalCourseDetail>> {
  const res = await getStudentCourseById(id);
  if (!res.ok) return res;
  return { ok: true, data: res.data.raw };
}
