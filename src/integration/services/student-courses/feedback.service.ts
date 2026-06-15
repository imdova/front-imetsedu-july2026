import { STUDENT_PORTAL } from "@integration/constants/api/student-portal";
import { getLmsCourseById } from "@integration/services/lms-courses/lms-courses.service";
import { instructorService } from "@integration/services/instructors/instructors.service";
import type { InstructorResponse } from "@integration/services/instructors/types";
import { api, fail, type Result } from "@integration/services/http/client";
import type {
  StudentCourseRatingEntry,
  StudentPortalCourseDetail,
  StudentPortalInstructor,
  SubmitCourseFeedbackInput,
} from "./types";

export interface FeedbackInstructorView {
  id: string;
  name: string;
  title: string;
  imageUrl?: string;
}

function instructorDisplayName(
  inst: InstructorResponse | StudentPortalInstructor,
): string {
  const row = inst as InstructorResponse & StudentPortalInstructor;
  return (
    row.name?.trim() ||
    `${row.firstName ?? ""} ${row.lastName ?? ""}`.trim() ||
    "Instructor"
  );
}

function instructorTitle(
  inst: InstructorResponse | StudentPortalInstructor,
): string {
  const row = inst as InstructorResponse & StudentPortalInstructor;
  return (
    row.professionalTitleEn?.trim() ||
    row.professionalTitle?.trim() ||
    row.role?.trim() ||
    "Instructor"
  );
}

function isMongoObjectId(value: string): boolean {
  return /^[a-f0-9]{24}$/i.test(value);
}

export function extractInstructorId(
  ref: string | StudentPortalInstructor,
): string | null {
  if (typeof ref === "string") {
    const trimmed = ref.trim();
    return trimmed && isMongoObjectId(trimmed) ? trimmed : null;
  }
  const id = ref._id ?? ref.id;
  return typeof id === "string" ? id.trim() || null : null;
}

function instructorNameFromRef(
  ref: string | StudentPortalInstructor,
): string | null {
  if (typeof ref === "string") {
    const trimmed = ref.trim();
    return trimmed && !isMongoObjectId(trimmed) ? trimmed : null;
  }
  return ref.name?.trim() || null;
}

/** Collect instructor IDs from portal/LMS course payloads (same rules as admin LMS). */
export function collectInstructorIdsFromCourse(
  course: StudentPortalCourseDetail | null | undefined,
): string[] {
  if (!course) return [];

  const ids = new Set<string>();

  for (const item of course.instructors ?? []) {
    if (typeof item === "string") {
      const trimmed = item.trim();
      if (trimmed) ids.add(trimmed);
      continue;
    }
    if (item && typeof item === "object") {
      const id = (item._id ?? item.id)?.trim();
      if (id) ids.add(id);
    }
  }

  for (const id of course.instructorIds ?? []) {
    if (id?.trim()) ids.add(id.trim());
  }

  if (course.instructorId?.trim()) {
    ids.add(course.instructorId.trim());
  }

  return [...ids];
}

/** Load each instructor profile via GET /instructors/{id}. */
export async function loadInstructorsByIds(
  ids: string[],
): Promise<FeedbackInstructorView[]> {
  const unique = [...new Set(ids.map((id) => id.trim()).filter(Boolean))];
  if (!unique.length) return [];

  return Promise.all(
    unique.map(async (id) => {
      const res = await instructorService.getById(id);
      if (res.ok) {
        return {
          id: res.data._id ?? id,
          name: instructorDisplayName(res.data),
          title: instructorTitle(res.data),
          imageUrl: res.data.image?.trim() || undefined,
        } satisfies FeedbackInstructorView;
      }

      return {
        id,
        name: "Instructor",
        title: "Instructor",
      } satisfies FeedbackInstructorView;
    }),
  );
}

/** Collect instructor refs from every shape the portal API may return. */
export function normalizeInstructorRefsFromCourse(
  course: StudentPortalCourseDetail | null | undefined,
): Array<string | StudentPortalInstructor> {
  if (!course) return [];

  const refs: Array<string | StudentPortalInstructor> = [];

  for (const item of course.instructors ?? []) {
    refs.push(item);
  }

  for (const id of course.instructorIds ?? []) {
    if (!id) continue;
    const exists = refs.some((ref) => extractInstructorId(ref) === id);
    if (!exists) refs.push(id);
  }

  if (course.instructorId) {
    const exists = refs.some(
      (ref) => extractInstructorId(ref) === course.instructorId,
    );
    if (!exists) refs.push(course.instructorId);
  }

  return refs;
}

function hasPopulatedProfile(ref: StudentPortalInstructor): boolean {
  return Boolean(
    ref.name?.trim() ||
      ref.firstName?.trim() ||
      ref.lastName?.trim(),
  );
}

function extractInstructorList(data: unknown): InstructorResponse[] {
  if (Array.isArray(data)) return data as InstructorResponse[];
  if (data && typeof data === "object") {
    const obj = data as { data?: unknown };
    if (Array.isArray(obj.data)) return obj.data as InstructorResponse[];
    if (obj.data && typeof obj.data === "object") {
      const nested = (obj.data as { data?: unknown }).data;
      if (Array.isArray(nested)) return nested as InstructorResponse[];
    }
  }
  return [];
}

function parseInstructorNamesFromLabel(label: string | undefined): string[] {
  if (!label?.trim() || label === "—") return [];
  return label
    .split(/[,;]|(?:\s+&\s+)|(?:\s+and\s+)/i)
    .map((part) => part.trim())
    .filter(Boolean);
}

function mergeInstructors(
  lists: FeedbackInstructorView[][],
): FeedbackInstructorView[] {
  const merged: FeedbackInstructorView[] = [];
  const seen = new Set<string>();
  for (const list of lists) {
    for (const row of list) {
      if (seen.has(row.id)) continue;
      seen.add(row.id);
      merged.push(row);
    }
  }
  return merged;
}

async function resolveInstructorsByNames(
  names: string[],
): Promise<FeedbackInstructorView[]> {
  const uniqueNames = [...new Set(names.map((name) => name.trim()).filter(Boolean))];
  if (!uniqueNames.length) return [];

  const res = await instructorService.getAll({ limit: 1000 });
  if (!res.ok) return [];

  const catalog = extractInstructorList(res.data);
  const results: FeedbackInstructorView[] = [];
  const seen = new Set<string>();

  for (const name of uniqueNames) {
    const normalized = name.toLowerCase();
    const match = catalog.find((inst) => {
      const display = instructorDisplayName(inst).toLowerCase();
      return (
        display === normalized ||
        display.includes(normalized) ||
        normalized.includes(display)
      );
    });
    if (!match) continue;

    const id = match._id ?? (match as InstructorResponse & { id?: string }).id;
    if (!id || seen.has(id)) continue;
    seen.add(id);

    results.push({
      id,
      name: instructorDisplayName(match),
      title: instructorTitle(match),
    });
  }

  return results;
}

async function loadInstructorsFromRefs(
  refs: Array<string | StudentPortalInstructor>,
): Promise<FeedbackInstructorView[]> {
  const instructors: FeedbackInstructorView[] = [];
  const seen = new Set<string>();
  const nameOnly: string[] = [];

  for (const ref of refs) {
    const nameHint = instructorNameFromRef(ref);
    if (nameHint) {
      nameOnly.push(nameHint);
    }

    const id = extractInstructorId(ref);
    if (!id) {
      continue;
    }
    if (seen.has(id)) continue;
    seen.add(id);

    const res = await instructorService.getById(id);
    if (res.ok) {
      instructors.push({
        id,
        name: instructorDisplayName(res.data),
        title: instructorTitle(res.data),
        imageUrl: res.data.image?.trim() || undefined,
      });
      continue;
    }

    if (typeof ref === "object" && hasPopulatedProfile(ref)) {
      instructors.push({
        id,
        name: instructorDisplayName(ref),
        title: instructorTitle(ref),
      });
      continue;
    }

    const fallbackName =
      typeof ref === "object" && ref?.name?.trim()
        ? ref.name.trim()
        : `Instructor ${id.slice(-4)}`;

    instructors.push({
      id,
      name: fallbackName,
      title: "Instructor",
    });
  }

  const fromNames = await resolveInstructorsByNames(nameOnly);
  return mergeInstructors([instructors, fromNames]);
}

export async function loadCourseFeedbackInstructors(
  refs: Array<string | StudentPortalInstructor> | undefined,
): Promise<FeedbackInstructorView[]> {
  return loadInstructorsFromRefs(refs ?? []);
}

/** Resolve instructors from portal course, LMS course, or header label. */
export async function loadFeedbackInstructorsForCourse(options: {
  courseId: string;
  raw?: StudentPortalCourseDetail | null;
  instructorIds?: string[];
  instructorLabel?: string;
}): Promise<FeedbackInstructorView[]> {
  const portalIds = options.instructorIds?.length
    ? [...new Set(options.instructorIds.map((id) => id.trim()).filter(Boolean))]
    : collectInstructorIdsFromCourse(options.raw);

  if (portalIds.length) {
    return loadInstructorsByIds(portalIds);
  }

  const lmsRes = await getLmsCourseById(options.courseId);
  if (lmsRes.ok) {
    const lmsIds = collectInstructorIdsFromCourse(
      lmsRes.data as StudentPortalCourseDetail,
    );
    if (lmsIds.length) {
      return loadInstructorsByIds(lmsIds);
    }
  }

  const portalRefs = normalizeInstructorRefsFromCourse(options.raw);
  const fromRefs = await loadInstructorsFromRefs(portalRefs);
  if (fromRefs.length) return fromRefs;

  const namesFromRaw = (options.raw?.instructors ?? [])
    .filter(
      (ref): ref is StudentPortalInstructor => typeof ref === "object" && ref !== null,
    )
    .map((ref) => ref.name?.trim())
    .filter((name): name is string => Boolean(name));

  const namesFromLabel = parseInstructorNamesFromLabel(options.instructorLabel);
  const fromNames = await resolveInstructorsByNames([
    ...namesFromRaw,
    ...namesFromLabel,
  ]);
  if (!fromNames.length) return [];

  return loadInstructorsByIds(fromNames.map((row) => row.id));
}

export function mapFeedbackPayloadToRatings(
  payload: SubmitCourseFeedbackInput,
): StudentCourseRatingEntry[] {
  return payload.targets.map((target) => {
    const scores = Object.fromEntries(
      Object.entries(target.ratings).filter(([, value]) => value != null),
    ) as Record<string, number>;

    if (target.key === "academy") {
      return {
        targetType: "academy" as const,
        targetName: target.name,
        scores,
        comment: target.comment?.trim() || undefined,
        submittedAt: payload.submittedAt,
      };
    }

    return {
      targetType: "instructor" as const,
      instructorId: target.key,
      targetName: target.name,
      scores,
      comment: target.comment?.trim() || undefined,
      submittedAt: payload.submittedAt,
    };
  });
}

export async function submitStudentCourseFeedback(
  payload: SubmitCourseFeedbackInput,
): Promise<Result<void>> {
  const ratings = mapFeedbackPayloadToRatings(payload);
  const res = await api.post<{ ok?: boolean }>(
    STUDENT_PORTAL.courseRatings(payload.courseId),
    { ratings },
  );

  if (!res.ok) {
    return fail(typeof res.error === "string" ? res.error : "Failed to submit feedback");
  }

  return { ok: true, data: undefined };
}
