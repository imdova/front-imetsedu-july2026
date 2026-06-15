/**
 * Instructor workspace mock data — dashboard stats, teaching events, earnings
 * payouts and per-course performance. Mirrors the seam used elsewhere: the UI
 * reaches this only through `lib/dal/instructor.ts`.
 */
import { respond } from "./delay";
import type { RevenuePoint } from "./platform";

export interface InstructorStats {
  students: number;
  activeCourses: number;
  avgRating: number;
  monthlyEarnings: number;
  pendingGrading: number;
  upcomingEvents: number;
}

export type InstructorEventType = "webinar" | "workshop" | "live";
export type InstructorEventStatus = "upcoming" | "live" | "ended";
export interface InstructorEvent {
  id: string;
  title: string;
  type: InstructorEventType;
  date: string;
  time: string;
  registered: number;
  capacity: number;
  status: InstructorEventStatus;
}

export type PayoutStatus = "paid" | "pending" | "processing";
export interface PayoutRow {
  id: string;
  period: string;
  amount: number;
  method: string;
  status: PayoutStatus;
  date: string;
}

export interface EarningsSummary {
  available: number;
  pending: number;
  lifetime: number;
  thisMonth: number;
}

export interface CoursePerformance {
  id: string;
  course: string;
  students: number;
  completion: number; // %
  rating: number;
  revenue: number;
}

const stats: InstructorStats = {
  students: 1284,
  activeCourses: 6,
  avgRating: 4.8,
  monthlyEarnings: 84200,
  pendingGrading: 12,
  upcomingEvents: 3,
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
const revenue: RevenuePoint[] = MONTHS.map((month, i) => ({
  month,
  applications: 180 + i * 24,
  hires: 60 + i * 12,
  mrr: 42000 + i * 7200,
}));

const events: InstructorEvent[] = [
  { id: "ev_1", title: "Financial Modeling — Live Q&A", type: "live", date: "2026-06-18", time: "18:00", registered: 86, capacity: 120, status: "upcoming" },
  { id: "ev_2", title: "Building a Startup Budget", type: "webinar", date: "2026-06-22", time: "20:00", registered: 142, capacity: 200, status: "upcoming" },
  { id: "ev_3", title: "Advanced Excel Workshop", type: "workshop", date: "2026-06-28", time: "17:00", registered: 38, capacity: 40, status: "upcoming" },
  { id: "ev_4", title: "Intro to Investment Analysis", type: "webinar", date: "2026-06-05", time: "19:00", registered: 210, capacity: 250, status: "ended" },
];

const payoutSummary: EarningsSummary = {
  available: 38400,
  pending: 12600,
  lifetime: 612900,
  thisMonth: 84200,
};

const payouts: PayoutRow[] = [
  { id: "po_1", period: "May 2026", amount: 78600, method: "Bank transfer", status: "paid", date: "2026-06-01" },
  { id: "po_2", period: "Apr 2026", amount: 71200, method: "Bank transfer", status: "paid", date: "2026-05-01" },
  { id: "po_3", period: "Jun 2026 (partial)", amount: 12600, method: "Bank transfer", status: "pending", date: "2026-07-01" },
  { id: "po_4", period: "Mar 2026", amount: 65900, method: "Bank transfer", status: "paid", date: "2026-04-01" },
];

const performance: CoursePerformance[] = [
  { id: "perf_1", course: "Financial Modeling Masterclass", students: 412, completion: 78, rating: 4.9, revenue: 246000 },
  { id: "perf_2", course: "Corporate Finance Foundations", students: 318, completion: 71, rating: 4.7, revenue: 158400 },
  { id: "perf_3", course: "Investment Analysis & Valuation", students: 264, completion: 64, rating: 4.8, revenue: 132000 },
  { id: "perf_4", course: "Budgeting for Startups", students: 190, completion: 82, rating: 4.6, revenue: 76500 },
];

export const getInstructorStats = () => respond(stats);
export const getInstructorRevenue = () => respond(revenue);
export const getInstructorEvents = () => respond(events);
export const getInstructorEarnings = () =>
  respond({ summary: payoutSummary, payouts });
export const getCoursePerformance = () => respond(performance);
