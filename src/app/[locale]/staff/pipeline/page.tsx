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

  const [leadsRes, pipelineRes, groupsRes, categoriesRes, subcategoriesRes] = await Promise.all([
    dal.crm.fetchLeads({ counselorId }),
    dal.crm.fetchPipeline(),
    dal.groups.fetchGroups(),
    dal.groups.fetchGroupCategories(),
    dal.groups.fetchGroupSubcategories(),
  ]);
  const groupOptions = (groupsRes.ok ? groupsRes.data : []).map((g) => ({ value: g.id, label: g.title, categoryId: g.categoryId, subcategoryId: g.subcategoryId }));

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <PageHeader title={t("boardTitle")} description={t("boardSubtitle")} />
      <PipelineBoard
        leads={leadsRes.ok ? leadsRes.data : []}
        stages={pipelineRes.ok ? pipelineRes.data.stages : []}
        basePath="/staff"
        groupOptions={groupOptions}
        categories={categoriesRes.ok ? categoriesRes.data : []}
        subcategories={subcategoriesRes.ok ? subcategoriesRes.data : []}
      />
    </div>
  );
}
