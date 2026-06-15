/**
 * Platform-overview seed for the dashboard (KPI tiles, revenue series, open
 * reports, demand charts, moderation queues, audit events). Labels are stored
 * as i18n key suffixes (resolved in the components) while values stay as data.
 */
import { respond } from "./delay";

export type Tone = "primary" | "success" | "info" | "warning" | "danger";

export interface Kpi {
  key: string;
  labelKey: string;
  value: string;
  icon: string; // lucide name
  tone: Tone;
  subKey?: string;
  delta?: number; // signed percentage
}

export interface RevenuePoint {
  month: string; // short label
  applications: number;
  hires: number;
  mrr: number;
}

export type Severity = "LOW" | "MEDIUM" | "HIGH";
export interface OpenReport {
  id: string;
  title: string;
  reason: string; // SPAM / FRAUD / …
  entity: string; // job / company / user / message
  severity: Severity;
  ago: string;
}

export interface CountryBar {
  code: string;
  value: number;
}
export interface CategoryBar {
  label: string;
  value: number;
}

export interface QueueItem {
  id: string;
  title: string;
  meta: string;
  ago: string;
  initials: string;
}

export interface AuditEvent {
  id: string;
  type: string; // USER_LOGIN / KYB_APPROVE / …
  actor: string;
  target: string;
  ago: string;
}

/* ── Live LMS dashboard sections (GET /dashboard/*) ── */
export interface TopCourse { name: string; revenue: number; enrollments: number }
export interface DashCounselor { name: string; image?: string; totalLeads: number; enrolled: number; conversionRate: number }
export interface RecentTxn { id: string; number: string; customer: string; amount: number; currency: string; status: string }
export interface PipelineRow { key: string; count: number; percentage: number }
export interface DashAlert { type: string; title: string; description: string; action: string; link: string }
export interface LmsOverview { active: number; draft: number; totalStudents: number; avgCompletion: number }
export interface CountryStat { country: string; count: number }
export interface ActiveBatch { title: string; enrolled: number; capacity: number }

const kpis: Kpi[] = [
  { key: "enrollments", labelKey: "kpiEnrollments", value: "1,284", icon: "CircleCheckBig", tone: "primary", subKey: "kpiNorthStar", delta: 12.4 },
  { key: "activeCourses", labelKey: "kpiActiveCourses", value: "784", icon: "Briefcase", tone: "success", delta: 6.8 },
  { key: "newApps", labelKey: "kpiNewApplications", value: "3,892", icon: "Users", tone: "info", delta: 9.1 },
  { key: "mrr", labelKey: "kpiMrr", value: "$184,320", icon: "Wallet", tone: "success", delta: 5.3 },
  { key: "pendingApprovals", labelKey: "kpiPendingApprovals", value: "4", icon: "ShieldCheck", tone: "warning", subKey: "kpiSla" },
  { key: "pendingReviews", labelKey: "kpiPendingReviews", value: "12", icon: "FileCheck2", tone: "warning" },
  { key: "openReports", labelKey: "kpiOpenReports", value: "14", icon: "Flag", tone: "danger" },
  { key: "timeToHire", labelKey: "kpiTimeToHire", value: "32 days", icon: "Clock", tone: "info", subKey: "kpiTarget" },
];

const MONTHS = ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May"];
const revenueSeries: RevenuePoint[] = MONTHS.map((month, i) => ({
  month,
  applications: 1800 + i * 180 + (i % 3) * 120,
  hires: 220 + i * 16,
  mrr: 118000 + i * 7600 + (i % 2) * 1500,
}));

const openReports: OpenReport[] = [
  { id: "r1", title: "ICU Consultant", reason: "SPAM", entity: "job", severity: "LOW", ago: "2 months ago" },
  { id: "r2", title: "Cleveland Clinic Abu Dhabi", reason: "FRAUD", entity: "company", severity: "MEDIUM", ago: "2 months ago" },
  { id: "r3", title: "Yousef Habib", reason: "HARASSMENT", entity: "user", severity: "HIGH", ago: "2 months ago" },
  { id: "r4", title: "Maryam Habib", reason: "INAPPROPRIATE", entity: "message", severity: "LOW", ago: "2 months ago" },
  { id: "r5", title: "OR / Theatre Nurse", reason: "OTHER", entity: "job", severity: "MEDIUM", ago: "2 months ago" },
];

const countryBars: CountryBar[] = [
  { code: "SA", value: 168 },
  { code: "AE", value: 142 },
  { code: "QA", value: 121 },
  { code: "EG", value: 96 },
  { code: "KW", value: 88 },
  { code: "OM", value: 64 },
  { code: "BH", value: 52 },
  { code: "JO", value: 43 },
];

const categoryBars: CategoryBar[] = [
  { label: "Finance & Accounting", value: 1240 },
  { label: "Business & Management", value: 1080 },
  { label: "Marketing & Sales", value: 870 },
  { label: "Project Management", value: 640 },
  { label: "Human Resources", value: 410 },
];

const verificationQueue: QueueItem[] = [
  { id: "v1", title: "King Faisal Specialist Hospital", meta: "SA · hospital", ago: "8 months ago", initials: "KF" },
  { id: "v2", title: "Cleveland Clinic Abu Dhabi", meta: "AE · clinic", ago: "8 months ago", initials: "CC" },
  { id: "v3", title: "American Hospital Dubai", meta: "QA · pharma", ago: "8 months ago", initials: "AH" },
  { id: "v4", title: "Hamad Medical Corporation", meta: "OM · agency", ago: "8 months ago", initials: "HM" },
];

const reviewQueue: QueueItem[] = [
  { id: "c1", title: "Khalid Saleh", meta: "SCFHS · PHYSICIAN", ago: "2 months ago", initials: "KS" },
  { id: "c2", title: "Yousef Awad", meta: "DHA · NURSE", ago: "2 months ago", initials: "YA" },
  { id: "c3", title: "Maryam Awad", meta: "DOH · DENTIST", ago: "2 months ago", initials: "MA" },
  { id: "c4", title: "Nour Abdel-Rahman", meta: "QCHP · PHARMACIST", ago: "2 months ago", initials: "NA" },
];

const auditEvents: AuditEvent[] = [
  { id: "a1", type: "USER_LOGIN", actor: "Ahmed Al-Mutairi", target: "Yousef Salim", ago: "last month" },
  { id: "a2", type: "KYB_APPROVE", actor: "Layla Al-Mutairi", target: "Maryam Salim", ago: "last month" },
  { id: "a3", type: "KYB_REJECT", actor: "Omar Saleh", target: "Hassan Salim", ago: "last month" },
  { id: "a4", type: "CREDENTIAL_APPROVE", actor: "Fatima Saleh", target: "Nour Al-Otaibi", ago: "last month" },
  { id: "a5", type: "JOB_PUBLISH", actor: "Khalid Saleh", target: "Ali Al-Otaibi", ago: "last month" },
];

export const getKpis = () => respond(kpis);
export const getRevenueSeries = () => respond(revenueSeries);
export const getOpenReports = () => respond(openReports);
export const getCountryBars = () => respond(countryBars);
export const getCategoryBars = () => respond(categoryBars);
export const getVerificationQueue = () => respond(verificationQueue);
export const getReviewQueue = () => respond(reviewQueue);
export const getAuditEvents = () => respond(auditEvents);
