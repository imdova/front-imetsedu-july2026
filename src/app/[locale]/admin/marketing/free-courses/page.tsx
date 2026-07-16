import { setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { requireSuperAdmin } from "@/lib/permission-guard";
import { PageHeader } from "@/components/shared/page-header";
import { FreeCoursesManager } from "@/features/marketing-admin/components/free-courses-manager";

export const metadata = { robots: { index: false } };

export default async function FreeCoursesAdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  // The backend controller is @SuperAdminOnly() — gate here too so a staff user
  // gets a clean 404 instead of a page that 401s on every request.
  await requireSuperAdmin();

  const res = await dal.freeCourses.fetchAllFreePrograms();
  const programs = res.ok ? res.data : [];

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <PageHeader
        title="Free Courses"
        description="Author the public free mini-LMS at /free-courses — programs, their lectures, and what's live. Guests unlock the player with a short form; every submission lands in Exam Leads."
      />
      <FreeCoursesManager initial={programs} />
    </div>
  );
}
