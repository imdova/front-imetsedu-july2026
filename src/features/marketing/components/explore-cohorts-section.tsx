import { dal } from "@/lib/dal";
import { ExploreCohortsView } from "@/features/marketing/components/explore-cohorts-view";
import { nextCohort } from "@/features/marketing/lib/next-cohort";

/**
 * Data for the "explore courses / next live cohort" band under the home hero.
 *
 * Everything on it is live: the cards are the catalogue's real categories (each
 * links to its own page, with its published-course count), and the countdown
 * runs to the earliest open intake entered on a published course. With no
 * upcoming intake the view shows "dates announced soon" — a date is never made
 * up to keep a clock ticking.
 */
export async function ExploreCohortsSection({ locale }: { locale: string }) {
  const [catRes, courseRes] = await Promise.all([
    dal.courseTaxonomy.fetchPublicCategories(),
    dal.courses.fetchPublishedCourses(),
  ]);
  const courses = courseRes.ok ? courseRes.data : [];

  // Counted from the catalogue itself, the same way the header menu does, so a
  // category can never advertise courses that are not published.
  const counts = new Map<string, number>();
  for (const c of courses) counts.set(c.category, (counts.get(c.category) ?? 0) + 1);

  const categories = (catRes.ok ? catRes.data : [])
    .filter((c) => c.slug)
    .map((c) => ({
      id: c.id,
      slug: c.slug,
      name: locale === "ar" ? c.nameAr : c.nameEn,
      nameEn: c.nameEn,
      count: counts.get(c.nameEn) ?? 0,
    }));

  return <ExploreCohortsView categories={categories} cohort={nextCohort(courses, locale)} />;
}
