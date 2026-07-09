import { FileClock } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { Button } from "@/components/ui/button";
import { PlatformStatsCards } from "@/features/dashboard/components/platform-stats-cards";
import { FinanceRevenueChart } from "@/features/dashboard/components/finance-revenue-chart";
import { AuditEventsCard } from "@/features/dashboard/components/audit-events-card";
import {
  TopCoursesCard, LeadPipelineCard, RecentTransactionsCard, TopCounselorsCard, AlertsCard,
  LmsOverviewCard, StudentsByCountryCard, ActiveBatchesCard,
} from "@/features/dashboard/components/lms-insights";

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
    statsRes,
    revenueRes,
    topCoursesRes,
    pipelineRes,
    recentTxnsRes,
    counselorsRes,
    alertsRes,
    auditRes,
    lmsRes,
    countryRes,
    batchesRes,
  ] = await Promise.all([
    dal.platform.fetchPlatformStats(),
    dal.platform.fetchRevenueTrend(30),
    dal.platform.fetchTopCourses(),
    dal.platform.fetchLeadPipeline(),
    dal.platform.fetchRecentTransactions(),
    dal.platform.fetchTopCounselors(),
    dal.platform.fetchAlerts(),
    dal.platform.fetchAuditEvents(),
    dal.platform.fetchLmsOverview(),
    dal.platform.fetchStudentsByCountry(),
    dal.platform.fetchActiveBatches(),
  ]);

  const platformStats = statsRes.ok ? statsRes.data : null;
  const revenueTrend = revenueRes.ok ? revenueRes.data : null;
  const topCourses = topCoursesRes.ok ? topCoursesRes.data : [];
  const pipeline = pipelineRes.ok ? pipelineRes.data : [];
  const recentTxns = recentTxnsRes.ok ? recentTxnsRes.data : [];
  const counselors = counselorsRes.ok ? counselorsRes.data : [];
  const alerts = alertsRes.ok ? alertsRes.data : [];
  const audit = auditRes.ok ? auditRes.data : [];
  const lmsOverview = lmsRes.ok ? lmsRes.data : { active: 0, draft: 0, totalStudents: 0, avgCompletion: 0 };
  const byCountry = countryRes.ok ? countryRes.data : [];
  const batches = batchesRes.ok ? batchesRes.data : [];

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

      {/* Platform stats */}
      <PlatformStatsCards initialStats={platformStats} initialRange="90d" />

      {/* Revenue chart + priority alerts */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <FinanceRevenueChart initial={revenueTrend} initialDays={30} />
        </div>
        <AlertsCard alerts={alerts} />
      </div>

      {/* LMS overview + top courses + lead pipeline */}
      <div className="grid gap-6 lg:grid-cols-3">
        <LmsOverviewCard data={lmsOverview} />
        <TopCoursesCard courses={topCourses} />
        <LeadPipelineCard rows={pipeline} />
      </div>

      {/* Recent transactions + counselors + audit */}
      <div className="grid gap-6 lg:grid-cols-3">
        <RecentTransactionsCard txns={recentTxns} />
        <TopCounselorsCard counselors={counselors} />
        <AuditEventsCard events={audit} />
      </div>

      {/* Students by country + active batches */}
      <div className="grid gap-6 lg:grid-cols-2">
        <StudentsByCountryCard rows={byCountry} />
        <ActiveBatchesCard batches={batches} />
      </div>
    </div>
  );
}
