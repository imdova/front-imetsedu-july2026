import { ArrowLeft } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { CourseForm } from "@/features/courses/components/course-form/course-form";

export default async function InstructorNewCoursePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("CourseForm");
  const ti = await getTranslations("Instructor");

  const [categoriesRes, instructorsRes, tagsRes] = await Promise.all([
    dal.lookups.fetchCategories(),
    dal.lookups.fetchInstructors(),
    dal.lookups.fetchTags(),
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-8">
      <div className="space-y-4">
        <Button asChild variant="ghost" size="sm" className="gap-1.5 -ms-2">
          <Link href="/instructor/courses">
            <ArrowLeft className="size-4 rtl:rotate-180" />
            {ti("coursesTitle")}
          </Link>
        </Button>
        <PageHeader title={t("pageTitle")} description={t("pageSubtitle")} />
      </div>

      <CourseForm
        categories={categoriesRes.ok ? categoriesRes.data : []}
        instructors={instructorsRes.ok ? instructorsRes.data : []}
        tags={tagsRes.ok ? tagsRes.data : []}
      />
    </div>
  );
}
