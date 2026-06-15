import { STUDENT_PORTAL } from "@integration/constants/api/student-portal";
import { scheduleEventSchema, type ScheduleEvent } from "@integration/lib/validations/schemas/schedule.schema";
import { api, fail, ok, toMessage, type Result } from "@integration/services/http/client";
import { normalizeStudentSchedule, unwrapSchedulePayload } from "./normalize";
import type { StudentScheduleApiResponse } from "./types";

/**
 * Fetch and normalize the authenticated student's portal schedule.
 * Rendering: client-side fetch (auth token in browser store).
 */
export async function getStudentSchedule(): Promise<Result<ScheduleEvent[]>> {
  const res = await api.get<StudentScheduleApiResponse | { data?: StudentScheduleApiResponse }>(
    STUDENT_PORTAL.SCHEDULE,
  );

  if (!res.ok) {
    return fail(typeof res.error === "string" ? res.error : "Failed to load schedule");
  }

  try {
    const raw = unwrapSchedulePayload(res.data);
    if (!raw) {
      return fail("Invalid schedule response");
    }

    const events = normalizeStudentSchedule(raw);
    events.forEach((e) => scheduleEventSchema.parse(e));
    return ok(events);
  } catch (err) {
    return fail(toMessage(err, "Failed to load schedule"));
  }
}
