/**
 * LIVE: orientation training (`/orientation/:key`) — editable content, learner
 * progress and task answers.
 *
 * Reading content, your own progress and your own task answers needs a
 * signed-in user; saving content, resetting it, team progress and reviewing
 * task answers are admin-only server-side. No saved content ⇒ `null`, and the
 * page falls back to the content bundled with the app.
 */
import * as svc from "@integration/services/orientation";
import type {
  OrientationEmployeeReport,
  OrientationModuleCheckRecord,
  OrientationProgressDto,
  OrientationProgressStatus,
  OrientationTaskAttachment,
  OrientationTaskStatus,
  OrientationTaskSubmissionDto,
  OrientationTaskSummary,
  OrientationTeamProgress,
  OrientationTeamRow,
  SavedOrientationDto,
} from "@integration/services/orientation";
import { ok, type Result } from "@integration/lib/api-client";

export type {
  OrientationEmployeeReport,
  OrientationModuleCheckRecord,
  OrientationProgressDto,
  OrientationProgressStatus,
  OrientationTaskAttachment,
  OrientationTaskStatus,
  OrientationTaskSubmissionDto,
  OrientationTaskSummary,
  OrientationTeamProgress,
  OrientationTeamRow,
  SavedOrientationDto,
};

const SALES = "sales";

/** LIVE: saved Sales Orientation, or null when it has never been edited. */
export async function fetchSalesOrientation(): Promise<Result<SavedOrientationDto | null>> {
  const res = await svc.get(SALES);
  return res.ok ? ok(res.data?.data ?? null) : res;
}

/** LIVE: admin — save the whole training document. */
export const saveSalesOrientation = (input: {
  lessons: unknown[];
  content: Record<string, unknown>;
}): Promise<Result<SavedOrientationDto>> => svc.save(SALES, input);

/** LIVE: admin — discard edits and return to the bundled content. */
export const resetSalesOrientation = (): Promise<Result<{ reset: boolean }>> => svc.reset(SALES);

/** LIVE: the signed-in user's Sales Orientation progress. */
export const fetchMyOrientationProgress = (): Promise<Result<OrientationProgressDto>> => svc.myProgress(SALES);

/** LIVE: replace the signed-in user's completed lessons (and where they are). */
export const saveMyOrientationProgress = (input: {
  completed: string[];
  lastLessonId?: string;
  total: number;
  gates?: Record<string, string[]>;
}): Promise<Result<OrientationProgressDto>> => svc.saveMyProgress(SALES, input);

/** LIVE: record a knowledge-check attempt; the first pass notifies admins for sign-off. */
export const submitOrientationQuiz = (input: { score: number; total: number; passMark: number }) =>
  svc.submitQuiz(SALES, input);

/** LIVE: admin — one employee's detailed orientation report. */
export const fetchOrientationEmployeeReport = (userId: string) => svc.employeeReport(SALES, userId);

/** LIVE: record a run of a module check; the best score, XP and stars are kept. */
export const submitOrientationModuleCheck = (
  moduleId: string,
  input: { score: number; total: number; passPercent: number; xp: number; stars: number },
) => svc.submitModuleCheck(SALES, moduleId, input);

/** LIVE: admin — sign a learner off (or withdraw the sign-off). */
export const signOffOrientation = (userId: string, signedOff: boolean): Promise<Result<OrientationProgressDto>> =>
  svc.signOff(SALES, userId, signedOff);

/** LIVE: start the training over. */
export const resetMyOrientationProgress = (): Promise<Result<OrientationProgressDto>> => svc.resetMyProgress(SALES);

/** LIVE: admin — everyone on the training and how far they've got. */
export const fetchTeamOrientationProgress = (): Promise<Result<OrientationTeamProgress>> => svc.teamProgress(SALES);

/** LIVE: the signed-in user's answers to a task lesson (all programmes). */
export const fetchMyTaskSubmissions = (lessonId: string): Promise<Result<OrientationTaskSubmissionDto[]>> =>
  svc.myTaskSubmissions(SALES, lessonId);

/** LIVE: save a draft (`submit: false`) or submit the signed-in user's answer for one programme. */
export const saveMyTaskSubmission = (
  lessonId: string,
  programSlug: string,
  input: { entries: Record<string, string>[]; submit: boolean; attachments?: OrientationTaskAttachment[] },
): Promise<Result<OrientationTaskSubmissionDto>> => svc.saveMyTaskSubmission(SALES, lessonId, programSlug, input);

/** LIVE: admin — submitted answers from the team for a task. */
export const fetchTaskSubmissions = (query: {
  lessonId?: string;
  programSlug?: string;
}): Promise<Result<OrientationTaskSubmissionDto[]>> => svc.taskSubmissions(SALES, query);

/** LIVE: admin — mark reviewed / reopen, and leave a note the learner sees. */
export const reviewTaskSubmission = (
  id: string,
  input: { status?: "submitted" | "reviewed"; adminNote?: string },
) => svc.reviewTaskSubmission(SALES, id, input);
