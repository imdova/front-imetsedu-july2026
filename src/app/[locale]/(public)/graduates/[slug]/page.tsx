import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { GraduatesGallery } from "@/features/public/components/graduates-gallery";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const res = await dal.graduates.fetchPublishedCohort(slug);
  if (!res.ok) return { title: "Graduates | IMETS Medical School" };
  const c = res.data;
  return {
    title: `${c.name} | IMETS Medical School`,
    description: `${c.programTitle} ${c.programTitleAccent} — graduation gallery, ${c.graduates.length} graduates, ${c.classLabel} ${c.classYear}.`.trim(),
    alternates: { canonical: `https://imetsedu.com/graduates/${c.slug}` },
  };
}

export default async function GraduatesCohortPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const res = await dal.graduates.fetchPublishedCohort(slug);
  if (!res.ok) notFound();
  return <GraduatesGallery cohort={res.data} />;
}
