import { getTranslations, setRequestLocale } from "next-intl/server";

import { PageHeader } from "@/components/shared/page-header";
import { CrmVariables } from "@/features/crm/components/crm-variables";

export default async function AdminCrmSettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Admin");

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader title={t("crmSettingsTitle")} description={t("crmSettingsSubtitle")} />
      <CrmVariables />
    </div>
  );
}
