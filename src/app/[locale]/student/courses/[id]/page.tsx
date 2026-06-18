import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { CourseDetailView } from "@/features/student/components/course-detail-view";

export default async function StudentCoursePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const [courseRes, assignmentsRes, scheduleRes, certsRes] = await Promise.all([
    dal.student.fetchCourse(id),
    dal.student.fetchAssignments(),
    dal.student.fetchSchedule(),
    dal.student.fetchCertificates(),
  ]);
  if (!courseRes.ok || !courseRes.data) notFound();

  const liveEvents = (scheduleRes.ok ? scheduleRes.data : []).filter((e) => e.kind === "live-class");
  // Issued certificate(s) for THIS course: either issued directly against the
  // LMS course, or issued through a group that's assigned to this course.
  const course = courseRes.data;
  const assignedGroupIds = new Set(course.assignedGroupIds ?? []);
  const courseTitle = course.title.trim().toLowerCase();
  const certificates = (certsRes.ok ? certsRes.data : []).filter((c) =>
    c.lmsId || c.groupId
      ? c.lmsId === course.id || (!!c.groupId && assignedGroupIds.has(c.groupId))
      : (c.course ?? "").trim().toLowerCase() === courseTitle,
  );

  return (
    <div className="mx-auto max-w-[1400px]">
      <CourseDetailView
        course={course}
        assignments={assignmentsRes.ok ? assignmentsRes.data : []}
        liveEvents={liveEvents}
        certificates={certificates}
      />
    </div>
  );
}
