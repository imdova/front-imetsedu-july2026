import { getTranslations, setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { PageHeader } from "@/components/shared/page-header";
import { ExportButton } from "@/features/finance/components/export-button";
import { FinanceKpis } from "@/features/finance/components/finance-kpis";
import { RevenueChart } from "@/features/dashboard/components/revenue-chart";
import { JobsByCountry } from "@/features/dashboard/components/jobs-by-country";
import { SpecialtyBars } from "@/features/dashboard/components/specialty-bars";

export default async function AdminReportsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Admin");

  const [revenueRes, countryRes, categoryRes, financeRes] = await Promise.all([
    dal.platform.fetchRevenueSeries(),
    dal.platform.fetchCountryBars(),
    dal.platform.fetchCategoryBars(),
    dal.finance.fetchFinanceStats(),
  ]);

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader title={t("reportsTitle")} description={t("reportsSubtitle")}>
        <ExportButton />
      </PageHeader>
      {financeRes.ok && <FinanceKpis stats={financeRes.data} />}
      <RevenueChart data={revenueRes.ok ? revenueRes.data : []} />
      <div className="grid gap-6 lg:grid-cols-2">
        <JobsByCountry data={countryRes.ok ? countryRes.data : []} />
        <SpecialtyBars data={categoryRes.ok ? categoryRes.data : []} />
      </div>
    </div>
  );
}
