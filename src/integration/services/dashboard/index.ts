export {
  getDashboardStats,
  getRevenueTrend,
  getLmsOverview,
  getTopCourses,
  getTopCounselors,
  getActiveBatches,
  getRecentTransactions,
  getLeadPipeline,
  getStudentsByCountry,
  getDashboardAlerts,
  exportDashboardReport,
} from "./dashboard.service";

export type {
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
