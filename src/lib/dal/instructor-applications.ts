/**
 * LIVE: instructor applications (`/instructor-applications`).
 *
 * The submit path is public; the rest are admin-only server-side.
 */
import * as svc from "@integration/services/instructor-applications";
import type {
  InstructorApplicationDto,
  InstructorApplicationInput,
} from "@integration/services/instructor-applications";

import type { Result } from "@integration/lib/api-client";

export type { InstructorApplicationDto, InstructorApplicationInput };

/** LIVE: public — submit an application to teach. */
export const submitApplication = (
  input: InstructorApplicationInput,
): Promise<Result<{ ok: boolean; id: string }>> => svc.submit(input);

/** LIVE: public — upload a CV. PDF only; the server enforces it. */
export const uploadCv = (
  file: File,
): Promise<Result<{ url: string; originalName: string; size: number }>> =>
  svc.uploadCv(file);

/** LIVE: admin — list applications, newest first. */
export const fetchApplications = (
  status?: string,
): Promise<Result<InstructorApplicationDto[]>> => svc.list(status);

/** LIVE: admin — counts by status. */
export const fetchApplicationCounts = (): Promise<Result<Record<string, number>>> =>
  svc.counts();

/** LIVE: admin — update status / notes. */
export const updateApplication = (
  id: string,
  input: Record<string, unknown>,
): Promise<Result<InstructorApplicationDto>> => svc.update(id, input);

/** LIVE: admin — delete. */
export const deleteApplication = (id: string): Promise<Result<{ deleted: boolean }>> =>
  svc.remove(id);
