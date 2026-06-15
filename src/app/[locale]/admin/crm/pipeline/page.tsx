import { getTranslations, setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { PageHeader } from "@/components/shared/page-header";
import { PipelineBoard } from "@/features/crm/components/pipeline-board";

export default async function AdminPipelinePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Crm");

  const [leadsRes, pipelineRes] = await Promise.all([
    dal.crm.fetchLeads(),
    dal.crm.fetchPipeline(),
  ]);

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <PageHeader title={t("boardTitle")} description={t("boardSubtitle")} />
      <PipelineBoard
        leads={leadsRes.ok ? leadsRes.data : []}
        stages={pipelineRes.ok ? pipelineRes.data.stages : []}
        basePath="/admin/crm"
      />
    </div>
  );
}
