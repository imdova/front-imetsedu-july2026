import { api, fail, type Result } from "@integration/services/http/client";

/**
 * Fetch all students from the backend API.
 */
export function getStudents(): Promise<Result<any>> {
  return api.get<any>("/students");
}

/**
 * Fetch a single student by id. Falls back to scanning the list when the
 * dedicated endpoint is unavailable.
 */
export async function fetchStudentById(
  id: string,
): Promise<Result<Record<string, unknown>>> {
  const direct = await api.get<Record<string, unknown>>(`/students/${id}`);
  if (direct.ok) {
    const payload = direct.data as Record<string, unknown> & {
      data?: Record<string, unknown>;
    };
    const row = payload.data ?? payload;
    if (row && typeof row === "object") {
      return { ok: true, data: row as Record<string, unknown> };
    }
  }

  const list = await getStudents();
  if (!list.ok) {
    return fail(
      typeof list.error === "string"
        ? list.error
        : "Failed to load student",
    );
  }

  const arr = Array.isArray(list.data)
    ? list.data
    : (list.data as { data?: unknown[] })?.data;
  if (!Array.isArray(arr)) {
    return fail("Student not found");
  }

  const found = arr.find(
    (s: Record<string, unknown>) =>
      String(s._id ?? s.id) === id,
  );
  if (!found || typeof found !== "object") {
    return fail("Student not found");
  }
  return { ok: true, data: found as Record<string, unknown> };
}

/**
 * Download all students as Excel file (Admin only).
 */
export function downloadStudents(filename: string): Promise<Result<void>> {
  return api.download("/students/download", filename);
}

/**
 * Fetch the current student's portal profile (contains user + lead data).
 */
export function getStudentProfile(): Promise<Result<{ user: any; lead: any }>> {
  return api.get<{ user: any; lead: any }>("/student-portal/profile");
}

/**
 * Update the current student's portal profile.
 */
export function updateStudentProfile(data: any): Promise<Result<any>> {
  return api.patch<any>("/student-portal/profile", data);
}

/**
 * Update the current student's email.
 */
export function updateStudentEmail(email: string): Promise<Result<any>> {
  return api.patch<any>("/student-portal/settings/email", { email });
}

/**
 * Update the current student's password.
 */
export function updateStudentPassword(data: any): Promise<Result<any>> {
  return api.patch<any>("/student-portal/settings/password", data);
}

/**
 * Get the current student's notification preference toggles.
 */
export function getNotificationPreferences(): Promise<Result<any>> {
  return api.get<any>("/student-portal/settings/notification-preferences");
}

/**
 * Update the current student's notification preference toggles.
 */
export function updateNotificationPreferences(data: any): Promise<Result<any>> {
  return api.patch<any>("/student-portal/settings/notification-preferences", data);
}

/**
 * Get all assignments for the student portal.
 */
export function getStudentAssignments(): Promise<Result<any>> {
  return api.get<any>("/student-portal/assignments");
}

/**
 * Submit an assignment.
 */
export function submitAssignment(data: {
  assignmentId: string;
  studentId: string;
  assignmentFileUrl: string;
  notes?: string;
}): Promise<Result<any>> {
  return api.post<any>("/student/assignments/submit", data);
}

/**
 * Get all submissions for the logged-in student.
 */
export function getMySubmissions(): Promise<Result<any>> {
  return api.get<any>("/student/assignments/submissions/my");
}

/**
 * Send a set-password email to a student (Admin only).
 * Provide either studentId or leadId.
 */
export function sendSetPasswordEmail(data: {
  studentId?: string;
  leadId?: string;
}): Promise<Result<any>> {
  return api.post<any>("/students/send-set-password", data);
}
