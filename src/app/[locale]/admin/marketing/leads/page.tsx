import { setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { PageHeader } from "@/components/shared/page-header";
import { ExamLeadsPanel } from "@/features/marketing-admin/components/exam-leads-panel";

export const metadata = { robots: { index: false } };

export default async function ExamLeadsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const leadsRes = await dal.landing.fetchLeads();

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        title="Free Exam Leads"
        description="Lead inbox for the public Free Exam funnel."
      />
      <ExamLeadsPanel initialLeads={leadsRes.ok ? leadsRes.data : []} />
    </div>
  );
}
