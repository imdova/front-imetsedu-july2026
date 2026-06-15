import { Plus } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { CoursesTable } from "@/features/courses/components/courses-table";

export default async function InstructorCoursesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Instructor");

  const res = await dal.courses.fetchCourses();

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader title={t("coursesTitle")} description={t("coursesSubtitle")}>
        <Button asChild className="gap-1.5">
          <Link href="/instructor/courses/new">
            <Plus className="size-4" />
            {t("newCourse")}
          </Link>
        </Button>
      </PageHeader>
      <CoursesTable initialData={res.ok ? res.data : []} />
    </div>
  );
}
