export interface DashboardContinueLearning {
  id: string;
  title: string;
  categoryLabel: string;
  progress: number;
  thumbnailUrl?: string;
}

export interface DashboardPaymentAlert {
  show: boolean;
  amount: string;
  dueLabel: string;
  installmentLabel: string;
}

export interface DashboardLiveSession {
  id: string;
  title: string;
  startsIn: string;
  timeLabel: string;
  zoomLink?: string;
}

export interface DashboardUrgentDeadline {
  id: string;
  title: string;
  dueLabel: string;
  courseName: string;
  href: string;
}

export interface DashboardTodayFocus {
  liveSession: DashboardLiveSession | null;
  urgentDeadline: DashboardUrgentDeadline | null;
}

export interface DashboardDueSoonItem {
  id: string;
  title: string;
  dueLabel: string;
  urgent: boolean;
  href: string;
}

export interface DashboardCourseSummary {
  id: string;
  title: string;
  progress: number;
}

export interface DashboardRecentUpdate {
  id: string;
  type: "grade" | "announcement" | "notification";
  text: string;
  time: string;
}

export interface StudentDashboardView {
  greeting: string;
  continueLearning: DashboardContinueLearning | null;
  paymentAlert: DashboardPaymentAlert;
  todayFocus: DashboardTodayFocus;
  dueSoon: DashboardDueSoonItem[];
  courses: DashboardCourseSummary[];
  recentUpdates: DashboardRecentUpdate[];
  unreadNotificationCount: number;
}
