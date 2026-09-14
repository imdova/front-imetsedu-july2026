import { setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { requireSuperAdmin } from "@/lib/permission-guard";
import { CareerProfilesManager } from "@/features/career-hub/components/career-profiles-manager";

export const metadata = { robots: { index: false } };

/** Graduate career profiles — super-admin only: each row carries contact details. */
export default async function AdminCareerProfilesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireSuperAdmin();

  const coursesRes = await dal.courses.fetchPublishedCourses();
  const courses = coursesRes.ok ? coursesRes.data.map((c) => ({ slug: c.slug, title: c.titleEn || c.titleAr })) : [];

  return (
    <div className="mx-auto max-w-[1400px]">
      <CareerProfilesManager courses={courses} />
    </div>
  );
}
