/**
 * Student-portal DAL — enrolments, schedule, grades, certificates, quiz,
 * notifications. UI imports here only; swap for the integration
 * `student-portal` / `student-courses` / `quizzes` services to go live.
 */
import { ok, fail, toMessage, api, type Result } from "@integration/lib/api-client";
import {
  fetchStudentQuizForCourse, startAttempt, saveAnswers, submitAttempt,
  getMyLatestAttempt, type QuizAttemptData,
} from "@integration/services/quizzes";
import type { QuizAttemptResult, MyAttemptsResponse } from "@integration/types/quiz";
import { updateStudentPassword } from "@integration/services/students";
import { uploadFile } from "@integration/services/upload";
import * as db from "@/lib/db/student";
import type {
  EnrolledCourse, ScheduleEvent, Grade, Certificate, Notification,
  StudentAssignment, InstallmentLine, TranscriptRow,
} from "@/lib/db/student";
import { mapStudentDashboard, type StudentDashboardVM } from "@/lib/student/map-dashboard";
import { mapStudentProfile, toUpdateProfileDto, type StudentProfile, type StudentProfileForm } from "@/lib/student/map-profile";
import {
  mapEnrolledCourse, mapSchedule, mapCertificate, mapStudentNotification,
  mapStudentAssignment, mapInstallment, mapTranscriptRow, mapGradesFromTranscripts,
} from "@/lib/student/map-portal";
import type { AssignmentKpis } from "@/lib/db/student";

async function wrap<T>(fn: () => Promise<T>, msg: string): Promise<Result<T>> {
  try {
    return ok(await fn());
  } catch (err) {
    return fail(toMessage(err, msg));
  }
}

const arr = <T>(x: unknown): T[] => (Array.isArray(x) ? (x as T[]) : ((x as { data?: T[]; payments?: T[] })?.data ?? (x as { payments?: T[] })?.payments ?? []));

/** Wraps a live `/student-portal/*` GET + mapper into a Result. */
async function live<T>(path: string, map: (raw: unknown) => T, msg: string): Promise<Result<T>> {
  const res = await api.get<unknown>(path);
  if (!res.ok) return res;
  try {
    return ok(map(res.data));
  } catch (err) {
    return fail(toMessage(err, msg));
  }
}

/** LIVE: student dashboard from GET /student-portal/dashboard (USER-role token). */
export const fetchDashboard = async (): Promise<Result<StudentDashboardVM>> => {
  const res = await api.get<unknown>("/student-portal/dashboard");
  if (!res.ok) return res;
  try {
    return ok(mapStudentDashboard(res.data));
  } catch (err) {
    return fail(toMessage(err, "Failed to load dashboard"));
  }
};
export const fetchCourses = (): Promise<Result<EnrolledCourse[]>> =>
  live("/student-portal/courses", (d) => arr<unknown>(d).map(mapEnrolledCourse), "Failed to load courses");
export const fetchCourse = (slug: string): Promise<Result<EnrolledCourse | null>> =>
  live(`/student-portal/courses/${slug}`, (d) => (d ? mapEnrolledCourse(d) : null), "Failed to load course");
export const fetchSchedule = (): Promise<Result<ScheduleEvent[]>> =>
  live("/student-portal/schedule", mapSchedule, "Failed to load schedule");
export const fetchGrades = (): Promise<Result<Grade[]>> =>
  live("/student-portal/transcripts", (d) => mapGradesFromTranscripts(arr<unknown>(d)), "Failed to load grades");
export const fetchCertificates = (): Promise<Result<Certificate[]>> =>
  live("/student-portal/certificates", (d) => arr<unknown>(d).map(mapCertificate), "Failed to load certificates");
export const fetchNotifications = (): Promise<Result<Notification[]>> =>
  live("/student-portal/notifications", (d) => arr<unknown>(d).map(mapStudentNotification), "Failed to load notifications");
export const markAllRead = async (): Promise<Result<{ ok: true }>> => {
  const res = await api.patch<unknown>("/student-portal/notifications/mark-all-read");
  return res.ok ? ok({ ok: true }) : res;
};
export const fetchAssignments = (): Promise<Result<StudentAssignment[]>> =>
  live("/student-portal/assignments", (d) => arr<unknown>(d).map(mapStudentAssignment), "Failed to load assignments");
export const fetchAssignment = (id: string): Promise<Result<StudentAssignment | null>> =>
  live(`/student-portal/assignments/${id}`, (d) => (d ? mapStudentAssignment(d) : null), "Failed to load assignment");

export interface AssignmentsWithKpis {
  assignments: StudentAssignment[];
  kpis: AssignmentKpis;
}
export const fetchAssignmentsWithKpis = async (): Promise<Result<AssignmentsWithKpis>> => {
  const res = await api.get<unknown>("/student-portal/assignments");
  if (!res.ok) return res;
  try {
    const raw = res.data as any;
    const rawArr = Array.isArray(raw) ? raw : (raw?.data ?? []);
    return ok({
      assignments: rawArr.map(mapStudentAssignment),
      kpis: {
        inProgress: raw?.kpis?.inProgress ?? 0,
        deadlines: raw?.kpis?.deadlines ?? 0,
        averageGrade: raw?.kpis?.averageGrade ?? 0,
      },
    });
  } catch (err) {
    return fail(toMessage(err, "Failed to load assignments"));
  }
};
export const fetchInstallments = (): Promise<Result<InstallmentLine[]>> =>
  live("/student-portal/payments", (d) => arr<unknown>(d).map(mapInstallment), "Failed to load installments");
export const fetchTranscript = (): Promise<Result<TranscriptRow[]>> =>
  live("/student-portal/transcripts", (d) => arr<unknown>(d).map(mapTranscriptRow), "Failed to load transcript");

/** LIVE: student profile from GET /student-portal/profile, mapped. */
export const fetchProfile = (): Promise<Result<StudentProfile>> =>
  live("/student-portal/profile", mapStudentProfile, "Failed to load profile");

/** LIVE: save profile via PATCH /student-portal/profile. */
export const updateProfile = async (form: StudentProfileForm): Promise<Result<StudentProfile>> => {
  const res = await api.patch<unknown>("/student-portal/profile", toUpdateProfileDto(form));
  if (!res.ok) return res;
  try {
    return ok(mapStudentProfile(res.data));
  } catch (err) {
    return fail(toMessage(err, "Failed to save profile"));
  }
};

export interface CourseRatingScores { overall: number; support?: number; platform?: number; materials?: number; communication?: number; }

/** LIVE: submit course feedback — POST /student-portal/courses/:id/ratings. */
export const submitCourseRating = async (
  courseId: string,
  scores: CourseRatingScores,
  comment?: string,
): Promise<Result<{ ok: true }>> => {
  const body = { ratings: [{ targetType: "academy", targetName: "IMETS Academy", scores, comment, submittedAt: new Date().toISOString() }] };
  const res = await api.post<unknown>(`/student-portal/courses/${courseId}/ratings`, body);
  return res.ok ? ok({ ok: true }) : res;
};

/** LIVE: submit an assignment — POST /student-portal/assignments/:id/submit. */
export const submitAssignment = async (
  id: string,
  input: { assignmentFileUrl: string; notes?: string },
): Promise<Result<{ ok: true }>> => {
  const res = await api.post<unknown>(`/student-portal/assignments/${id}/submit`, input);
  return res.ok ? ok({ ok: true }) : res;
};

/** LIVE: upload a file (e.g. an assignment submission) → returns its URL. */
export const uploadStudentFile = async (file: File): Promise<Result<string>> => {
  const res = await uploadFile(file);
  return res.ok ? ok(res.data.url) : res;
};

/** LIVE: change password — PATCH /student-portal/settings/password. */
export const changePassword = async (
  currentPassword: string,
  newPassword: string,
  confirmPassword: string,
): Promise<Result<{ ok: true }>> => {
  const res = await updateStudentPassword({ currentPassword, newPassword, confirmPassword });
  return res.ok ? ok({ ok: true }) : res;
};

/** LIVE: PATCH progress (0-100) to /student-portal/courses/:id/progress. */
export const updateCourseProgress = async (courseId: string, progress: number): Promise<Result<void>> => {
  const clamped = Math.min(100, Math.max(0, Math.round(progress)));
  const res = await api.patch<void>(`/student-portal/courses/${courseId}/progress`, { progress: clamped });
  return res.ok ? ok(undefined) : res;
};

/* ── Quiz (LIVE via /quizzes/* attempt lifecycle) ── */
export type { QuizAttemptData };
export type StudentQuizResult = QuizAttemptResult;

/** LIVE: load a quiz (questions + course context) for the student runner. */
export const fetchQuiz = (
  courseId: string,
  quizId: string,
  locale: "en" | "ar" = "en",
): Promise<Result<QuizAttemptData>> => fetchStudentQuizForCourse(courseId, quizId, locale);

/** LIVE: open a fresh attempt — POST /quizzes/:id/attempts. Returns the attempt id. */
export const startQuizAttempt = (quizId: string): Promise<Result<QuizAttemptResult>> =>
  startAttempt(quizId);

/** LIVE: persist selected answers — PATCH /quizzes/:id/attempts/:attemptId/answers. */
export const saveQuizAnswers = (
  quizId: string,
  attemptId: string,
  answers: Array<{ questionId: string; selectedChoiceIds: string[] }>,
): Promise<Result<unknown>> => saveAnswers(quizId, attemptId, answers);

/** LIVE: submit + grade — POST /quizzes/:id/attempts/:attemptId/submit. */
export const submitQuizAttempt = (
  quizId: string,
  attemptId: string,
): Promise<Result<QuizAttemptResult>> => submitAttempt(quizId, attemptId);

/** LIVE: how many attempts the student has already used — GET /quizzes/:id/attempts/me. */
export const fetchQuizAttempts = (quizId: string): Promise<Result<MyAttemptsResponse>> =>
  getMyLatestAttempt(quizId);

// No backend equivalent yet — remain on dummy data.
export const fetchPaymentMethods = () => wrap(db.getPaymentMethods, "Failed to load payment methods");
export const fetchFavorites = () => wrap(db.getFavorites, "Failed to load favorites");
