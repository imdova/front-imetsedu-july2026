import { setRequestLocale } from "next-intl/server";

import { requireSuperAdmin } from "@/lib/permission-guard";
import { AuthorApplicationsManager } from "@/features/admin/components/author-applications-manager";

export const metadata = { robots: { index: false } };

/**
 * Applications from the public "Write for IMETS" page.
 *
 * Super-admin only, matching instructor applications (adminOnly in the nav
 * model): each record carries an applicant's email and WhatsApp number, which
 * is not data every staff role needs.
 */
export default async function AdminAuthorApplicationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireSuperAdmin();

  return (
    <div className="mx-auto max-w-[1400px]">
      <AuthorApplicationsManager />
    </div>
  );
}
