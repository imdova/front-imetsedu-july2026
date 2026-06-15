/**
 * Platform-overview DAL — KPI tiles, revenue series, reports, demand charts,
 * moderation queues and audit events for the dashboard.
 */
import { ok, fail, toMessage, api, type Result } from "@integration/lib/api-client";
import * as db from "@/lib/db/platform";
import { mapKpis } from "@/lib/admin/map-platform";

async function wrap<T>(fn: () => Promise<T>, msg: string): Promise<Result<T>> {
  try {
    return ok(await fn());
  } catch (err) {
    return fail(toMessage(err, msg));
  }
}

/** LIVE: KPI cards from GET /dashboard/stats (the cards with a backend source). */
export const fetchKpis = async (): Promise<Result<db.Kpi[]>> => {
  const res = await api.get<unknown>("/dashboard/stats");
  if (!res.ok) return res;
  try {
    return ok(mapKpis(res.data));
  } catch (err) {
    return fail(toMessage(err, "Failed to load KPIs"));
  }
};
export const fetchRevenueSeries = () =>
  wrap(db.getRevenueSeries, "Failed to load revenue");
export const fetchOpenReports = () =>
  wrap(db.getOpenReports, "Failed to load reports");
export const fetchCountryBars = () =>
  wrap(db.getCountryBars, "Failed to load country data");
export const fetchCategoryBars = () =>
  wrap(db.getCategoryBars, "Failed to load category data");
export const fetchVerificationQueue = () =>
  wrap(db.getVerificationQueue, "Failed to load queue");
export const fetchReviewQueue = () =>
  wrap(db.getReviewQueue, "Failed to load queue");
export const fetchAuditEvents = () =>
  wrap(db.getAuditEvents, "Failed to load audit events");
