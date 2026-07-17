import { setRequestLocale } from "next-intl/server";

import { requireSuperAdmin } from "@/lib/permission-guard";
import { InstructorApplicationsManager } from "@/features/admin/components/instructor-applications-manager";

export const metadata = { robots: { index: false } };

/**
 * Applications from the public "Teach at IMETS" page.
 *
 * Super-admin only, matching /admin/instructors (adminOnly in the nav model):
 * these records carry an applicant's contact details, which is not data every
 * staff role needs.
 */
export default async function AdminInstructorApplicationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireSuperAdmin();

  return (
    <div className="mx-auto max-w-[1400px]">
      <InstructorApplicationsManager />
    </div>
  );
}
