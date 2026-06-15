import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
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

  const [courseRes, categoriesRes, instructorsRes, tagsRes] = await Promise.all([
    dal.courses.fetchCourse(id),
    dal.lookups.fetchCategories(),
    dal.lookups.fetchInstructors(),
    dal.lookups.fetchTags(),
  ]);

  if (!courseRes.ok || !courseRes.data) notFound();
  const c = courseRes.data;

  const initial: Partial<CourseFormValues> = {
    titleEn: c.titleEn,
    titleAr: c.titleAr,
    slug: c.slug,
    category: c.category,
    difficulty: c.difficulty,
    students: c.students,
    lectures: c.lectures,
    image: c.thumbnailUrl,
    isFeatured: c.isFeatured,
    isBestseller: c.isBestseller,
    isTopRated: c.isTopRated,
    status: c.status,
    pricing: {
      egp: { price: c.priceEGP, salePrice: c.salePriceEGP, discount: 0 },
      sar: { price: 0, salePrice: 0, discount: 0 },
      usd: { price: 0, salePrice: 0, discount: 0 },
    },
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-8">
      <div className="space-y-4">
        <Button asChild variant="ghost" size="sm" className="gap-1.5 -ms-2">
          <Link href="/admin/courses">
            <ArrowLeft className="size-4 rtl:rotate-180" />
            {tc("title")}
          </Link>
        </Button>
        <PageHeader title={t("editTitle")} description={c.titleEn} />
      </div>

      <CourseForm
        courseId={id}
        initial={initial}
        categories={categoriesRes.ok ? categoriesRes.data : []}
        instructors={instructorsRes.ok ? instructorsRes.data : []}
        tags={tagsRes.ok ? tagsRes.data : []}
      />
    </div>
  );
}
