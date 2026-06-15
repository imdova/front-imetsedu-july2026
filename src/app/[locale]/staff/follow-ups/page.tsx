import { getTranslations, setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { PageHeader } from "@/components/shared/page-header";
import { FollowUpsList } from "@/features/crm/components/follow-ups-list";

export default async function StaffFollowUpsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Crm");

  const res = await dal.crm.fetchLeads();

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader title={t("followUpsTitle")} description={t("followUpsSubtitle")} />
      <FollowUpsList leads={res.ok ? res.data : []} basePath="/staff" />
    </div>
  );
}
