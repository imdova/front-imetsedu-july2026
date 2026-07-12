import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { CourseCatalog } from "@/features/marketing/components/course-catalog";
import { CatalogTrustStrip } from "@/features/marketing/components/catalog-trust-strip";
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
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8 max-w-3xl space-y-3">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-[#0a2f7a] sm:text-4xl">
          {t("catalogTitle")}
        </h1>
        <p className="text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
          {t("catalogSubtitle")}
        </p>
      </header>
      <CatalogTrustStrip />
      <CourseCatalog courses={courses} instructors={instructors} articles={articles} />
    </div>
  );
}
