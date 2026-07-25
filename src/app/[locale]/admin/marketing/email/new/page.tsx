import { setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { PageHeader } from "@/components/shared/page-header";
import { CampaignWizard } from "@/features/marketing-admin/components/campaign-wizard";

export const metadata = { robots: { index: false } };

export default async function NewCampaignPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ campaignId?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { campaignId } = await searchParams;

  const [templatesRes, audiencesRes, editingRes] = await Promise.all([
    dal.emailMarketing.fetchTemplates(),
    dal.emailMarketing.fetchAudiences(),
    campaignId ? dal.emailMarketing.fetchCampaign(campaignId) : Promise.resolve(null),
  ]);

  const editing = editingRes && editingRes.ok ? editingRes.data : null;

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <PageHeader
        title={editing ? "Edit campaign" : "New campaign"}
        description="Set up your campaign, pick a design and choose who receives it."
      />
      <CampaignWizard
        templates={templatesRes.ok ? templatesRes.data : []}
        audiences={audiencesRes.ok ? audiencesRes.data : []}
        editing={editing}
      />
    </div>
  );
}
