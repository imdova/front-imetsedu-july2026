import { getTranslations, setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { PageHeader } from "@/components/shared/page-header";
import { AnalyticsView } from "@/features/instructor/components/analytics-view";

export default async function InstructorAnalyticsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Instructor");

  const [revenueRes, perfRes] = await Promise.all([
    dal.instructor.fetchRevenue(),
    dal.instructor.fetchPerformance(),
  ]);

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <PageHeader title={t("analyticsTitle")} description={t("analyticsSubtitle")} />
      <AnalyticsView
        revenue={revenueRes.ok ? revenueRes.data : []}
        performance={perfRes.ok ? perfRes.data : []}
      />
    </div>
  );
}
