import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { redirect } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import { CategoryLanding } from "@/features/marketing/components/category-landing";
import { SITE_NAME, seoAlternates, socialMeta, metaDescription } from "@/lib/seo";
import { mergeSeo } from "@/lib/public-seo";

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
  if (!cat) return {};
  const name = locale === "ar" ? cat.nameAr : cat.nameEn;
  const desc = locale === "ar" ? cat.descriptionAr : cat.descriptionEn;
  const title = `${name} Programs`;
  const description = metaDescription(desc, `${name} — professional healthcare programs at ${SITE_NAME}.`);
  const path = `/category/${cat.slug}`;
  return mergeSeo(path, {
    title,
    description,
    alternates: seoAlternates(path, locale),
    ...socialMeta({ title: `${title} · ${SITE_NAME}`, description, path, locale, image: cat.image }),
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
    dal.courses.fetchCourses(),
  ]);
  const cats = catRes.ok ? catRes.data : [];
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
