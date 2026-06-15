/**
 * Maps the backend student dashboard (`GET /student-portal/dashboard`) to the
 * UI student dashboard shape. Pure + client-safe.
 */
import type { EnrolledCourse, ScheduleEvent, Grade } from "@/lib/db/student";

const FALLBACK_THUMB = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=240&fit=crop";

export interface StudentDashboardVM {
  stats: { enrolled: number; avgProgress: number; certificates: number; upcoming: number };
  continueCourse: EnrolledCourse;
  upcomingEvents: ScheduleEvent[];
  recentGrades: Grade[];
}

function mapEnrolledCourse(c: any): EnrolledCourse {
  const thumb = Array.isArray(c?.thumbnail) ? c.thumbnail[0] : c?.thumbnail ?? c?.image;
  return {
    id: c?._id ?? c?.id ?? "",
    slug: c?.slug ?? c?._id ?? "",
    title: c?.title ?? c?.titleEn ?? "—",
    titleAr: c?.titleAr ?? c?.title ?? "—",
    instructor: c?.instructor?.name ?? c?.instructorName ?? "—",
    thumbnailUrl: thumb || FALLBACK_THUMB,
    progress: c?.progress ?? 0,
    totalLessons: c?.totalLessons ?? c?.lessons ?? 0,
    completedLessons: c?.completedLessons ?? 0,
    modules: [],
  };
}

function mapSession(s: any): ScheduleEvent {
  return {
    id: s?._id ?? s?.id ?? "",
    title: s?.title ?? s?.groupTitle ?? "Live session",
    kind: "live-class",
    day: s?.day ?? s?.lectureDay ?? "Today",
    time: s?.time ?? (s?.startTime ? `${s.startTime}–${s.endTime ?? ""}` : "—"),
    courseCode: s?.courseCode ?? s?.groupTitle ?? "",
    instructor: s?.instructor,
    joinUrl: s?.zoomLink ?? s?.joinUrl,
  };
}

export function mapStudentDashboard(raw: any): StudentDashboardVM {
  const courses: any[] = raw?.courses ?? [];
  const cont = raw?.continueLearning?.[0] ?? courses[0] ?? {};
  return {
    stats: {
      enrolled: courses.length,
      avgProgress: courses.length ? Math.round(courses.reduce((s, c) => s + (c?.progress ?? 0), 0) / courses.length) : 0,
      certificates: raw?.certificatesCount ?? 0,
      upcoming: (raw?.todaySessions?.length ?? 0) + (raw?.dueSoon?.length ?? 0),
    },
    continueCourse: mapEnrolledCourse(cont),
    upcomingEvents: (raw?.todaySessions ?? []).map(mapSession),
    recentGrades: [] as Grade[],
  };
}
