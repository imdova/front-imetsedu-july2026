import { getTranslations, setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { requirePermission } from "@/lib/permission-guard";
import { PageHeader } from "@/components/shared/page-header";
import { CrmDashboard } from "@/features/crm/components/crm-dashboard";

export default async function AdminCrmDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requirePermission("crm.dashboard.view");
  const t = await getTranslations("Crm");

  const res = await dal.crm.fetchCrmStats();
  const stats = res.ok
    ? res.data
    : {
        totalLeads: 0, newThisWeek: 0, conversionRate: 0, pipelineValue: 0,
        byStage: [], bySource: [], byCounselor: [], overdueFollowUps: 0,
      };

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader title={t("crmTitle")} description={t("crmSubtitle")} />
      <CrmDashboard stats={stats} />
    </div>
  );
}
