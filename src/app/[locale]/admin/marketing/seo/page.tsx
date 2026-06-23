import { setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { PageHeader } from "@/components/shared/page-header";
import { SeoManager } from "@/features/marketing-admin/components/seo-manager";

export const metadata = { robots: { index: false } };

const EMPTY_OVERVIEW = { avgPageScore: 0, pageOverrides: 0, redirects: 0, noindexPages: 0, issues: [] };
const EMPTY_SUMMARY = { total: 0, active: 0, valid: 0, needAttention: 0, healthScore: 100 };

export default async function SeoManagerPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [overviewRes, settingsRes, pagesRes, redirectsRes, schemasRes] = await Promise.all([
    dal.seo.fetchOverview(),
    dal.seo.fetchSettings(),
    dal.seo.fetchPages(),
    dal.seo.fetchRedirects(),
    dal.seo.fetchSchemas(),
  ]);

  if (!settingsRes.ok) {
    return (
      <div className="mx-auto max-w-[1400px] space-y-6">
        <PageHeader title="SEO Manager" description="Global SEO settings, page overrides, redirects and schema." />
        <p className="text-sm text-destructive">Failed to load SEO settings.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        title="SEO Manager"
        description="Global SEO settings, per-page overrides, redirects and JSON-LD schema."
      />
      <SeoManager
        overview={overviewRes.ok ? overviewRes.data : EMPTY_OVERVIEW}
        settings={settingsRes.data}
        pages={pagesRes.ok ? pagesRes.data : []}
        redirects={redirectsRes.ok ? redirectsRes.data : []}
        schemas={schemasRes.ok ? schemasRes.data.data : []}
        schemaSummary={schemasRes.ok ? schemasRes.data.summary : EMPTY_SUMMARY}
      />
    </div>
  );
}
