/**
 * Maps backend group documents (`GET /groups`) to the UI group shapes. Pure +
 * client-safe.
 */
import type { GroupRow, GroupStats, GroupDetail, RosterStudent, GroupStatus, RosterPayment } from "@/lib/db/groups";

function fmtDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? (iso || "—") : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function mapStatus(s?: string): GroupStatus {
  const v = String(s ?? "").toLowerCase();
  if (v === "inprogress" || v === "in_progress" || v === "active") return "inprogress";
  if (v === "finished" || v === "completed") return "finished";
  return "pending";
}

export function mapGroupRow(raw: any): GroupRow {
  const sched = raw?.schedule?.[0] ?? {};
  return {
    id: raw?._id ?? raw?.id,
    title: raw?.title ?? "—",
    category: raw?.category?.name ?? raw?.category?.nameEn ?? "—",
    subcategory: raw?.subcategory?.name ?? raw?.subcategory?.nameEn ?? "—",
    createdAt: fmtDate(raw?.createdAt),
    startDate: fmtDate(raw?.startDate),
    endDate: fmtDate(raw?.endDate),
    startTime: sched.startTime ?? "",
    endTime: sched.endTime ?? "",
    status: mapStatus(raw?.status),
    students: raw?.numberOfStudents ?? raw?.students?.length ?? 0,
    revenue: raw?.revenue ?? raw?.collected ?? 0,
  };
}

function mapRoster(entry: any): RosterStudent {
  const s = entry?.student ?? {};
  const total = entry?.totalFee ?? 0;
  const paid = entry?.paidAmount ?? 0;
  const payment: RosterPayment = total > 0 ? (paid >= total ? "paid" : paid > 0 ? "partial" : "pending") : "pending";
  return {
    id: s?._id ?? s?.id ?? entry?._id ?? "",
    name: s?.name ?? "—",
    email: s?.email ?? "",
    phone: s?.number ?? s?.phone ?? "",
    enrolledDate: fmtDate(entry?.enrolledDate ?? entry?.createdAt),
    country: s?.country ?? "—",
    leadSource: s?.leadSource ?? entry?.leadSource ?? "—",
    progress: entry?.progress ?? 0,
    status: entry?.status === false ? "pending" : "approved",
    payment,
    due: Math.max(0, total - paid),
  };
}

export function mapGroupDetail(raw: any): GroupDetail {
  return {
    ...mapGroupRow(raw),
    revenueTarget: raw?.revenueTarget ?? 0,
    collected: raw?.collected ?? raw?.paidAmount ?? 0,
    outstanding: raw?.outstanding ?? raw?.remaining ?? 0,
    zoomLink: raw?.schedule?.[0]?.zoomLink ?? "",
    lectureDay: raw?.schedule?.[0]?.lectureDay ?? "",
    assignedLms: Array.isArray(raw?.lmsCourses) ? raw.lmsCourses.length : 0,
    roster: (raw?.students ?? []).map(mapRoster),
  };
}

export function computeGroupStats(rows: GroupRow[]): GroupStats {
  return {
    total: rows.length,
    pending: rows.filter((r) => r.status === "pending").length,
    inprogress: rows.filter((r) => r.status === "inprogress").length,
    finished: rows.filter((r) => r.status === "finished").length,
    totalStudents: rows.reduce((s, r) => s + r.students, 0),
    totalRevenue: rows.reduce((s, r) => s + r.revenue, 0),
  };
}
