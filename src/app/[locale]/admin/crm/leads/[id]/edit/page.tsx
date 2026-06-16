import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { CreateLeadForm } from "@/features/crm/components/create-lead-form";

export default async function AdminEditLeadPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Crm");

  const [leadRes, counselorsRes, coursesRes, optionsRes] = await Promise.all([
    dal.crm.fetchLead(id),
    dal.crm.fetchCounselors(),
    dal.courses.fetchCourses(),
    dal.crm.fetchCrmFieldOptions(),
  ]);
  if (!leadRes.ok || !leadRes.data) notFound();

  const courseOptions = (coursesRes.ok ? coursesRes.data : []).map((c) => ({
    value: c.id,
    label: c.titleEn || c.titleAr || c.slug,
  }));
  const fieldOpts = optionsRes.ok ? optionsRes.data : { sources: [], specialties: [], educationLevels: [] };

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-8">
      <div className="space-y-4">
        <Button asChild variant="ghost" size="sm" className="gap-1.5 -ms-2">
          <Link href={`/admin/crm/leads/${id}`}>
            <ArrowLeft className="size-4 rtl:rotate-180" />
            {t("backToLead")}
          </Link>
        </Button>
        <PageHeader title={t("editLeadTitle", { name: leadRes.data.fullName || leadRes.data.phone })} description={t("editLeadSubtitle")} />
      </div>
      <CreateLeadForm
        editLead={leadRes.data}
        counselors={counselorsRes.ok ? counselorsRes.data : []}
        courseOptions={courseOptions}
        sourceOptions={fieldOpts.sources}
        specialtyOptions={fieldOpts.specialties}
        educationLevelOptions={fieldOpts.educationLevels}
        basePath="/admin/crm"
      />
    </div>
  );
}
