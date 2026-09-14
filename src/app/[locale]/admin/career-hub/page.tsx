import { setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { requireSuperAdmin } from "@/lib/permission-guard";
import { CareerJobsManager } from "@/features/career-hub/components/career-jobs-manager";

export const metadata = { robots: { index: false } };

/** Career Hub listings — super-admin only, matching the nav item's `adminOnly`. */
export default async function AdminCareerHubPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireSuperAdmin();

  const coursesRes = await dal.courses.fetchPublishedCourses();
  const courses = coursesRes.ok ? coursesRes.data.map((c) => ({ slug: c.slug, title: c.titleEn || c.titleAr })) : [];

  return (
    <div className="mx-auto max-w-[1400px]">
      <CareerJobsManager courses={courses} />
    </div>
  );
}
