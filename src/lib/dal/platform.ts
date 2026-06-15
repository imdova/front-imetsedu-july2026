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

const STAGE_CANON: Record<string, string> = {
  new_inquiries: "new", new: "new", contacted: "contacted", qualified: "contacted",
  waiting_payment: "waiting_payment", waiting: "waiting_payment", enrolled: "enrolled", lost: "lost",
};

/** LIVE: top courses by revenue (GET /dashboard/top-courses). */
export const fetchTopCourses = async (): Promise<Result<db.TopCourse[]>> => {
  const res = await api.get<any[]>("/dashboard/top-courses", { params: { limit: 5 } });
  if (!res.ok) return res;
  return ok((res.data ?? []).map((c) => ({
    name: c?.courseName ?? "—", revenue: c?.revenue ?? 0, enrollments: c?.enrollments ?? 0,
  })));
};

/** LIVE: top sales counselors (GET /dashboard/top-counselors). */
export const fetchTopCounselors = async (): Promise<Result<db.DashCounselor[]>> => {
  const res = await api.get<any[]>("/dashboard/top-counselors", { params: { limit: 5 } });
  if (!res.ok) return res;
  return ok((res.data ?? []).map((c) => ({
    name: c?.counselorName ?? "Unassigned", image: c?.counselorImage,
    totalLeads: c?.totalLeads ?? 0, enrolled: c?.enrolled ?? 0, conversionRate: c?.conversionRate ?? 0,
  })));
};

/** LIVE: recent transactions (GET /dashboard/recent-transactions). */
export const fetchRecentTransactions = async (): Promise<Result<db.RecentTxn[]>> => {
  const res = await api.get<any[]>("/dashboard/recent-transactions", { params: { limit: 6 } });
  if (!res.ok) return res;
  return ok((res.data ?? []).map((x) => ({
    id: String(x?.invoiceId ?? ""), number: x?.invoiceNumber ?? "—", customer: x?.customerName ?? "—",
    amount: x?.amount ?? 0, currency: x?.currency ?? "EGP", status: String(x?.status ?? "").toLowerCase(),
  })));
};

/** LIVE: lead pipeline distribution (GET /dashboard/lead-pipeline), collapsed to canonical stages. */
export const fetchLeadPipeline = async (): Promise<Result<db.PipelineRow[]>> => {
  const res = await api.get<any[]>("/dashboard/lead-pipeline");
  if (!res.ok) return res;
  const order = ["new", "contacted", "waiting_payment", "enrolled", "lost"];
  const counts: Record<string, number> = {};
  let total = 0;
  for (const r of res.data ?? []) {
    const key = STAGE_CANON[r?.stage] ?? "new";
    counts[key] = (counts[key] ?? 0) + (r?.count ?? 0);
    total += r?.count ?? 0;
  }
  return ok(order.map((key) => ({
    key, count: counts[key] ?? 0,
    percentage: total ? Math.round(((counts[key] ?? 0) / total) * 100) : 0,
  })));
};

/** LIVE: priority alerts / AI insights (GET /dashboard/alerts). */
export const fetchAlerts = async (): Promise<Result<db.DashAlert[]>> => {
  const res = await api.get<any[]>("/dashboard/alerts");
  if (!res.ok) return res;
  return ok((res.data ?? []).map((a) => ({
    type: a?.type ?? "watchlist", title: a?.title ?? "", description: a?.description ?? "",
    action: a?.action ?? "", link: a?.link ?? "#",
  })));
};

/** LIVE: LMS courses overview (GET /dashboard/lms-overview). */
export const fetchLmsOverview = async (): Promise<Result<db.LmsOverview>> => {
  const res = await api.get<any>("/dashboard/lms-overview");
  if (!res.ok) return res;
  return ok({
    active: res.data?.active ?? 0, draft: res.data?.draft ?? 0,
    totalStudents: res.data?.totalStudents ?? 0, avgCompletion: res.data?.averageContentCompletion ?? 0,
  });
};

/** LIVE: students/leads grouped by country (GET /dashboard/students-by-country). */
export const fetchStudentsByCountry = async (): Promise<Result<db.CountryStat[]>> => {
  const res = await api.get<any[]>("/dashboard/students-by-country", { params: { limit: 8 } });
  if (!res.ok) return res;
  return ok((res.data ?? []).map((c) => ({ country: c?.country ?? "—", count: c?.count ?? 0 })));
};

/** LIVE: active group batches (GET /dashboard/active-batches). */
export const fetchActiveBatches = async (): Promise<Result<db.ActiveBatch[]>> => {
  const res = await api.get<any[]>("/dashboard/active-batches", { params: { limit: 6 } });
  if (!res.ok) return res;
  return ok((res.data ?? []).map((b) => ({ title: b?.title ?? "—", enrolled: b?.enrolled ?? 0, capacity: b?.capacity ?? 0 })));
};
