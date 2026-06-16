import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import { Button } from "@/components/ui/button";
import { LeadDetail } from "@/features/crm/components/lead-detail";
import { requirePermission, getSessionUser } from "@/lib/permission-guard";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  
  await requirePermission("crm.leads.view");
  const user = await getSessionUser();
  const isStaff = user?.staffRole !== null && user?.staffRole !== undefined;

  const t = await getTranslations("Crm");

  const [leadRes, pipelineRes, pipelinesRes, coursesRes] = await Promise.all([
    dal.crm.fetchLead(id),
    dal.crm.fetchPipeline(),
    dal.crm.fetchLeadPipelines(),
    dal.courses.fetchCourses(),
  ]);

  if (!leadRes.ok || !leadRes.data) notFound();

  // Enforce staff isolation: staff can only view leads assigned to them.
  if (isStaff) {
    const userStaffId = user?.staffId ?? user?.id;
    if (leadRes.data.counselorId !== userStaffId) {
      notFound();
    }
  }

  const assignablePipelines = (pipelinesRes.ok ? pipelinesRes.data : []).map((p) => ({
    id: p.value,
    title: p.label,
  }));
  const courseOptions = (coursesRes.ok ? coursesRes.data : []).map((c) => ({
    value: c.id,
    label: c.titleEn || c.titleAr || c.slug,
    image: c.thumbnailUrl,
  }));

  const stageRes = await Promise.all(
    (leadRes.data.pipelines ?? []).map((p) => dal.crm.fetchPipelineStages(p.id)),
  );
  const pipelineStages = stageRes.filter((r) => r.ok).map((r) => r.data);

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <Button asChild variant="ghost" size="sm" className="gap-1.5 -ms-2">
        <Link href="/staff/leads">
          <ArrowLeft className="size-4 rtl:rotate-180" />
          {t("backToLeads")}
        </Link>
      </Button>
      <LeadDetail
        lead={leadRes.data}
        stages={pipelineRes.ok ? pipelineRes.data.stages : []}
        assignablePipelines={assignablePipelines}
        pipelineStages={pipelineStages}
        courseOptions={courseOptions}
      />
    </div>
  );
}
