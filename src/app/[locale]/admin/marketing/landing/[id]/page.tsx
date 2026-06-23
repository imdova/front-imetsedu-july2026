import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { dal } from "@/lib/dal";
import { LandingPageDetails } from "@/features/marketing-admin/components/landing-page-details";

export const metadata = { robots: { index: false } };

export default async function LandingPageDetailsRoute({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const pageRes = await dal.landing.fetchLandingPage(id);
  if (!pageRes.ok || !pageRes.data) notFound();
  const page = pageRes.data;

  const regsRes = await dal.landing.fetchRegistrationsByPath(page.path);

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <LandingPageDetails
        page={page}
        initialRegistrations={regsRes.ok ? regsRes.data : []}
      />
    </div>
  );
}
