import { setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { SettingsConsole } from "@/features/admin/components/settings-console";

export default async function AdminSettingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [intgRes, themeRes] = await Promise.all([
    dal.siteSettings.fetchIntegrations(),
    dal.siteSettings.fetchTheme(),
  ]);

  const theme = themeRes.ok ? themeRes.data : {
    primaryColor: "#1111D4", accentColor: "#FBBF24", systemHighlight: "#62a0ea",
    headingFont: "Poppins", bodyFont: "Inter", radius: "square" as const,
  };

  return (
    <div className="mx-auto max-w-[1500px]">
      <SettingsConsole integrations={intgRes.ok ? intgRes.data : []} theme={theme} />
    </div>
  );
}
