import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { CourseCatalog } from "@/features/marketing/components/course-catalog";
import { CatalogHeroBanner } from "@/features/marketing/components/catalog-hero-banner";
import { seoAlternates, socialMeta, courseListLd, localeUrl, metaDescription } from "@/lib/seo";
import { mergeSeo } from "@/lib/public-seo";
import { JsonLd } from "@/components/seo/json-ld";
import { toCatalogCourse } from "@/features/marketing/lib/course-card-data";

/** Course listing. Cleared early by the cache tags on its data. */
export const revalidate = 600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Marketing" });
  // Meta title/description are deliberately separate from the on-page H1:
  // a ~60-char SERP title and a ~155-char description have different jobs to
  // the headline a visitor reads.
  const title = t("catalogMetaTitle");
  const description = t("catalogMetaDescription");
  return mergeSeo("/courses", {
    title,
    description,
    alternates: seoAlternates("/courses", locale),
    ...socialMeta({ title, description, path: "/courses", locale }),
  });
}

export default async function CatalogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Marketing");

  const [coursesRes, instructorsRes] = await Promise.all([
    dal.courses.fetchPublishedCourses(),
    dal.lookups.fetchInstructors(),
  ]);

  const courses = coursesRes.ok ? coursesRes.data : [];
  const instructors = instructorsRes.ok ? instructorsRes.data : [];

  /*
   * What crosses to the client. The catalog is a client component (it filters
   * and searches in the browser), so whatever is passed to it is serialised into
   * the page. It used to receive the full course records — descriptions,
   * curriculum, FAQs — plus every instructor and 40 whole articles, which made
   * this page ~1 MB. Now it gets card fields and precomputed filter facets; the
   * full search text loads on demand from /api/course-search-index, and article
   * suggestions from /api/blog-index.
   */
  const catalogCourses = courses.map((c) => toCatalogCourse(c, instructors));
  const searchInstructors = instructors.map((i) => ({
    id: i.id,
    label: i.label,
    title: i.title,
    slug: i.slug,
  }));

  return (
    <div className="mx-auto max-w-7xl px-2 py-12 sm:px-3 lg:px-4">
      {/* Course List carousel markup — this listing page is the only place it
          belongs, and it is one of the few course rich results still rendered. */}
      <JsonLd
        data={[
          courseListLd({
            url: localeUrl("/courses", locale),
            name: t("catalogTitle"),
            courses: courses.map((c) => ({
              name: (locale === "ar" ? c.titleAr : c.titleEn) || c.titleEn,
              url: localeUrl(`/courses/${c.slug}`, locale),
              description: metaDescription(
                locale === "ar" ? c.descriptionAr : c.descriptionEn,
                (locale === "ar" ? c.titleAr : c.titleEn) || c.titleEn,
              ),
            })),
          }),
        ]}
      />
      <CatalogHeroBanner title={t("catalogTitle")} subtitle={t("catalogSubtitle")} />
      <CourseCatalog courses={catalogCourses} instructors={searchInstructors} />
    </div>
  );
}
