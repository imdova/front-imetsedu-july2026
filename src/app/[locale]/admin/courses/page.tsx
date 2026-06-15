import { Plus } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { CoursesTable } from "@/features/courses/components/courses-table";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Courses" });
  return { title: t("title") };
}

export default async function CoursesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Courses");

  const res = await dal.courses.fetchCourses();
  const courses = res.ok ? res.data : [];

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader title={t("title")} description={t("subtitle")}>
        <Button asChild className="gap-1.5">
          <Link href="/admin/courses/new">
            <Plus className="size-4" />
            {t("newCourse")}
          </Link>
        </Button>
      </PageHeader>
      <CoursesTable initialData={courses} />
    </div>
  );
}
