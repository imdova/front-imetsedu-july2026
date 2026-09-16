import { api, type Result } from "@integration/services/http/client";

/** Saved training document. Lesson and module shapes are owned by the orientation feature. */
export interface SavedOrientationDto {
  key: string;
  lessons: Record<string, unknown>[];
  content: Record<string, unknown>;
  updatedAt?: string;
  updatedBy?: string | null;
}

/** One learner's progress. `total` is 0 until they first save. */
export interface OrientationProgressDto {
  completed: string[];
  lastLessonId: string | null;
  total: number;
  startedAt: string | null;
  completedAt: string | null;
  updatedAt: string | null;
  /** Gate keys reached inside each lesson, e.g. `{ rules: ["R1"] }`. */
  gates?: Record<string, string[]>;
  quizScore?: number | null;
  quizTotal?: number | null;
  quizAttempts?: number;
  quizPassedAt?: string | null;
  signedOffAt?: string | null;
  /** Best run of each module check, by module id. */
  moduleChecks?: Record<string, OrientationModuleCheckRecord>;
}

export interface OrientationModuleCheckRecord {
  best: number;
  total: number;
  xp: number;
  stars: number;
  attempts: number;
  passedAt: string | null;
}

/** Field-task status across a learner's submissions. */
export type OrientationTaskSummary = "not_sent" | "waiting_review" | "approved";

export type OrientationProgressStatus = "not_started" | "in_progress" | "completed";

export interface OrientationTeamRow {
  userId: string;
  name: string;
  email: string;
  role: string;
  /** Their staff role grants the training permission. */
  assigned: boolean;
  completedCount: number;
  total: number;
  percent: number;
  lastLessonId: string | null;
  startedAt: string | null;
  updatedAt: string | null;
  completedAt: string | null;
  status: OrientationProgressStatus;
  completed?: string[];
  quizScore?: number | null;
  quizTotal?: number | null;
  quizPassedAt?: string | null;
  signedOffAt?: string | null;
  taskStatus?: OrientationTaskSummary;
  moduleChecks?: Record<string, OrientationModuleCheckRecord>;
  /** Sum of the best XP across module checks. */
  xp?: number;
}

export interface OrientationTeamProgress {
  summary: { assigned: number; completed: number; inProgress: number; notStarted: number; averagePercent: number };
  rows: OrientationTeamRow[];
}

export type OrientationTaskStatus = "draft" | "submitted" | "reviewed";

/** A file or voice note attached to a task answer (uploaded via /upload/file). */
export interface OrientationTaskAttachment {
  kind: "file" | "voice";
  url: string;
  name: string;
  mime: string;
  size: number;
  /** Voice notes only. */
  durationSec?: number;
}

/** A learner's answer to a task for one programme: rows keyed by the task's field keys. */
export interface OrientationTaskSubmissionDto {
  _id: string;
  lessonId: string;
  programSlug: string;
  entries: Record<string, string>[];
  attachments?: OrientationTaskAttachment[];
  status: OrientationTaskStatus;
  adminNote?: string;
  submittedAt: string | null;
  reviewedAt: string | null;
  updatedAt?: string;
  /** Admin list only. */
  userId?: string;
  user?: { name: string; email: string };
}

const BASE = "/orientation";

/** `data` is null until the training is first edited. */
export const get = (key: string): Promise<Result<{ data: SavedOrientationDto | null }>> =>
  api.get(`${BASE}/${key}`, { revalidate: false });

export const save = (
  key: string,
  input: { lessons: unknown[]; content: Record<string, unknown> },
): Promise<Result<SavedOrientationDto>> => api.put(`${BASE}/${key}`, input);

export const reset = (key: string): Promise<Result<{ reset: boolean }>> => api.delete(`${BASE}/${key}`);

export const myProgress = (key: string): Promise<Result<OrientationProgressDto>> =>
  api.get(`${BASE}/${key}/progress/me`, { revalidate: false });

export const saveMyProgress = (
  key: string,
  input: { completed: string[]; lastLessonId?: string; total: number; gates?: Record<string, string[]> },
): Promise<Result<OrientationProgressDto>> => api.put(`${BASE}/${key}/progress/me`, input);

export const submitQuiz = (
  key: string,
  input: { score: number; total: number; passMark: number },
): Promise<Result<OrientationProgressDto & { passed: boolean }>> => api.put(`${BASE}/${key}/quiz/me`, input);

/** One employee's full orientation record (admin). */
export interface OrientationEmployeeReport {
  user: {
    userId: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    /** Their role grants the training permission. */
    assigned: boolean;
    isActive: boolean;
    joinedAt: string | null;
  };
  progress: OrientationProgressDto & {
    /** First completion time per lesson id (recorded from 2026-09-16 on). */
    completedLog: Record<string, string>;
    checkRuns: { moduleId: string; score: number; total: number; xp: number; stars: number; passed: boolean; at: string }[];
    quizRuns: { score: number; total: number; passed: boolean; at: string }[];
    signedOffBy: string | null;
    /** False when they never opened the training. */
    exists: boolean;
  };
  tasks: {
    lessonId: string;
    programSlug: string;
    status: OrientationTaskStatus;
    entries: number;
    attachments: number;
    adminNote: string;
    submittedAt: string | null;
    reviewedAt: string | null;
    updatedAt: string | null;
  }[];
}

export const employeeReport = (key: string, userId: string): Promise<Result<OrientationEmployeeReport>> =>
  api.get(`${BASE}/${key}/progress/${encodeURIComponent(userId)}`, { revalidate: false });

export const submitModuleCheck = (
  key: string,
  moduleId: string,
  input: { score: number; total: number; passPercent: number; xp: number; stars: number },
): Promise<Result<OrientationProgressDto & { passed: boolean }>> =>
  api.put(`${BASE}/${key}/checks/${encodeURIComponent(moduleId)}/me`, input);

export const signOff = (key: string, userId: string, signedOff: boolean): Promise<Result<OrientationProgressDto>> =>
  api.patch(`${BASE}/${key}/progress/${encodeURIComponent(userId)}/signoff`, { signedOff });

export const resetMyProgress = (key: string): Promise<Result<OrientationProgressDto>> =>
  api.delete(`${BASE}/${key}/progress/me`);

export const teamProgress = (key: string): Promise<Result<OrientationTeamProgress>> =>
  api.get(`${BASE}/${key}/progress`, { revalidate: false });

export const myTaskSubmissions = (key: string, lessonId?: string): Promise<Result<OrientationTaskSubmissionDto[]>> =>
  api.get(`${BASE}/${key}/tasks/me`, { params: lessonId ? { lessonId } : undefined, revalidate: false });

export const saveMyTaskSubmission = (
  key: string,
  lessonId: string,
  programSlug: string,
  input: { entries: Record<string, string>[]; submit: boolean; attachments?: OrientationTaskAttachment[] },
): Promise<Result<OrientationTaskSubmissionDto>> =>
  api.put(`${BASE}/${key}/tasks/${encodeURIComponent(lessonId)}/${encodeURIComponent(programSlug)}/me`, input);

export const taskSubmissions = (
  key: string,
  query: { lessonId?: string; programSlug?: string } = {},
): Promise<Result<OrientationTaskSubmissionDto[]>> => {
  const params = Object.fromEntries(Object.entries(query).filter(([, v]) => !!v)) as Record<string, string>;
  return api.get(`${BASE}/${key}/tasks`, { params, revalidate: false });
};

export const reviewTaskSubmission = (
  key: string,
  id: string,
  input: { status?: "submitted" | "reviewed"; adminNote?: string },
): Promise<Result<{ _id: string; status: OrientationTaskStatus; adminNote: string; reviewedAt: string | null }>> =>
  api.patch(`${BASE}/${key}/tasks/${id}`, input);
