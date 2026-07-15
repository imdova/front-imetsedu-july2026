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

  // Mega-menu data, fetched here (server) so the panel is populated on first
  // paint rather than flashing in from a client fetch. Categories are derived
  // from the live catalogue, so the menu can never list an empty category.
  const megaRes = await dal.courses.fetchCourses();
  const megaAll = (megaRes.ok ? megaRes.data : []).filter((c) => c.status === "published");
  const megaCourses = [...megaAll]
    .sort((a, b) => Number(b.isBestseller) - Number(a.isBestseller) || b.students - a.students)
    .slice(0, 12)
    .map((c) => ({
      id: c.id,
      slug: c.slug,
      title: (locale === "ar" ? c.titleAr : c.titleEn) || c.titleEn,
      category: c.category,
      thumbnailUrl: c.thumbnailUrl,
      price: c.priceEGP,
      salePrice: c.salePriceEGP,
      rating: c.rating,
      students: c.students,
      isBestseller: c.isBestseller,
    }));
  const megaCategories = Object.entries(
    megaAll.reduce<Record<string, number>>((acc, c) => {
      if (c.category && c.category !== "—") acc[c.category] = (acc[c.category] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({
      id: name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      name,
      count,
    }));

  return (
    <div className="flex min-h-svh flex-col">
      <JsonLd data={[organizationLd(), websiteLd()]} />
      <PublicBannerBar />
      <PublicHeader logoLight={logoLight} locale={locale} megaCategories={megaCategories} megaCourses={megaCourses} />
      <main className="flex-1">{children}</main>
      <PublicFooter logoLight={logoLight} />
    </div>
  );
}
