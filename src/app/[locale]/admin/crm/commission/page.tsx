import { getTranslations, setRequestLocale } from "next-intl/server";

import { PageHeader } from "@/components/shared/page-header";
import { requirePermission } from "@/lib/permission-guard";
import { CommissionPanel } from "@/features/crm/components/commission-panel";

export const metadata = { robots: { index: false } };

export default async function CommissionPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requirePermission("crm.dashboard.view");
  const t = await getTranslations("Crm");

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader title={t("commissionTitle")} description={t("commissionSubtitle")} />
      <CommissionPanel />
    </div>
  );
}
