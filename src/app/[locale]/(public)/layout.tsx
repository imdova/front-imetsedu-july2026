import type { ReactNode } from "react";
import { setRequestLocale } from "next-intl/server";

import { PublicHeader } from "@/features/marketing/components/public-header";
import { PublicFooter } from "@/features/marketing/components/public-footer";
import { PublicBannerBar } from "@/features/marketing/components/public-banner-bar";
import { getTheme } from "@/lib/db/site-settings";
import { dal } from "@/lib/dal";
import { JsonLd } from "@/components/seo/json-ld";
import { organizationLd, websiteLd } from "@/lib/seo";
import { Wrench } from "lucide-react";

/** Public marketing shell: header + content + footer. No authenticated chrome. */
export default async function PublicLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [theme, settings] = await Promise.all([
    getTheme().catch(() => null),
    dal.siteSettings.fetchPublicSettings().then((r) => (r.ok ? r.data : null)).catch(() => null),
  ]);
  const logoLight = theme?.logoLight;

  // Maintenance gate — when enabled, the public site shows the maintenance
  // screen. (Admins reach /admin via the protected area, which is unaffected.)
  if (settings?.maintenance?.enabled) {
    return (
      <div className="grid min-h-svh place-items-center px-6 text-center">
        <div className="max-w-md space-y-4">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Wrench className="size-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{settings.general?.siteName || "We'll be right back"}</h1>
          <p className="text-muted-foreground">{settings.maintenance.message || "The site is temporarily down for maintenance."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh flex-col">
      <JsonLd data={[organizationLd(), websiteLd()]} />
      <PublicBannerBar />
      <PublicHeader logoLight={logoLight} />
      <main className="flex-1">{children}</main>
      <PublicFooter logoLight={logoLight} />
    </div>
  );
}
