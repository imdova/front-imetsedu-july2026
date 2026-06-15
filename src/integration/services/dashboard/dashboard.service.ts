import { api, type Result } from "@integration/services/http/client";
import { DASHBOARD_API } from "@integration/constants/api/dashboard";
import type {
  ActiveBatch,
  DashboardAlert,
  DashboardStats,
  LmsOverview,
  PipelineStage,
  RecentTransaction,
  RevenueTrend,
  StudentByCountry,
  TopCourse,
  TopCounselor,
} from "./types";

export function getDashboardStats(days?: number): Promise<Result<DashboardStats>> {
  return api.get<DashboardStats>(
    DASHBOARD_API.STATS,
    days ? { params: { days } } : undefined,
  );
}

export function getRevenueTrend(days = 14): Promise<Result<RevenueTrend>> {
  return api.get<RevenueTrend>(DASHBOARD_API.REVENUE_TREND, { params: { days } });
}

export function getLmsOverview(): Promise<Result<LmsOverview>> {
  return api.get<LmsOverview>(DASHBOARD_API.LMS_OVERVIEW);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractArray(raw: unknown): any[] {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    for (const key of [
      "data",
      "stages",
      "items",
      "results",
      "courses",
      "counselors",
      "batches",
      "transactions",
      "countries",
      "alerts",
    ]) {
      if (Array.isArray(obj[key])) return obj[key] as unknown[];
    }
  }
  return [];
}

export async function getTopCourses(): Promise<Result<TopCourse[]>> {
  const res = await api.get<unknown>(DASHBOARD_API.TOP_COURSES);
  if (!res.ok) return res;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { ok: true, data: extractArray(res.data).map((r: any, i: number) => ({
    id: r.id ?? r._id ?? String(i),
    name: r.name ?? r.title ?? r.courseName ?? "",
    category: r.category ?? r.categoryName ?? "",
    enrollment: Number(r.enrollment ?? r.enrolledStudents ?? r.students ?? 0),
    revenue: Number(r.revenue ?? r.totalRevenue ?? 0),
  })) };
}

export async function getTopCounselors(): Promise<Result<TopCounselor[]>> {
  const res = await api.get<unknown>(DASHBOARD_API.TOP_COUNSELORS);
  if (!res.ok) return res;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { ok: true, data: extractArray(res.data).map((r: any, i: number) => ({
    name: r.name ?? r.counselorName ?? String(i),
    totalLeads: Number(r.totalLeads ?? r.leads ?? r.total ?? 0),
    enrolled: Number(r.enrolled ?? r.enrolledLeads ?? 0),
    conversionRate: Number(r.conversionRate ?? r.convRate ?? r.rate ?? 0),
  })) };
}

export async function getActiveBatches(): Promise<Result<ActiveBatch[]>> {
  const res = await api.get<unknown>(DASHBOARD_API.ACTIVE_BATCHES);
  if (!res.ok) return res;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { ok: true, data: extractArray(res.data).map((r: any, i: number) => ({
    id: r.id ?? r._id ?? String(i),
    title: r.title ?? r.name ?? "",
    status: r.status ?? "active",
    students: Number(r.students ?? r.enrolledStudents ?? r.currentEnrollment ?? 0),
    capacity: Number(r.capacity ?? r.maxCapacity ?? r.maxStudents ?? 0),
    startDate: r.startDate ?? r.start_date ?? "",
  })) };
}

export async function getRecentTransactions(): Promise<Result<RecentTransaction[]>> {
  const res = await api.get<unknown>(DASHBOARD_API.RECENT_TRANSACTIONS);
  if (!res.ok) return res;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { ok: true, data: extractArray(res.data).map((r: any, i: number) => ({
    id: r.id ?? r._id ?? String(i),
    customerName: r.customerName ?? r.customer?.name ?? r.studentName ?? "",
    courseName: r.courseName ?? r.item?.name ?? r.course?.title ?? r.productName ?? "",
    amount: Number(r.amount ?? r.total ?? 0),
    currency: r.currency ?? "USD",
    status: r.status ?? "pending",
    date: r.date ?? r.createdAt ?? new Date().toISOString(),
  })) };
}

export async function getLeadPipeline(): Promise<Result<PipelineStage[]>> {
  const res = await api.get<unknown>(DASHBOARD_API.LEAD_PIPELINE);
  if (!res.ok) return res;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { ok: true, data: extractArray(res.data).map((r: any, i: number) => ({
    stage: r.stage ?? r.name ?? String(i),
    label: r.label ?? r.stageName ?? r.name ?? r.stage ?? "",
    count: Number(r.count ?? r.total ?? 0),
    percentage: Number(r.percentage ?? r.percent ?? 0),
  })) };
}

export async function getStudentsByCountry(): Promise<Result<StudentByCountry[]>> {
  const res = await api.get<unknown>(DASHBOARD_API.STUDENTS_BY_COUNTRY);
  if (!res.ok) return res;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { ok: true, data: extractArray(res.data).map((r: any, i: number) => ({
    country: r.country ?? r.countryName ?? r.name ?? "",
    code: r.code ?? r.countryCode ?? r.iso ?? String(i),
    count: Number(r.count ?? r.total ?? r.students ?? 0),
    percentage: Number(r.percentage ?? r.percent ?? 0),
  })) };
}

export async function getDashboardAlerts(): Promise<Result<DashboardAlert[]>> {
  const res = await api.get<unknown>(DASHBOARD_API.ALERTS);
  if (!res.ok) return res;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { ok: true, data: extractArray(res.data).map((r: any) => ({
    id: r.id ?? r._id ?? String(Math.random()),
    type: (r.type ?? "info") as DashboardAlert["type"],
    label: r.label ?? "",
    title: r.title ?? "",
    description: r.description ?? r.message ?? "",
    buttonLabel: r.buttonLabel ?? r.actionLabel ?? r.cta ?? "View",
    href: r.href ?? r.url ?? r.actionUrl,
  })) };
}

export function exportDashboardReport(): Promise<Result<void>> {
  return api.download(DASHBOARD_API.EXPORT, "dashboard-report.xlsx");
}
