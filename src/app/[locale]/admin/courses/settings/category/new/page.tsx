import { ArrowLeft } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { AddCategoryForm } from "@/features/admin/components/add-category-form";

export default async function AdminAddCategoryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Admin");

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div className="space-y-4">
        <Button asChild variant="ghost" size="sm" className="gap-1.5 -ms-2">
          <Link href="/admin/courses/settings">
            <ArrowLeft className="size-4 rtl:rotate-180" />
            {t("backToCategories")}
          </Link>
        </Button>
        <PageHeader title={t("addNewCategory")} />
      </div>
      <AddCategoryForm />
    </div>
  );
}
