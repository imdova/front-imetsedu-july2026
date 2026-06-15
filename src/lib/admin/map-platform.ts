/**
 * Maps the education backend's `GET /dashboard/stats` into the (generic
 * marketplace-template) platform KPI cards. Only the cards with a real backend
 * source are overridden; the rest keep their template values (no equivalent in
 * the IMETS data model). Pure + client-safe.
 */
import type { Kpi } from "@/lib/db/platform";

const num = (n: unknown) => Number(n ?? 0).toLocaleString();
const money = (n: unknown) => `$${Number(n ?? 0).toLocaleString()}`;

export function mapKpis(stats: any): Kpi[] {
  return [
    { key: "enrollments", labelKey: "kpiEnrollments", value: num(stats?.students?.total), icon: "CircleCheckBig", tone: "primary", subKey: "kpiNorthStar" },
    { key: "activeCourses", labelKey: "kpiActiveCourses", value: num(stats?.lmsCourses?.total), icon: "Briefcase", tone: "success" },
    { key: "newApps", labelKey: "kpiNewApplications", value: num(stats?.newLeads?.period), icon: "Users", tone: "info" },
    { key: "mrr", labelKey: "kpiMrr", value: money(stats?.revenue?.value), icon: "Wallet", tone: "success" },
    { key: "pendingApprovals", labelKey: "kpiPendingApprovals", value: num(stats?.pendingPayments?.count), icon: "ShieldCheck", tone: "warning", subKey: "kpiSla" },
    { key: "pendingReviews", labelKey: "kpiPendingReviews", value: num(stats?.conversion?.totalLeads), icon: "FileCheck2", tone: "warning" },
    { key: "openReports", labelKey: "kpiOpenReports", value: `${Number(stats?.conversion?.rate ?? 0)}%`, icon: "Flag", tone: stats?.conversion?.rate ? "success" : "danger" },
    { key: "timeToHire", labelKey: "kpiTimeToHire", value: `${Number(stats?.pendingPayments?.successRate ?? 0)}%`, icon: "Clock", tone: "info", subKey: "kpiTarget" },
  ];
}
