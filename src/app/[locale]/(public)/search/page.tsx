import { getTranslations, setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { CourseCatalog } from "@/features/marketing/components/course-catalog";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Pages" });
  return { title: t("searchTitle") };
}

export default async function SearchPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Pages");

  const res = await dal.courses.fetchCourses();
  const courses = res.ok ? res.data : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 space-y-2">
        <h1 className="font-heading text-3xl font-bold tracking-tight">{t("searchTitle")}</h1>
        <p className="text-muted-foreground">{t("searchEmpty")}</p>
      </div>
      <CourseCatalog courses={courses} />
    </div>
  );
}
