import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { AddCategoryForm, type CategoryInitial } from "@/features/admin/components/add-category-form";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Admin");

  const res = await dal.courseTaxonomy.fetchCourseCategory(id);
  if (!res.ok || !res.data) notFound();

  const raw = res.data as any;
  const initial: CategoryInitial = {
    nameEn: raw.nameEn ?? "",
    nameAr: raw.nameAr ?? "",
    slug: raw.slug ?? "",
    icon: raw.icon ?? "",
    headlineEn: raw.headlineEn ?? "",
    headlineAr: raw.headlineAr ?? "",
    descriptionEn: raw.descriptionEn ?? "",
    descriptionAr: raw.descriptionAr ?? "",
    metaTitleEn: raw.seo?.metaTitleEn ?? "",
    metaTitleAr: raw.seo?.metaTitleAr ?? "",
    metaDescriptionEn: raw.seo?.metaDescriptionEn ?? "",
    metaDescriptionAr: raw.seo?.metaDescriptionAr ?? "",
    metaKeywordsEn: raw.seo?.metaKeywordsEn ?? [],
    metaKeywordsAr: raw.seo?.metaKeywordsAr ?? [],
    faqs: raw.faqs ?? [],
  };

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div className="space-y-4">
        <Button asChild variant="ghost" size="sm" className="gap-1.5 -ms-2">
          <Link href="/admin/courses/settings">
            <ArrowLeft className="size-4 rtl:rotate-180" />
            {t("backToCategories")}
          </Link>
        </Button>
        <PageHeader title={t("editCategory")} description={raw.nameEn} />
      </div>
      <AddCategoryForm categoryId={id} initial={initial} />
    </div>
  );
}
