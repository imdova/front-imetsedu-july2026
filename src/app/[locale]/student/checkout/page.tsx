import { ArrowLeft } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { CheckoutView } from "@/features/student/components/checkout-view";

export default async function StudentCheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ course?: string }>;
}) {
  const { locale } = await params;
  const { course: slug } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("Student");

  const res = await dal.courses.fetchCourses();
  const courses = res.ok ? res.data : [];
  const course = (slug && courses.find((c) => c.slug === slug)) || courses[0];

  return (
    <div className="mx-auto max-w-[1100px] space-y-6">
      <Button asChild variant="ghost" size="sm" className="gap-1.5 -ms-2">
        <Link href="/courses">
          <ArrowLeft className="size-4 rtl:rotate-180" />
          {t("browseCatalog")}
        </Link>
      </Button>
      <PageHeader title={t("checkoutTitle")} description={t("checkoutSubtitle")} />
      {course ? (
        <CheckoutView course={course} />
      ) : (
        <p className="rounded-xl border border-dashed py-16 text-center text-muted-foreground">{t("emptyCart")}</p>
      )}
    </div>
  );
}
