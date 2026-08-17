import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { WhatsappCampaignDetail } from "@/features/admin/components/whatsapp-campaign-detail";

export const metadata = { robots: { index: false } };

export default async function WhatsappCampaignPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const res = await dal.whatsapp.fetchCampaignReport(id);
  if (!res.ok) notFound();

  return (
    <div className="mx-auto w-full max-w-[1600px]">
      <WhatsappCampaignDetail initial={res.data} />
    </div>
  );
}
