import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import { programTypeOptions } from "@/lib/courses/program-types";
import type { CourseFormValues } from "@/validations/course-schema";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { CourseForm } from "@/features/courses/components/course-form/course-form";

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("CourseForm");
  const tc = await getTranslations("Courses");

  const [courseRes, categoriesRes, instructorsRes, tagsRes, variablesRes] = await Promise.all([
    dal.courses.fetchCourseForEdit(id),
    dal.lookups.fetchCategories(),
    dal.lookups.fetchInstructors(),
    dal.lookups.fetchTags(),
    dal.courseTaxonomy.fetchCourseVariables(),
  ]);

  if (!courseRes.ok || !courseRes.data) notFound();
  const initial: Partial<CourseFormValues> = courseRes.data;
  const programTypes = programTypeOptions(variablesRes.ok ? variablesRes.data : []);

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-8">
      <div className="space-y-4">
        <Button asChild variant="ghost" size="sm" className="gap-1.5 -ms-2">
          <Link href="/admin/courses">
            <ArrowLeft className="size-4 rtl:rotate-180" />
            {tc("title")}
          </Link>
        </Button>
        <PageHeader title={t("editTitle")} description={initial.titleEn} />
      </div>

      <CourseForm
        courseId={id}
        initial={initial}
        categories={categoriesRes.ok ? categoriesRes.data : []}
        instructors={instructorsRes.ok ? instructorsRes.data : []}
        tags={tagsRes.ok ? tagsRes.data : []}
        programTypes={programTypes}
      />
    </div>
  );
}
