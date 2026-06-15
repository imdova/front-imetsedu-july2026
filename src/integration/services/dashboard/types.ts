export interface DashboardStats {
  revenue: { value: number; changePercent: number | null; label: string };
  students: { total: number; active: number; inactive: number };
  newLeads: { period: number; allTime: number };
  lmsCourses: { total: number; draft: number; enrolled: number };
  conversion: { rate: number; enrolled: number; totalLeads: number };
  pendingPayments: { value: number; count: number; successRate: number };
}

export interface RevenueTrend {
  days: number;
  currency: string;
  data: { revenue: number; date: string }[];
}

export interface LmsOverview {
  active: number;
  draft: number;
  totalStudents: number;
  averageContentCompletion: number;
}

export interface TopCourse {
  id: string;
  name: string;
  category: string;
  enrollment: number;
  revenue: number;
}

export interface TopCounselor {
  name: string;
  totalLeads: number;
  enrolled: number;
  conversionRate: number;
}

export interface ActiveBatch {
  id: string;
  title: string;
  status: string;
  students: number;
  capacity: number;
  startDate: string;
}

export interface RecentTransaction {
  id: string;
  customerName: string;
  courseName: string;
  amount: number;
  currency: string;
  status: "successful" | "pending" | "failed" | "refunded";
  date: string;
}

export interface PipelineStage {
  stage: string;
  label: string;
  count: number;
  percentage: number;
}

export interface StudentByCountry {
  country: string;
  code: string;
  count: number;
  percentage: number;
}

export interface DashboardAlert {
  id: string;
  type: "high" | "capacity" | "info";
  label: string;
  title: string;
  description: string;
  buttonLabel: string;
  href?: string;
}
