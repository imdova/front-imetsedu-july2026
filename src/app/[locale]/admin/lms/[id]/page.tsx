import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import type { AssignedGroupStatus } from "@/lib/db/lms";
import { LmsCourseDetail } from "@/features/admin/components/lms-course-detail";

const GROUP_STATUS: Record<string, AssignedGroupStatus> = {
  pending: "upcoming",
  inprogress: "active",
  finished: "completed",
};

export default async function AdminLmsCoursePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const [courseRes, groupsRes, studentsRes, categoriesRes, subcategoriesRes] = await Promise.all([
    dal.lms.fetchLmsCourse(id),
    dal.groups.fetchGroups(),
    dal.studentsMgmt.fetchSmStudents(),
    dal.lms.fetchLmsCategories(),
    dal.lms.fetchLmsSubcategories(),
  ]);
  if (!courseRes.ok || !courseRes.data) notFound();
  const course = courseRes.data;
  const categoryOptions = (categoriesRes.ok ? categoriesRes.data : []).map((c) => ({ id: c.id, name: c.name }));
  const subcategoryOptions = (subcategoriesRes.ok ? subcategoriesRes.data : []).map((c) => ({ id: c.id, name: c.name, parentId: c.parentId }));

  const groups = groupsRes.ok ? groupsRes.data : [];
  const students = studentsRes.ok ? studentsRes.data : [];
  const groupById = new Map(groups.map((g) => [g.id, g]));
  const studentById = new Map(students.map((s) => [s.id, s]));

  // Join the course's raw group-/student-ids with real records.
  const assignedGroups = course.assignedGroupIds.map((gid) => {
    const g = groupById.get(gid);
    return g
      ? {
          id: g.id,
          name: g.title,
          code: g.id.slice(-4).toUpperCase(),
          intakePeriod: `${g.startDate} – ${g.endDate}`,
          studentCount: g.students,
          avgProgress: 0,
          status: GROUP_STATUS[g.status] ?? "active",
        }
      : { id: gid, name: gid, code: "", intakePeriod: "—", studentCount: 0, avgProgress: 0, status: "active" as AssignedGroupStatus };
  });

  const enrolledStudents = course.studentIds.map((sid) => {
    const s = studentById.get(sid);
    return s
      ? { id: s.id, name: s.name, email: s.email, country: s.country, leadSource: s.leadSource }
      : { id: sid, name: sid, email: "", country: "", leadSource: "" };
  });

  const assignedSet = new Set(course.assignedGroupIds);
  const availableGroups = groups.filter((g) => !assignedSet.has(g.id)).map((g) => ({ id: g.id, name: g.title }));
  const enrolledSet = new Set(course.studentIds);
  const availableStudents = students.filter((s) => !enrolledSet.has(s.id)).map((s) => ({ id: s.id, name: s.name, email: s.email }));

  return (
    <div className="mx-auto max-w-[1500px]">
      <LmsCourseDetail
        course={{ ...course, assignedGroups }}
        availableGroups={availableGroups}
        enrolledStudents={enrolledStudents}
        availableStudents={availableStudents}
        categoryOptions={categoryOptions}
        subcategoryOptions={subcategoryOptions}
      />
    </div>
  );
}
