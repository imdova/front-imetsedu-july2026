import { setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { PageHeader } from "@/components/shared/page-header";
import { WhatsappMarketing } from "@/features/admin/components/whatsapp-marketing";

export const metadata = { robots: { index: false } };

export default async function AdminWhatsappPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [statusRes, templatesRes, groupsRes, campaignsRes, automationsRes] = await Promise.all([
    dal.whatsapp.fetchStatus(),
    dal.whatsapp.fetchTemplates(),
    dal.whatsapp.fetchGroups(),
    dal.whatsapp.fetchCampaigns(),
    dal.whatsapp.fetchAutomations(),
  ]);

  return (
    <div className="mx-auto max-w-[1100px] space-y-6">
      <PageHeader
        title="WhatsApp Marketing"
        description="Send approved-template broadcasts to your subscribers and automate WhatsApp drips — via the Meta WhatsApp Cloud API."
      />
      <WhatsappMarketing
        initialStatus={statusRes.ok ? statusRes.data : null}
        initialTemplates={templatesRes.ok ? templatesRes.data : []}
        initialGroups={groupsRes.ok ? groupsRes.data : []}
        initialCampaigns={campaignsRes.ok ? campaignsRes.data : []}
        initialAutomations={automationsRes.ok ? automationsRes.data : []}
      />
    </div>
  );
}
