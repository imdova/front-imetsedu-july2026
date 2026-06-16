import { getTranslations, setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { PageHeader } from "@/components/shared/page-header";
import { PipelineBoard } from "@/features/crm/components/pipeline-board";
import { requirePermission, getSessionUser } from "@/lib/permission-guard";

export default async function StaffPipelinePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  
  await requirePermission("crm.pipelines.view");
  const user = await getSessionUser();
  const counselorId = user?.staffId || user?.id;

  const t = await getTranslations("Crm");

  const [leadsRes, pipelineRes] = await Promise.all([
    dal.crm.fetchLeads({ counselorId }),
    dal.crm.fetchPipeline(),
  ]);

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <PageHeader title={t("boardTitle")} description={t("boardSubtitle")} />
      <PipelineBoard
        leads={leadsRes.ok ? leadsRes.data : []}
        stages={pipelineRes.ok ? pipelineRes.data.stages : []}
        basePath="/staff"
      />
    </div>
  );
}
