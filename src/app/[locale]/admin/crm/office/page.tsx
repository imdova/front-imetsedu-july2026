import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { PageHeader } from "@/components/shared/page-header";
import { can } from "@/lib/permission-guard";
import { OfficePanel } from "@/features/crm/components/office-panel";
import { loadOrientationProgrammes } from "@/features/orientation/lib/load-programmes";

export const metadata = { robots: { index: false } };

/**
 * Office — the team's day-to-day tools, plus Sales Orientation.
 *
 * Two permissions meet here. `crm.office.view` opens the templates, sheets and
 * links; `training.orientation.view` opens the training tab. Orientation was
 * its own page, gated so a role could be given the training without the
 * console around it — that still holds: a role with only the training key sees
 * only that tab. Neither key ⇒ 404, like `requirePermission`.
 */
export default async function OfficePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [showOffice, showOrientation] = await Promise.all([
    can("crm.office.view"),
    can("training.orientation.view"),
  ]);
  if (!showOffice && !showOrientation) notFound();

  const { tab } = await searchParams;
  const programmes = showOrientation ? await loadOrientationProgrammes() : null;

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        title="Office"
        description="Templates, sheets, documents and training your team uses day to day."
      />
      <OfficePanel showOffice={showOffice} orientationProgrammes={programmes} initialTab={tab} />
    </div>
  );
}
