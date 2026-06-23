import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { CourseCatalog } from "@/features/marketing/components/course-catalog";
import { SITE_NAME, seoAlternates, socialMeta } from "@/lib/seo";

export async function generateStaticParams() {
  const res = await dal.lookups.fetchCategories();
  const cats = res.ok ? res.data : [];
  return cats.map((c) => ({ slug: c.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const res = await dal.lookups.fetchCategories();
  const cat = res.ok ? res.data.find((c) => c.id === slug) : null;
  const t = await getTranslations({ locale, namespace: "Pages" });
  const title = cat ? cat.label : t("categoryTitle", { name: "" });
  const description = t("categorySubtitle", { name: cat?.label ?? "" });
  const path = `/category/${slug}`;
  return {
    title,
    description,
    alternates: seoAlternates(path, locale),
    ...socialMeta({ title: `${title} · ${SITE_NAME}`, description, path, locale }),
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Pages");

  const [catRes, courseRes] = await Promise.all([
    dal.lookups.fetchCategories(),
    dal.courses.fetchCourses(),
  ]);
  const cat = catRes.ok ? catRes.data.find((c) => c.id === slug) : null;
  if (!cat) notFound();

  const label = locale === "ar" && cat.labelAr ? cat.labelAr : cat.label;
  const courses = (courseRes.ok ? courseRes.data : []).filter(
    (c) => c.category === cat.label,
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 space-y-2">
        <h1 className="font-heading text-3xl font-bold tracking-tight">{label}</h1>
        <p className="text-muted-foreground">{t("categorySubtitle")}</p>
      </div>
      <CourseCatalog courses={courses} />
    </div>
  );
}
