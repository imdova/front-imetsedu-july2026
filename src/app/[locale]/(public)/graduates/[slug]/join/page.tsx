import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { GraduateJoinForm } from "@/features/public/components/graduate-join-form";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Join the graduation gallery | IMETS Medical School", robots: { index: false } };

/** Public self-submission form: students add their photo + details to a cohort's gallery. */
export default async function GraduateJoinPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const res = await dal.graduates.fetchJoinInfo(slug);
  if (!res.ok) notFound();
  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
      <GraduateJoinForm slug={slug} cohort={res.data} />
    </div>
  );
}
