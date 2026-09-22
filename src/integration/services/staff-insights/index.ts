import { api, type Result } from "@integration/services/http/client";

/** A named bucket in a breakdown chart (stage, source, priority, action…). */
export interface InsightBucket {
  name: string;
  value: number;
}

export interface StaffPerformance {
  range: { days: number; from: string; to: string };
  leads: {
    total: number;
    inRange: number;
    enrolled: number;
    lost: number;
    open: number;
    conversionRate: number;
    estimatedValue: number;
    enrolledValue: number;
    byStage: InsightBucket[];
    bySource: InsightBucket[];
    byPriority: InsightBucket[];
  };
  followUps: { overdue: number; today: number; upcoming: number };
  revenue: { collected: number; outstanding: number; payments: number; invoices: number; invoicesByStatus: InsightBucket[] };
  commission: { total: number; deals: number; months: { month: string; amount: number; deals: number }[] };
  activity: { total: number; inRange: number; byAction: InsightBucket[] };
  orientation: {
    completed: number;
    total: number;
    percent: number;
    startedAt: string | null;
    completedAt: string | null;
    signedOffAt: string | null;
    quizScore: number | null;
    quizTotal: number | null;
    xp: number;
    lessonsLogged: number;
  } | null;
  /** One point per day over the window. */
  series: { date: string; leads: number; activities: number; collected: number }[];
}

export type StaffActivityKind = "lead" | "assignment" | "commission" | "notification" | "training";

export interface StaffActivityItem {
  id: string;
  at: string;
  kind: StaffActivityKind;
  action: string;
  title: string;
  detail: string;
  entityType?: string;
  entityId?: string;
}

export interface StaffActivityPage {
  items: StaffActivityItem[];
  total: number;
  page: number;
  limit: number;
  kinds: { kind: StaffActivityKind; count: number }[];
  /** True when a source hit its read cap, so older history isn't included. */
  capped: boolean;
}

const BASE = "/staff-insights";

export const performance = (userId: string, days = 90): Promise<Result<StaffPerformance>> =>
  api.get(`${BASE}/${encodeURIComponent(userId)}/performance`, { params: { days: String(days) }, revalidate: false });

export const activity = (
  userId: string,
  query: { page?: number; limit?: number; kind?: string; from?: string; to?: string } = {},
): Promise<Result<StaffActivityPage>> => {
  const params = Object.fromEntries(
    Object.entries(query)
      .filter(([, v]) => v !== undefined && v !== "" && v !== null)
      .map(([k, v]) => [k, String(v)]),
  );
  return api.get(`${BASE}/${encodeURIComponent(userId)}/activity`, { params, revalidate: false });
};
