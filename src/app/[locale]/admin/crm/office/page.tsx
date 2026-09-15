import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { PageHeader } from "@/components/shared/page-header";
import { can, getSessionUser } from "@/lib/permission-guard";
import { OfficePanel } from "@/features/crm/components/office-panel";
import { loadOrientationProgrammes } from "@/features/orientation/lib/load-programmes";
import { resolveOrientation } from "@/features/orientation/lib/sales-orientation";

export const metadata = { robots: { index: false } };

/**
 * Office — the team's day-to-day tools, plus Sales Orientation.
 *
 * Two permissions meet here. `crm.office.view` opens the templates, sheets and
 * links; `training.orientation.view` opens the training tab. Orientation was
 * its own page, gated so a role could be given the training without the
 * console around it — that still holds: a role with only the training key sees
 * only that tab. Neither key ⇒ 404, like `requirePermission`.
 *
 * Editing the training and seeing the team's progress are super-admin only
 * (the backend enforces admin too).
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

  const [showOffice, showOrientation, user] = await Promise.all([
    can("crm.office.view"),
    can("training.orientation.view"),
    getSessionUser(),
  ]);
  if (!showOffice && !showOrientation) notFound();

  const { tab } = await searchParams;

  let orientation = null;
  if (showOrientation) {
    // A failed read falls back to the bundled content / empty progress rather than hiding the training.
    const [saved, myProgress] = await Promise.all([
      dal.orientation.fetchSalesOrientation(),
      dal.orientation.fetchMyOrientationProgress(),
    ]);
    const resolved = resolveOrientation(saved.ok ? saved.data : null);
    orientation = {
      ...resolved,
      programmes: await loadOrientationProgrammes(resolved.content.programmes),
      progress: myProgress.ok ? myProgress.data : null,
    };
  }
  const isSuperAdmin = !!user && user.role === "admin" && user.staffRole === null;

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        title="Office"
        description="Templates, sheets, documents and training your team uses day to day."
      />
      <OfficePanel
        showOffice={showOffice}
        orientation={orientation}
        canManageOrientation={isSuperAdmin}
        initialTab={tab}
      />
    </div>
  );
}
