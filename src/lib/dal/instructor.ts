/**
 * Instructor workspace DAL. UI imports only from here; swap `db.*` for the live
 * integration services to go online without touching components.
 */
import { ok, fail, toMessage, type Result } from "@integration/lib/api-client";
import * as db from "@/lib/db/instructor";

async function wrap<T>(fn: () => Promise<T>, msg: string): Promise<Result<T>> {
  try {
    return ok(await fn());
  } catch (err) {
    return fail(toMessage(err, msg));
  }
}

export const fetchStats = () => wrap(db.getInstructorStats, "Failed to load instructor stats");
export const fetchRevenue = () => wrap(db.getInstructorRevenue, "Failed to load revenue");
export const fetchEvents = () => wrap(db.getInstructorEvents, "Failed to load events");
export const fetchEarnings = () => wrap(db.getInstructorEarnings, "Failed to load earnings");
export const fetchPerformance = () => wrap(db.getCoursePerformance, "Failed to load course performance");
