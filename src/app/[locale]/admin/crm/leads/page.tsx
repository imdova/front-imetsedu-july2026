import { Plus } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { LeadsTable } from "@/features/crm/components/leads-table";

export default async function AdminLeadsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Crm");

  const [leadsRes, pipelineRes, counselorsRes, pipelinesRes, coursesRes, fieldOptsRes] = await Promise.all([
    dal.crm.fetchLeads(),
    dal.crm.fetchPipeline(),
    dal.crm.fetchCounselors(),
    dal.crm.fetchLeadPipelines(),
    dal.courses.fetchCourses(),
    dal.crm.fetchCrmFieldOptions(),
  ]);

  const courseOptions = (coursesRes.ok ? coursesRes.data : []).map((c) => ({
    value: c.id,
    label: c.titleEn || c.titleAr || c.slug,
  }));
  // Real lead-source options from CRM settings (the table falls back to seeds).
  const sourceOptions = fieldOptsRes.ok ? fieldOptsRes.data.sources : [];

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader title={t("leadsTitle")} description={t("leadsSubtitle")}>
        <Button asChild className="gap-1.5">
          <Link href="/admin/crm/leads/new">
            <Plus className="size-4" />
            {t("newLead")}
          </Link>
        </Button>
      </PageHeader>
      <LeadsTable
        initialData={leadsRes.ok ? leadsRes.data : []}
        stages={pipelineRes.ok ? pipelineRes.data.stages : []}
        counselors={counselorsRes.ok ? counselorsRes.data : []}
        pipelines={pipelinesRes.ok ? pipelinesRes.data : []}
        courseOptions={courseOptions}
        sourceOptions={sourceOptions}
        basePath="/admin/crm"
      />
    </div>
  );
}
