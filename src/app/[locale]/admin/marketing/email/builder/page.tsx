import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { Link } from "@/i18n/navigation";
import { EmailBuilder } from "@/features/marketing-admin/components/email-builder";

export const metadata = { robots: { index: false } };

export default async function EmailBuilderPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ campaignId?: string; templateId?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { campaignId, templateId } = await searchParams;

  const brandBlocksRes = await dal.emailMarketing.fetchBrandBlocks();
  const brandBlocks = brandBlocksRes.ok ? brandBlocksRes.data : [];

  let entityType: "campaign" | "template" | null = null;
  let entityId = "";
  let entityName = "";
  let design: string | null = null;

  if (campaignId) {
    const res = await dal.emailMarketing.fetchCampaign(campaignId);
    if (res.ok && res.data) { entityType = "campaign"; entityId = res.data.id; entityName = res.data.subject; design = res.data.design ?? null; }
  } else if (templateId) {
    const res = await dal.emailMarketing.fetchTemplate(templateId);
    if (res.ok && res.data) { entityType = "template"; entityId = res.data.id; entityName = res.data.name; design = res.data.design ?? null; }
  }

  if (!entityType) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <p className="text-sm text-muted-foreground">No campaign or template selected.</p>
        <Link href="/admin/marketing/email" className="mt-2 inline-block text-sm text-primary hover:underline">Back to Email Marketing</Link>
      </div>
    );
  }

  return (
    <div className="px-2">
      <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Loading builder…</div>}>
        <EmailBuilder
          entityType={entityType}
          entityId={entityId}
          entityName={entityName}
          initialDesign={design}
          initialBrandBlocks={brandBlocks}
        />
      </Suspense>
    </div>
  );
}
