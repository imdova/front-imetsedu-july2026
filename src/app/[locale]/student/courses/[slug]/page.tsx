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

  const [courseRes, assignmentsRes, scheduleRes, certsRes] = await Promise.all([
    dal.student.fetchCourse(slug),
    dal.student.fetchAssignments(),
    dal.student.fetchSchedule(),
    dal.student.fetchCertificates(),
  ]);
  if (!courseRes.ok || !courseRes.data) notFound();

  const liveEvents = (scheduleRes.ok ? scheduleRes.data : []).filter((e) => e.kind === "live-class");
  // Issued certificate(s) for THIS course (matched by title).
  const courseTitle = courseRes.data.title.trim().toLowerCase();
  const certificates = (certsRes.ok ? certsRes.data : []).filter(
    (c) => (c.course ?? "").trim().toLowerCase() === courseTitle,
  );

  return (
    <div className="mx-auto max-w-[1400px]">
      <CourseDetailView
        course={courseRes.data}
        assignments={assignmentsRes.ok ? assignmentsRes.data : []}
        liveEvents={liveEvents}
        certificates={certificates}
      />
    </div>
  );
}
