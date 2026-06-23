import { setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { PageHeader } from "@/components/shared/page-header";
import { EmailMarketing } from "@/features/marketing-admin/components/email-marketing";

export const metadata = { robots: { index: false } };

const EMPTY_STATS = {
  totalSubscribers: 0, totalCampaigns: 0, sentCampaigns: 0, scheduledCampaigns: 0,
  totalRecipients: 0, totalOpens: 0, totalClicks: 0,
};

export default async function EmailMarketingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [campaignsRes, templatesRes, automationsRes, segmentsRes, statsRes] = await Promise.all([
    dal.emailMarketing.fetchCampaigns(),
    dal.emailMarketing.fetchTemplates(),
    dal.emailMarketing.fetchAutomations(),
    dal.emailMarketing.fetchSegments(),
    dal.emailMarketing.fetchEmailStats(),
  ]);

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        title="Email Marketing"
        description="Campaigns, templates, automations and audience analytics."
      />
      <EmailMarketing
        initialCampaigns={campaignsRes.ok ? campaignsRes.data : []}
        initialTemplates={templatesRes.ok ? templatesRes.data : []}
        initialAutomations={automationsRes.ok ? automationsRes.data : []}
        initialSegments={segmentsRes.ok ? segmentsRes.data : []}
        initialStats={statsRes.ok ? statsRes.data : EMPTY_STATS}
      />
    </div>
  );
}
