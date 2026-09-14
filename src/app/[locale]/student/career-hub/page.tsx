import { setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import {
  CareerHubWorkspace,
  type HubCourse,
} from "@/features/career-hub/components/career-hub-workspace";

export const metadata = { robots: { index: false, follow: false } };

/** A graduate's Career Hub — preferences, matched openings and career ladders. */
export default async function StudentCareerHubPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [profileRes, matchesRes, coursesRes, openRes] = await Promise.all([
    dal.careerHub.fetchMyCareerProfile(),
    dal.careerHub.fetchMyCareerMatches(),
    dal.courses.fetchPublishedCourses(),
    dal.careerHub.fetchJobs({ limit: 1 }),
  ]);

  const courses: HubCourse[] = coursesRes.ok
    ? coursesRes.data.map((c) => ({
        slug: c.slug,
        titleEn: c.titleEn,
        titleAr: c.titleAr,
        careerRoles: (c.careerRoles ?? []).filter((r) => r.titleEn || r.titleAr),
      }))
    : [];

  return (
    <div className="mx-auto max-w-[1400px]">
      <CareerHubWorkspace
        locale={locale}
        initialProfile={profileRes.ok ? profileRes.data : null}
        initialMatches={matchesRes.ok ? matchesRes.data.matches : []}
        courses={courses}
        openCount={openRes.ok ? openRes.data.facets.total : null}
      />
    </div>
  );
}
