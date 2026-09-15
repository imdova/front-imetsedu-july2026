/**
 * LIVE: orientation training (`/orientation/:key`) — editable content and
 * learner progress.
 *
 * Reading content and your own progress needs a signed-in user; saving content,
 * resetting it and the team progress view are admin-only server-side. No saved
 * content ⇒ `null`, and the page falls back to the content bundled with the app.
 */
import * as svc from "@integration/services/orientation";
import type {
  OrientationProgressDto,
  OrientationProgressStatus,
  OrientationTeamProgress,
  OrientationTeamRow,
  SavedOrientationDto,
} from "@integration/services/orientation";
import { ok, type Result } from "@integration/lib/api-client";

export type {
  OrientationProgressDto,
  OrientationProgressStatus,
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
}): Promise<Result<OrientationProgressDto>> => svc.saveMyProgress(SALES, input);

/** LIVE: start the training over. */
export const resetMyOrientationProgress = (): Promise<Result<OrientationProgressDto>> => svc.resetMyProgress(SALES);

/** LIVE: admin — everyone on the training and how far they've got. */
export const fetchTeamOrientationProgress = (): Promise<Result<OrientationTeamProgress>> => svc.teamProgress(SALES);
