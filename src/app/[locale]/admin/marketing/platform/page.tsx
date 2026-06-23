import { setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { PageHeader } from "@/components/shared/page-header";
import { PlatformMarketing } from "@/features/marketing-admin/components/platform-marketing";

export const metadata = { robots: { index: false } };

export default async function PlatformMarketingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [bannersRes, promotedRes] = await Promise.all([
    dal.marketing.fetchBanners(),
    dal.marketing.fetchPromoted(),
  ]);

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        title="Platform Marketing"
        description="Promo banners and featured placements shown across the public site."
      />
      <PlatformMarketing
        initialBanners={bannersRes.ok ? bannersRes.data : []}
        initialPromoted={promotedRes.ok ? promotedRes.data : []}
      />
    </div>
  );
}
