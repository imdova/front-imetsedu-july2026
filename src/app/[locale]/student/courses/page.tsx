import { getTranslations, setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { PageHeader } from "@/components/shared/page-header";
import { MyCourses } from "@/features/student/components/my-courses";

export default async function StudentCoursesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Student");

  const res = await dal.student.fetchCourses();
  const courses = res.ok ? res.data : [];

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader title={t("myCoursesTitle")} description={t("myCoursesSubtitle")} />
      <MyCourses courses={courses} />
    </div>
  );
}
