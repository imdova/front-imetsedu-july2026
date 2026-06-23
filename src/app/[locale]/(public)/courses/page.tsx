import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { CourseCatalog } from "@/features/marketing/components/course-catalog";
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

  const res = await dal.courses.fetchCourses();
  const courses = res.ok ? res.data : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 space-y-2">
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          {t("catalogTitle")}
        </h1>
        <p className="text-muted-foreground">{t("catalogSubtitle")}</p>
      </div>
      <CourseCatalog courses={courses} />
    </div>
  );
}
