import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { CourseDetailView } from "@/features/student/components/course-detail-view";

export default async function StudentCoursePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const [courseRes, assignmentsRes, scheduleRes] = await Promise.all([
    dal.student.fetchCourse(slug),
    dal.student.fetchAssignments(),
    dal.student.fetchSchedule(),
  ]);
  if (!courseRes.ok || !courseRes.data) notFound();

  const liveEvents = (scheduleRes.ok ? scheduleRes.data : []).filter((e) => e.kind === "live-class");

  return (
    <div className="mx-auto max-w-[1400px]">
      <CourseDetailView
        course={courseRes.data}
        assignments={assignmentsRes.ok ? assignmentsRes.data : []}
        liveEvents={liveEvents}
      />
    </div>
  );
}
