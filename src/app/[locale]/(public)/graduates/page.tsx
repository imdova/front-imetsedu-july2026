import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { seoAlternates } from "@/lib/seo";
import { GraduatesIndex } from "@/features/public/components/graduates-index";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    /*
     * Absolute, because the layout template appends " · IMETS Medical School"
     * to anything that is not — and this title already ends in it, which is how
     * the page shipped "Our Graduates | IMETS Medical School · IMETS Medical
     * School" to a 70-character SERP slot.
     */
    title: { absolute: "Our Graduates — IMETS Medical School" },
    description:
      "Celebrating every cohort of IMETS Medical School graduates — browse graduation galleries by program and class.",
    // Was a hardcoded English canonical, which pointed /ar/graduates at the
    // English page and offered no alternates at all.
    alternates: seoAlternates("/graduates", locale),
  };
}

export default async function GraduatesIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const res = await dal.graduates.fetchPublishedCohorts();
  return <GraduatesIndex cohorts={res.ok ? res.data : []} />;
}
