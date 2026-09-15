import { setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { requireSuperAdmin } from "@/lib/permission-guard";
import { OrientationTeamProgress } from "@/features/orientation/components/orientation-team-progress";
import { resolveOrientation } from "@/features/orientation/lib/sales-orientation";

export const metadata = { robots: { index: false } };

/** Sales Orientation progress for the whole team — super-admin only (the backend requires admin). */
export default async function OrientationTeamProgressPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireSuperAdmin();

  const [team, saved] = await Promise.all([
    dal.orientation.fetchTeamOrientationProgress(),
    dal.orientation.fetchSalesOrientation(),
  ]);
  const { lessons } = resolveOrientation(saved.ok ? saved.data : null);

  return (
    <div className="mx-auto max-w-[1400px]">
      {team.ok ? (
        <OrientationTeamProgress data={team.data} lessons={lessons} />
      ) : (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
          Couldn&apos;t load team progress: {team.error}
        </div>
      )}
    </div>
  );
}
