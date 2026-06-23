import { setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { DEFAULT_FULL_SETTINGS } from "@/lib/dal/site-settings";
import { SiteSettingsClient } from "@/features/admin/components/site-settings-client";

export const metadata = { robots: { index: false } };

export default async function AdminSettingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const res = await dal.siteSettings.fetchFullSettings();

  return (
    <div className="mx-auto max-w-[1500px]">
      <SiteSettingsClient initial={res.ok ? res.data : DEFAULT_FULL_SETTINGS} />
    </div>
  );
}
