import { getTranslations, setRequestLocale } from "next-intl/server";

import { PageHeader } from "@/components/shared/page-header";
import { AccountSettings } from "@/features/student/components/account-settings";

export default async function StudentSettingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Student");
  return (
    <div className="mx-auto max-w-[1100px] space-y-6">
      <PageHeader title={t("accountSettingsTitle")} description={t("accountSettingsSubtitle")} />
      <AccountSettings />
    </div>
  );
}
