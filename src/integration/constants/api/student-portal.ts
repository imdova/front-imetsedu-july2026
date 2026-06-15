/** Student portal API paths (authenticated). */
export const STUDENT_PORTAL = {
  DASHBOARD: "/student-portal/dashboard",
  SCHEDULE: "/student-portal/schedule",
  COURSES: "/student-portal/courses",
  CERTIFICATES: "/student-portal/certificates",
  NOTIFICATIONS: "/student-portal/notifications",
  NOTIFICATIONS_UNREAD_COUNT: "/student-portal/notifications/unread-count",
  NOTIFICATIONS_MARK_ALL_READ: "/student-portal/notifications/mark-all-read",
  courseDetail: (id: string) => `/student-portal/courses/${id}`,
  courseRatings: (id: string) => `/student-portal/courses/${id}/ratings`,
  courseProgress: (id: string) => `/student-portal/courses/${id}/progress`,
} as const;
