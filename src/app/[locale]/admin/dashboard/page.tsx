import { FileClock } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { Button } from "@/components/ui/button";
import { KpiGrid } from "@/features/dashboard/components/kpi-grid";
import { RevenueChart } from "@/features/dashboard/components/revenue-chart";
import { OpenReportsCard } from "@/features/dashboard/components/open-reports-card";
import { JobsByCountry } from "@/features/dashboard/components/jobs-by-country";
import { SpecialtyBars } from "@/features/dashboard/components/specialty-bars";
import { QueueCard } from "@/features/dashboard/components/queue-card";
import { AuditEventsCard } from "@/features/dashboard/components/audit-events-card";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Platform" });
  return { title: t("title") };
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Platform");

  const [
    kpisRes,
    revenueRes,
    reportsRes,
    countryRes,
    categoryRes,
    verificationRes,
    reviewRes,
    auditRes,
  ] = await Promise.all([
    dal.platform.fetchKpis(),
    dal.platform.fetchRevenueSeries(),
    dal.platform.fetchOpenReports(),
    dal.platform.fetchCountryBars(),
    dal.platform.fetchCategoryBars(),
    dal.platform.fetchVerificationQueue(),
    dal.platform.fetchReviewQueue(),
    dal.platform.fetchAuditEvents(),
  ]);

  const kpis = kpisRes.ok ? kpisRes.data : [];
  const revenue = revenueRes.ok ? revenueRes.data : [];
  const reports = reportsRes.ok ? reportsRes.data : [];
  const country = countryRes.ok ? countryRes.data : [];
  const category = categoryRes.ok ? categoryRes.data : [];
  const verification = verificationRes.ok ? verificationRes.data : [];
  const review = reviewRes.ok ? reviewRes.data : [];
  const audit = auditRes.ok ? auditRes.data : [];

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-primary">
            {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Button className="gap-1.5">
          <FileClock className="size-4" />
          {t("viewAuditLog")}
        </Button>
      </div>

      {/* KPI tiles */}
      <KpiGrid kpis={kpis} />

      {/* Chart + open reports */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart data={revenue} />
        </div>
        <OpenReportsCard reports={reports} />
      </div>

      {/* Demand charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <JobsByCountry data={country} />
        <SpecialtyBars data={category} />
      </div>

      {/* Queues + audit */}
      <div className="grid gap-6 lg:grid-cols-3">
        <QueueCard
          title={t("verificationQueueTitle")}
          subtitle={t("companiesWaiting", { count: verification.length })}
          viewAllLabel={t("viewAll")}
          items={verification}
        />
        <QueueCard
          title={t("reviewQueueTitle")}
          subtitle={t("pendingCount", { count: 12 })}
          viewAllLabel={t("viewAll")}
          items={review}
        />
        <AuditEventsCard events={audit} />
      </div>
    </div>
  );
}
