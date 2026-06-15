import { getTranslations, setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { PageHeader } from "@/components/shared/page-header";
import { CourseSettings } from "@/features/admin/components/course-settings";

export default async function AdminCourseSettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Admin");

  const [catRes, subRes, tagRes, varRes] = await Promise.all([
    dal.courseTaxonomy.fetchCourseCategories(),
    dal.courseTaxonomy.fetchCourseSubcategories(),
    dal.courseTaxonomy.fetchCourseTags(),
    dal.courseTaxonomy.fetchCourseVariables(),
  ]);

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader title={t("courseSettingsTitle")} description={t("courseSettingsSubtitle")} />
      <CourseSettings
        categories={catRes.ok ? catRes.data : []}
        subcategories={subRes.ok ? subRes.data : []}
        tags={tagRes.ok ? tagRes.data : []}
        variables={varRes.ok ? varRes.data : []}
      />
    </div>
  );
}
