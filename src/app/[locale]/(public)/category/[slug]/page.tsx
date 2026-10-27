import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { redirect } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import { CategoryLanding } from "@/features/marketing/components/category-landing";
import { SITE_NAME, seoAlternates, socialMeta, metaDescription } from "@/lib/seo";
import { TITLE_SUFFIX } from "@/lib/seo-titles";
import { mergeSeo } from "@/lib/public-seo";

/** Course listing, filtered by category. Cleared early by the cache tags on its data. */
export const revalidate = 600;

export async function generateStaticParams() {
  const res = await dal.courseTaxonomy.fetchPublicCategories();
  const cats = res.ok ? res.data : [];
  return cats.map((c) => ({ slug: c.slug || c.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const res = await dal.courseTaxonomy.fetchPublicCategories();
  const cat = res.ok ? res.data.find((c) => (c.slug || c.id) === slug) : null;
  /*
   * Returning `{}` here let the page inherit the site-wide default title and
   * description, so a page that failed to load its own data shipped generic
   * copy under its own URL. Derive something from the slug instead.
   */
  if (!cat) {
    const readable = slug.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
    return {
      title: `${readable} Programs`,
      description: `${readable} programs at ${SITE_NAME}.`,
      alternates: seoAlternates(`/category/${slug}`, locale),
    };
  }
  const name = locale === "ar" ? cat.nameAr : cat.nameEn;
  const desc = locale === "ar" ? cat.descriptionAr : cat.descriptionEn;
  const title = `${name} Programs`;
  const description = metaDescription(desc, `${name} — professional healthcare programs at ${SITE_NAME}.`);
  const path = `/category/${cat.slug}`;
  return mergeSeo(path, {
    title,
    description,
    alternates: seoAlternates(path, locale),
    ...socialMeta({ title: `${title}${TITLE_SUFFIX}`, description, path, locale, image: cat.image }),
  });
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const [catRes, courseRes] = await Promise.all([
    dal.courseTaxonomy.fetchPublicCategories(),
    dal.courses.fetchPublishedCourses(),
  ]);

  /*
   * An unreachable API is not a missing category.
   *
   * This used to read `catRes.ok ? catRes.data : []`, so a timed-out or cold
   * backend produced an empty list, no slug matched, and the page answered 404
   * — which Next then cached, leaving a live category dead until something
   * revalidated it. Throwing instead surfaces a 500: retried by the crawler,
   * never cached, and visible in the logs.
   */
  if (!catRes.ok) throw new Error(`Could not load categories: ${catRes.error}`);

  const cats = catRes.data;
  const category = cats.find((c) => (c.slug || c.id) === slug);
  if (!category) {
    // Old id-based URL → send it to the clean slug.
    const byId = cats.find((c) => c.id === slug && c.slug && c.slug !== c.id);
    if (byId) redirect({ href: `/category/${byId.slug}`, locale });
    notFound();
  }

  // Courses in this category (matched by the category's English name).
  const courses = (courseRes.ok ? courseRes.data : []).filter((c) => c.category === category.nameEn);
  const related = cats.filter((c) => c.id !== category.id);

  return <CategoryLanding category={category} courses={courses} related={related} locale={locale} />;
}
