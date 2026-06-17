import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { AddSubcategoryForm, type SubcategoryInitial } from "@/features/admin/components/add-subcategory-form";

export default async function EditSubcategoryPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Admin");

  const [subRes, catRes] = await Promise.all([
    dal.courseTaxonomy.fetchCourseSubcategory(id),
    dal.courseTaxonomy.fetchCourseCategories(),
  ]);

  if (!subRes.ok || !subRes.data) notFound();

  const raw = subRes.data as any;
  const parentCategories = catRes.ok
    ? catRes.data.map((c: any) => ({ id: c.id, name: c.nameEn }))
    : [];

  const parentId =
    typeof raw.parentCategory === "object"
      ? raw.parentCategory?._id ?? raw.parentCategory?.id ?? ""
      : raw.parentCategory ?? "";

  const initial: SubcategoryInitial = {
    nameEn: raw.nameEn ?? "",
    nameAr: raw.nameAr ?? "",
    slug: raw.slug ?? "",
    icon: raw.icon ?? "",
    parentCategory: parentId,
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
        <PageHeader title={t("editSubcategory")} description={raw.nameEn} />
      </div>
      <AddSubcategoryForm
        subcategoryId={id}
        initial={initial}
        parentCategories={parentCategories}
      />
    </div>
  );
}
