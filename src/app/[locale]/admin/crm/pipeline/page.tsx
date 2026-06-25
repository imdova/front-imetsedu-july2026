import { getTranslations, setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { PageHeader } from "@/components/shared/page-header";
import { PipelineBoard } from "@/features/crm/components/pipeline-board";
import { requirePermission, getSessionUser } from "@/lib/permission-guard";

export default async function AdminPipelinePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  
  await requirePermission("crm.pipelines.view");
  const user = await getSessionUser();
  const isStaff = user?.staffRole !== null && user?.staffRole !== undefined;
  const counselorId = isStaff ? (user?.staffId ?? user?.id) : undefined;

  const t = await getTranslations("Crm");

  const [leadsRes, pipelineRes, groupsRes, coursesRes, categoriesRes, subcategoriesRes] = await Promise.all([
    dal.crm.fetchLeads({ counselorId }),
    dal.crm.fetchPipeline(),
    dal.groups.fetchGroups(),
    dal.courses.fetchCourses(),
    dal.groups.fetchGroupCategories(),
    dal.groups.fetchGroupSubcategories(),
  ]);
  const groupOptions = (groupsRes.ok ? groupsRes.data : []).map((g) => ({ value: g.id, label: g.title, categoryId: g.categoryId, subcategoryId: g.subcategoryId }));
  const courseNameById: Record<string, string> = {};
  if (coursesRes.ok) {
    for (const c of coursesRes.data) {
      if (c.id) courseNameById[c.id] = c.titleEn || c.titleAr || c.id;
    }
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <PageHeader title={t("boardTitle")} description={t("boardSubtitle")} />
      <PipelineBoard
        leads={leadsRes.ok ? leadsRes.data : []}
        stages={pipelineRes.ok ? pipelineRes.data.stages : []}
        basePath="/admin/crm"
        groupOptions={groupOptions}
        categories={categoriesRes.ok ? categoriesRes.data : []}
        subcategories={subcategoriesRes.ok ? subcategoriesRes.data : []}
        courseNameById={courseNameById}
      />
    </div>
  );
}
