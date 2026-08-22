import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { GraduatesIndex } from "@/features/public/components/graduates-index";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Our Graduates | IMETS Medical School",
  description: "Celebrating every cohort of IMETS Medical School graduates — browse graduation galleries by program and class.",
  alternates: { canonical: "https://imetsedu.com/graduates" },
};

export default async function GraduatesIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const res = await dal.graduates.fetchPublishedCohorts();
  return <GraduatesIndex cohorts={res.ok ? res.data : []} />;
}
