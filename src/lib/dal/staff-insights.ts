/**
 * LIVE: one staff member's performance KPIs and activity timeline
 * (`/staff-insights/:userId/*`). Admin-only server-side; the admin Users
 * section is already super-admin gated.
 */
import * as svc from "@integration/services/staff-insights";
import type {
  InsightBucket,
  StaffActivityItem,
  StaffActivityKind,
  StaffActivityPage,
  StaffPerformance,
} from "@integration/services/staff-insights";
import type { Result } from "@integration/lib/api-client";

export type { InsightBucket, StaffActivityItem, StaffActivityKind, StaffActivityPage, StaffPerformance };

/** LIVE: KPIs, breakdowns and a daily series over the last `days` days. */
export const fetchStaffPerformance = (userId: string, days = 90): Promise<Result<StaffPerformance>> =>
  svc.performance(userId, days);

/** LIVE: their activity over time, newest first. */
export const fetchStaffActivity = (
  userId: string,
  query: { page?: number; limit?: number; kind?: string; from?: string; to?: string } = {},
): Promise<Result<StaffActivityPage>> => svc.activity(userId, query);
