/**
 * Course Data Access Layer.
 *
 * The UI imports ONLY from `@/lib/dal/*` — never from `@/lib/db/*` (dummy data)
 * nor `@integration/services/*` (real API). That indirection is the migration
 * seam: to go live, swap the `db.*` calls below for the vendored integration
 * services (e.g. `import { courses } from "@integration/services/courses"`).
 * The `Result<T>` return shape is already identical, so no UI refactor follows.
 */
import { ok, fail, toMessage, type Result } from "@integration/lib/api-client";
import * as coursesSvc from "@integration/services/courses";
import * as db from "@/lib/db/courses";
import { mapCourse } from "@/lib/courses/map-course";
import type { CourseFormData, CourseRow } from "@/types";

/** LIVE: courses from GET /courses (public), mapped to the UI shape. */
export async function fetchCourses(
  params: db.ListCoursesParams = {},
): Promise<Result<CourseRow[]>> {
  const res = await coursesSvc.listCourses({
    limit: 200,
    search: params.search,
    status: params.status && params.status !== "all" ? params.status : undefined,
    categoryId: params.category,
  });
  if (!res.ok) return res;
  try {
    const payload = res.data as unknown as { data?: unknown[] } | unknown[];
    const rows: unknown[] = Array.isArray(payload) ? payload : payload?.data ?? [];
    return ok(rows.map(mapCourse));
  } catch (err) {
    return fail(toMessage(err, "Failed to load courses"));
  }
}

/** LIVE: single course from GET /courses/:id, mapped to the UI shape. */
export async function fetchCourse(
  id: string,
): Promise<Result<CourseRow | null>> {
  const res = await coursesSvc.getCourseById(id);
  if (!res.ok) return res;
  try {
    return ok(res.data ? mapCourse(res.data) : null);
  } catch (err) {
    return fail(toMessage(err, "Failed to load course"));
  }
}

/** Some endpoints wrap the entity in `{ data: ... }`; normalize before mapping. */
const unwrap = (d: unknown): unknown =>
  d && typeof d === "object" && "data" in (d as Record<string, unknown>)
    ? (d as { data: unknown }).data
    : d;

/** LIVE: create a course via POST /courses. The form payload already matches the
 * backend DTO; form-only fields are dropped so strict validation doesn't reject. */
export async function createCourse(
  data: CourseFormData,
): Promise<Result<CourseRow>> {
  const { variables: _v, webhookUrl: _w, courseOverview: _c, ...payload } =
    data as CourseFormData & { variables?: unknown; webhookUrl?: unknown; courseOverview?: unknown };
  const res = await coursesSvc.createCourse(payload);
  if (!res.ok) return res;
  try {
    return ok(mapCourse(unwrap(res.data)));
  } catch (err) {
    return fail(toMessage(err, "Failed to create course"));
  }
}

/** Map a UI-shaped patch (CourseRow fields) to the backend update DTO. */
function toUpdatePayload(patch: Partial<CourseRow>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const pass: (keyof CourseRow)[] = [
    "titleEn", "titleAr", "slug", "category", "difficulty", "status",
    "isFeatured", "isBestseller", "isTopRated",
  ];
  for (const k of pass) if (k in patch) out[k] = patch[k];
  if ("priceEGP" in patch || "salePriceEGP" in patch) {
    out.pricing = { egp: { price: patch.priceEGP, salePrice: patch.salePriceEGP } };
  }
  return out;
}

/** LIVE: update a course via PATCH /courses/:id. */
export async function updateCourse(
  id: string,
  patch: Partial<CourseRow>,
): Promise<Result<CourseRow | null>> {
  const res = await coursesSvc.updateCourse(id, toUpdatePayload(patch));
  if (!res.ok) return res;
  try {
    return ok(res.data ? mapCourse(unwrap(res.data)) : null);
  } catch (err) {
    return fail(toMessage(err, "Failed to update course"));
  }
}

/** LIVE: delete a course via DELETE /courses/:id. */
export async function deleteCourse(id: string): Promise<Result<boolean>> {
  const res = await coursesSvc.deleteCourse(id);
  if (!res.ok) return res;
  return ok(true);
}

/** LIVE: duplicate a course via POST /courses/:id/duplicate. */
export async function duplicateCourse(
  id: string,
): Promise<Result<CourseRow | null>> {
  const res = await coursesSvc.duplicateCourse(id);
  if (!res.ok) return res;
  try {
    return ok(res.data ? mapCourse(unwrap(res.data)) : null);
  } catch (err) {
    return fail(toMessage(err, "Failed to duplicate course"));
  }
}
