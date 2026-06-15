import { setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { PipelinesInventory } from "@/features/crm/components/pipelines-inventory";

export default async function AdminPipelinesInventoryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [invRes, statsRes] = await Promise.all([
    dal.crm.fetchPipelineInventory(),
    dal.crm.fetchPipelineInventoryStats(),
  ]);

  const stats = statsRes.ok
    ? statsRes.data
    : { totalPipelines: 0, activePipelines: 0, totalLeads: 0, totalEnrollments: 0, totalRevenue: 0, avgConversion: 0 };

  return (
    <div className="mx-auto max-w-[1400px]">
      <PipelinesInventory initial={invRes.ok ? invRes.data : []} stats={stats} />
    </div>
  );
}
