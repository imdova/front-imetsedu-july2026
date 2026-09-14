import { setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { requireSuperAdmin } from "@/lib/permission-guard";
import { CareerOverview } from "@/features/career-hub/components/career-overview";

export const metadata = { robots: { index: false } };

/** Career Hub overview — super-admin only, matching the nav section's `adminOnly`. */
export default async function AdminCareerHubOverviewPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireSuperAdmin();

  const res = await dal.careerHub.fetchCareerOverview();

  return (
    <div className="mx-auto max-w-[1400px]">
      {res.ok ? (
        <CareerOverview data={res.data} />
      ) : (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
          Couldn&apos;t load the Career Hub overview: {res.error}
        </div>
      )}
    </div>
  );
}
