import { BarChart3, ClipboardList, Pencil } from "lucide-react";
import { setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import { can, getSessionUser, requirePermission } from "@/lib/permission-guard";
import { Button } from "@/components/ui/button";
import { SalesOrientation } from "@/features/orientation/components/sales-orientation";
import { WEEK_TOOL_LINKS } from "@/features/orientation/lib/course-map";
import { orientationT, toOrientationLocale } from "@/features/orientation/lib/i18n";
import { loadOrientationProgrammes } from "@/features/orientation/lib/load-programmes";
import { resolveOrientation } from "@/features/orientation/lib/sales-orientation";

export const metadata = { robots: { index: false } };

/**
 * Sales Orientation — its own page, listed under Office in the CRM sidebar.
 *
 * Gated by `training.orientation.view` (super-admins pass; anyone else without
 * the key gets a 404). Editing the training, team progress (with sign-off) and
 * task submissions are super-admin only, and the backend requires admin for them.
 */
export default async function OrientationPage({ params }: { params: Promise<{ locale: string }> }) {
  await requirePermission("training.orientation.view");

  const { locale } = await params;
  setRequestLocale(locale);
  const t = orientationT(toOrientationLocale(locale));

  // A failed read falls back to the bundled content / empty progress rather than hiding the training.
  const [saved, myProgress, user] = await Promise.all([
    dal.orientation.fetchSalesOrientation(),
    dal.orientation.fetchMyOrientationProgress(),
    getSessionUser(),
  ]);
  const { lessons, modules, content, contentEn } = resolveOrientation(saved.ok ? saved.data : null);
  const programmes = await loadOrientationProgrammes(content.programmes);
  const isSuperAdmin = !!user && user.role === "admin" && user.staffRole === null;

  // The first-week lesson links to CRM pages only for people who can open them.
  const toolAccess = Object.fromEntries(
    await Promise.all(Object.entries(WEEK_TOOL_LINKS).map(async ([key, tool]) => [key, await can(tool.permission)] as const)),
  );

  return (
    <div className="mx-auto max-w-[1320px]">
      <SalesOrientation
        lessons={lessons}
        modules={modules}
        content={content}
        contentEn={contentEn}
        programmes={programmes}
        initialProgress={myProgress.ok ? myProgress.data : null}
        userName={(user?.name ?? "").trim().split(/\s+/)[0] ?? ""}
        toolAccess={toolAccess}
        actions={
          isSuperAdmin ? (
            <>
              <Button asChild variant="outline" size="sm" className="gap-1.5">
                <Link href="/admin/orientation/progress">
                  <BarChart3 className="size-3.5" /> {t("admin.teamProgress")}
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="gap-1.5">
                <Link href="/admin/orientation/tasks">
                  <ClipboardList className="size-3.5" /> {t("admin.tasks")}
                </Link>
              </Button>
              <Button asChild size="sm" className="gap-1.5">
                <Link href="/admin/orientation/edit">
                  <Pencil className="size-3.5" /> {t("admin.edit")}
                </Link>
              </Button>
            </>
          ) : undefined
        }
      />
    </div>
  );
}
