import { getTranslations, setRequestLocale } from "next-intl/server";

import { PageHeader } from "@/components/shared/page-header";
import { StaffAccountSettings } from "@/features/staff/components/staff-account-settings";

export default async function StaffSettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tn = await getTranslations("Nav");
  const t = await getTranslations("Staff");

  return (
    <div className="mx-auto max-w-[1100px] space-y-6">
      <PageHeader title={tn("settings")} description={t("settingsSubtitle")} />
      <StaffAccountSettings />
    </div>
  );
}
