export interface InstructorProfile {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string;
  title: string;
  joinedAt: string;
}

export interface InstructorStats {
  totalStudents: number;
  studentsDelta: number;
  totalCourses: number;
  coursesDelta: number;
  monthlyRevenue: number;
  revenueDelta: number;
  averageRating: number;
  ratingDelta: number;
}

export interface RevenuePoint {
  month: string;
  revenue: number;
  enrollments: number;
}

export interface TopCourse {
  id: string;
  title: string;
  category: string;
  status: "published" | "draft" | "archived";
  students: number;
  rating: number;
  revenue: number;
  thumbnailUrl: string;
}

export interface EnrollmentItem {
  id: string;
  studentName: string;
  studentAvatarUrl: string;
  courseTitle: string;
  enrolledAt: string;
  amount: number;
}

export type SessionStatus = "scheduled" | "live" | "completed";

export interface UpcomingSession {
  id: string;
  title: string;
  courseTitle: string;
  startsAt: string;
  durationMinutes: number;
  attendees: number;
  status: SessionStatus;
  joinUrl: string;
}

export interface InstructorReview {
  id: string;
  studentName: string;
  studentAvatarUrl: string;
  courseTitle: string;
  rating: number;
  comment: string;
  postedAt: string;
}

export interface InstructorDashboardSnapshot {
  profile: InstructorProfile;
  stats: InstructorStats;
  revenueSeries: RevenuePoint[];
  topCourses: TopCourse[];
  recentEnrollments: EnrollmentItem[];
  upcomingSessions: UpcomingSession[];
  recentReviews: InstructorReview[];
}
