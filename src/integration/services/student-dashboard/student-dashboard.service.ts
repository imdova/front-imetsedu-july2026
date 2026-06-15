import { STUDENT_PORTAL } from "@integration/constants/api/student-portal";
import { api, fail, toMessage, type Result } from "@integration/services/http/client";
import { normalizeStudentDashboard } from "./normalize";
import type { StudentDashboardApiResponse } from "./types";
import type { StudentDashboardView } from "./view-models";

/**
 * Fetch authenticated student dashboard overview.
 * Rendering: client-side fetch (auth token in browser store).
 */
export async function getStudentDashboard(): Promise<Result<StudentDashboardView>> {
  const res = await api.get<
    StudentDashboardApiResponse | { data?: StudentDashboardApiResponse }
  >(STUDENT_PORTAL.DASHBOARD);

  if (!res.ok) {
    return fail(
      typeof res.error === "string" ? res.error : "Failed to load dashboard",
    );
  }

  try {
    return { ok: true, data: normalizeStudentDashboard(res.data) };
  } catch (err) {
    return fail(toMessage(err, "Failed to load dashboard"));
  }
}
