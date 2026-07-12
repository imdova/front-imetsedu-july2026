/** Students-management DAL — enriched directory + KPI stats. LIVE (GET /students). */
import { ok, fail, toMessage, type Result } from "@integration/lib/api-client";
import * as studentsSvc from "@integration/services/students";
import type { SmStudent, SmStats } from "@/lib/db/students-mgmt";
import { mapStudent, computeSmStats } from "@/lib/admin/map-student";

const arr = <T>(x: unknown): T[] => (Array.isArray(x) ? (x as T[]) : ((x as { data?: T[] })?.data ?? []));

export const fetchSmStudents = async (): Promise<Result<SmStudent[]>> => {
  const res = await studentsSvc.getStudents();
  if (!res.ok) return res;
  try {
    return ok(arr<any>(res.data).map(mapStudent));
  } catch (err) {
    return fail(toMessage(err, "Failed to load students"));
  }
};

/** LIVE: email a "set your password" link to a student (POST /students/send-set-password). */
export const sendStudentSetPassword = async (studentId: string): Promise<Result<boolean>> => {
  const res = await studentsSvc.sendSetPasswordEmail({ studentId });
  return res.ok ? ok(true) : res;
};

export const fetchSmStats = async (): Promise<Result<SmStats>> => {
  const res = await studentsSvc.getStudents();
  if (!res.ok) return res;
  try {
    return ok(computeSmStats(arr<any>(res.data).map(mapStudent)));
  } catch (err) {
    return fail(toMessage(err, "Failed to load student stats"));
  }
};
