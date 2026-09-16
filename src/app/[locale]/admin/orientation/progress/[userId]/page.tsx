import { setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { requireSuperAdmin } from "@/lib/permission-guard";
import { OrientationEmployeeReportView } from "@/features/orientation/components/orientation-employee-report";
import { loadOrientationProgrammes } from "@/features/orientation/lib/load-programmes";
import { resolveOrientation } from "@/features/orientation/lib/sales-orientation";

export const metadata = { robots: { index: false }, title: "Orientation report" };

/** One employee's Sales Orientation report — super-admin only (the backend requires admin). */
export default async function OrientationEmployeeReportPage({
  params,
}: {
  params: Promise<{ locale: string; userId: string }>;
}) {
  const { locale, userId } = await params;
  setRequestLocale(locale);
  await requireSuperAdmin();

  const [report, saved] = await Promise.all([
    dal.orientation.fetchOrientationEmployeeReport(userId),
    dal.orientation.fetchSalesOrientation(),
  ]);
  const resolved = resolveOrientation(saved.ok ? saved.data : null);
  const programmes = await loadOrientationProgrammes(resolved.content.programmes);
  const generatedAt = new Date().getTime();

  return (
    <div className="mx-auto max-w-[1320px]">
      {report.ok ? (
        <OrientationEmployeeReportView report={report.data} resolved={resolved} programmeCount={programmes.length} now={generatedAt} />
      ) : (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
          Couldn&apos;t load this report: {report.error}
        </div>
      )}
    </div>
  );
}
