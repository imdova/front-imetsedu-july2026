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
}

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
}

export interface OrientationTeamProgress {
  summary: { assigned: number; completed: number; inProgress: number; notStarted: number; averagePercent: number };
  rows: OrientationTeamRow[];
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
  input: { completed: string[]; lastLessonId?: string; total: number },
): Promise<Result<OrientationProgressDto>> => api.put(`${BASE}/${key}/progress/me`, input);

export const resetMyProgress = (key: string): Promise<Result<OrientationProgressDto>> =>
  api.delete(`${BASE}/${key}/progress/me`);

export const teamProgress = (key: string): Promise<Result<OrientationTeamProgress>> =>
  api.get(`${BASE}/${key}/progress`, { revalidate: false });
