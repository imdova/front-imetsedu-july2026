import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { CourseCatalog } from "@/features/marketing/components/course-catalog";
import { CatalogHeroBanner } from "@/features/marketing/components/catalog-hero-banner";
import { seoAlternates, socialMeta } from "@/lib/seo";
import { mergeSeo } from "@/lib/public-seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Marketing" });
  const title = t("catalogTitle");
  const description = t("catalogSubtitle");
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

  const [coursesRes, instructorsRes, articlesRes] = await Promise.all([
    dal.courses.fetchCourses(),
    dal.lookups.fetchInstructors(),
    dal.blog.fetchPublicArticles({ limit: 40 }),
  ]);

  const courses = coursesRes.ok ? coursesRes.data : [];
  const instructors = instructorsRes.ok ? instructorsRes.data : [];
  const articles = articlesRes.ok ? articlesRes.data.data : [];

  return (
    <div className="mx-auto max-w-7xl px-2 py-12 sm:px-3 lg:px-4">
      <CatalogHeroBanner title={t("catalogTitle")} subtitle={t("catalogSubtitle")} />
      <CourseCatalog courses={courses} instructors={instructors} articles={articles} />
    </div>
  );
}
