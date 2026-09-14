/**
 * LIVE: "Write for IMETS" author applications (`/author-applications`).
 *
 * The submit path is public; everything else is admin-only server-side.
 */
import * as svc from "@integration/services/author-applications";
import type {
  AuthorApplicationDto,
  AuthorApplicationInput,
  AuthorApplicationStatus,
} from "@integration/services/author-applications";

import type { Result } from "@integration/lib/api-client";

export type { AuthorApplicationDto, AuthorApplicationInput, AuthorApplicationStatus };

/** LIVE: public — apply to write for the blog. */
export const submitApplication = (input: AuthorApplicationInput): Promise<Result<{ ok: boolean }>> =>
  svc.submit(input);

/** LIVE: admin — list applications, newest first. */
export const fetchApplications = (status?: string): Promise<Result<AuthorApplicationDto[]>> =>
  svc.list(status);

/** LIVE: admin — counts by status. */
export const fetchApplicationCounts = (): Promise<Result<Record<string, number>>> => svc.counts();

/** LIVE: admin — move through the pipeline / save internal notes. */
export const updateApplication = (
  id: string,
  input: { status?: string; notes?: string },
): Promise<Result<AuthorApplicationDto>> => svc.update(id, input);

/** LIVE: admin — delete. */
export const deleteApplication = (id: string): Promise<Result<{ deleted: boolean }>> => svc.remove(id);
