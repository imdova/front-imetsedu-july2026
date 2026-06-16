import { ArrowLeft } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { CreateLeadForm } from "@/features/crm/components/create-lead-form";

export default async function NewLeadPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Crm");

  const [counselorsRes, coursesRes, optionsRes] = await Promise.all([
    dal.crm.fetchCounselors(),
    dal.courses.fetchCourses(),
    dal.crm.fetchCrmFieldOptions(),
  ]);

  const courseOptions = (coursesRes.ok ? coursesRes.data : []).map((c) => ({
    value: c.id,
    label: c.titleEn || c.titleAr || c.slug,
  }));
  const fieldOpts = optionsRes.ok ? optionsRes.data : { sources: [], specialties: [], educationLevels: [] };

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-8">
      <div className="space-y-4">
        <Button asChild variant="ghost" size="sm" className="gap-1.5 -ms-2">
          <Link href="/staff/leads">
            <ArrowLeft className="size-4 rtl:rotate-180" />
            {t("backToLeads")}
          </Link>
        </Button>
        <PageHeader title={t("createLead")} description={t("leadsSubtitle")} />
      </div>
      <CreateLeadForm
        counselors={counselorsRes.ok ? counselorsRes.data : []}
        courseOptions={courseOptions}
        sourceOptions={fieldOpts.sources}
        specialtyOptions={fieldOpts.specialties}
        educationLevelOptions={fieldOpts.educationLevels}
        basePath="/staff"
      />
    </div>
  );
}
