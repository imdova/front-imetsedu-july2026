import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { PipelineBoard } from "@/features/crm/components/pipeline-board";
import { PipelineSwitcher } from "@/features/crm/components/pipeline-switcher";
import { requirePermission, getSessionUser } from "@/lib/permission-guard";

export default async function AdminPipelineDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  await requirePermission("crm.pipelines.view");
  const user = await getSessionUser();
  const isStaff = user?.staffRole !== null && user?.staffRole !== undefined;
  const counselorId = isStaff ? (user?.staffId ?? user?.id) : undefined;

  const t = await getTranslations("Crm");

  const [viewRes, groupsRes, coursesRes, pipelinesRes, categoriesRes, subcategoriesRes] = await Promise.all([
    dal.crm.fetchPipelineView(id),
    dal.groups.fetchGroups(),
    dal.courses.fetchCourses(),
    dal.crm.fetchLeadPipelines(),
    dal.groups.fetchGroupCategories(),
    dal.groups.fetchGroupSubcategories(),
  ]);

  if (!viewRes.ok) notFound();

  const pipelines = pipelinesRes.ok ? pipelinesRes.data : [];
  const groupOptions = (groupsRes.ok ? groupsRes.data : []).map((g) => ({ value: g.id, label: g.title, categoryId: g.categoryId, subcategoryId: g.subcategoryId }));
  const courseNameById: Record<string, string> = {};
  if (coursesRes.ok) {
    for (const c of coursesRes.data) {
      if (c.id) courseNameById[c.id] = c.titleEn || c.titleAr || c.id;
    }
  }
  const leads = counselorId
    ? viewRes.data.leads.filter((l) => l.counselorId === counselorId)
    : viewRes.data.leads;

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <div className="space-y-4">
        <Button asChild variant="ghost" size="sm" className="gap-1.5 -ms-2">
          <Link href="/admin/crm/pipelines">
            <ArrowLeft className="size-4 rtl:rotate-180" />
            {t("allPipelines")}
          </Link>
        </Button>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <PageHeader title={viewRes.data.pipeline.title} description={t("boardSubtitle")} />
          {pipelines.length > 0 && (
            <PipelineSwitcher pipelines={pipelines} currentId={id} />
          )}
        </div>
      </div>
      <PipelineBoard
        leads={leads}
        stages={viewRes.data.pipeline.stages}
        basePath="/admin/crm"
        groupOptions={groupOptions}
        categories={categoriesRes.ok ? categoriesRes.data : []}
        subcategories={subcategoriesRes.ok ? subcategoriesRes.data : []}
        courseNameById={courseNameById}
      />
    </div>
  );
}
