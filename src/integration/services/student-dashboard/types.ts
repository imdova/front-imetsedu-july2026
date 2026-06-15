import type { StudentPortalCategoryRef } from "@integration/services/student-courses/types";

export interface StudentDashboardCourseRef {
  _id: string;
  title: string;
  thumbnail?: string[];
  category?: StudentPortalCategoryRef;
  subcategory?: StudentPortalCategoryRef;
  progress?: number;
  isCompleted?: boolean;
}

export interface StudentDashboardNextInstallment {
  amount?: number | string;
  currency?: string;
  dueDate?: string;
  title?: string;
  index?: number;
  total?: number;
  label?: string;
}

export interface StudentDashboardTodaySession {
  _id?: string;
  title?: string;
  courseTitle?: string;
  startTime?: string;
  endTime?: string;
  zoomLink?: string;
  startsIn?: string;
  timeLabel?: string;
}

export interface StudentDashboardDueItem {
  _id?: string;
  title?: string;
  dueDate?: string;
  dueLabel?: string;
  courseName?: string;
  courseTitle?: string;
  urgent?: boolean;
  type?: string;
}

export interface StudentDashboardNotification {
  _id: string;
  type?: string;
  title?: string;
  message?: string;
  entityType?: string;
  entityId?: string;
  isRead?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentDashboardApiResponse {
  greeting?: string;
  continueLearning?: StudentDashboardCourseRef | null;
  nextInstallment?: StudentDashboardNextInstallment | null;
  todaySessions?: StudentDashboardTodaySession[];
  dueSoon?: StudentDashboardDueItem[];
  courses?: StudentDashboardCourseRef[];
  recentNotifications?: StudentDashboardNotification[];
  unreadNotificationCount?: number;
}
