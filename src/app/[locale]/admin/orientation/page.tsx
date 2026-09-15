import { BarChart3, ClipboardList, Pencil } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import { getSessionUser, requirePermission } from "@/lib/permission-guard";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { SalesOrientation } from "@/features/orientation/components/sales-orientation";
import { loadOrientationProgrammes } from "@/features/orientation/lib/load-programmes";
import { resolveOrientation } from "@/features/orientation/lib/sales-orientation";

export const metadata = { robots: { index: false } };

/**
 * Sales Orientation — its own page, listed under Office in the CRM sidebar.
 *
 * Gated by `training.orientation.view` (super-admins pass; anyone else without
 * the key gets a 404). Editing the training, team progress and task
 * submissions are super-admin only, and the backend requires admin for them.
 */
export default async function OrientationPage({ params }: { params: Promise<{ locale: string }> }) {
  await requirePermission("training.orientation.view");

  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Nav");

  // A failed read falls back to the bundled content / empty progress rather than hiding the training.
  const [saved, myProgress, user] = await Promise.all([
    dal.orientation.fetchSalesOrientation(),
    dal.orientation.fetchMyOrientationProgress(),
    getSessionUser(),
  ]);
  const { lessons, content } = resolveOrientation(saved.ok ? saved.data : null);
  const programmes = await loadOrientationProgrammes(content.programmes);
  const isSuperAdmin = !!user && user.role === "admin" && user.staffRole === null;

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader title={t("salesOrientation")} description={t("salesOrientationDesc")}>
        {isSuperAdmin && (
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm" className="gap-1.5">
              <Link href="/admin/orientation/progress">
                <BarChart3 className="size-3.5" /> Team progress
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="gap-1.5">
              <Link href="/admin/orientation/tasks">
                <ClipboardList className="size-3.5" /> Task submissions
              </Link>
            </Button>
            <Button asChild size="sm" className="gap-1.5">
              <Link href="/admin/orientation/edit">
                <Pencil className="size-3.5" /> Edit training content &amp; videos
              </Link>
            </Button>
          </div>
        )}
      </PageHeader>
      {/* The training content stays Arabic in both locales — see `sales-orientation.tsx`. */}
      <SalesOrientation
        lessons={lessons}
        content={content}
        programmes={programmes}
        initialProgress={myProgress.ok ? myProgress.data : null}
      />
    </div>
  );
}
