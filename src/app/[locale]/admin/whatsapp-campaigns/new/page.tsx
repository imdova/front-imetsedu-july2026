import { setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { PageHeader } from "@/components/shared/page-header";
import { WhatsappCampaignWizard } from "@/features/admin/components/whatsapp-campaign-wizard";

export const metadata = { robots: { index: false } };

export default async function NewWhatsappCampaignPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [templatesRes, groupsRes] = await Promise.all([
    dal.whatsapp.fetchTemplates(),
    dal.whatsapp.fetchGroups(),
  ]);

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6">
      <PageHeader title="New WhatsApp Campaign" description="Build a broadcast from an approved template or free text + media, pick recipients, then review and send." />
      <WhatsappCampaignWizard
        templates={templatesRes.ok ? templatesRes.data : []}
        groups={groupsRes.ok ? groupsRes.data : []}
      />
    </div>
  );
}
