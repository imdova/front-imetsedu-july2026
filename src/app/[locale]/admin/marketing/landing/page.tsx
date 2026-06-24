import { setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { PageHeader } from "@/components/shared/page-header";
import { LandingPagesPanel } from "@/features/marketing-admin/components/landing-pages-panel";

export const metadata = { robots: { index: false } };

const EMPTY_STATS = { total: 0, published: 0, drafts: 0, views: 0, clicks: 0, ctr: 0 };

export default async function LandingPagesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [pagesRes, statsRes] = await Promise.all([
    dal.landing.fetchLandingPages({ sort: "newest" }),
    dal.landing.fetchLandingStats(),
  ]);

  return (
    <div className="mx-auto max-w-[1400px] space-y-8">
      <div className="space-y-6">
        <PageHeader
          title="Landing Pages"
          description="Campaign landing-page registry with live views, clicks and CTR."
        />
        <LandingPagesPanel
          initialPages={pagesRes.ok ? pagesRes.data : []}
          initialStats={statsRes.ok ? statsRes.data : EMPTY_STATS}
        />
      </div>
    </div>
  );
}
