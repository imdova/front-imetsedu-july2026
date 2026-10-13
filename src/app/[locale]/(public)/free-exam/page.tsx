import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import { resolveSeoMetadata } from "@/lib/public-seo";
import { seoAlternates, socialMeta } from "@/lib/seo";
import { FreeExamForm } from "@/features/marketing/components/free-exam-form";

const EXAM_DESCRIPTION = "Take a free placement exam and get a personalized course recommendation.";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const admin = await resolveSeoMetadata("/free-exam").catch(() => ({} as Metadata));
  // Admin SEO spread first so it contributes og/robots, but this page's own
  // title, description and alternates win (admin reads fall back to site
  // defaults when no "/free-exam" override exists, and a default canonical
  // would point this page at the wrong URL).
  return {
    ...admin,
    title: "Free Placement Exam",
    description: EXAM_DESCRIPTION,
    alternates: seoAlternates("/free-exam", locale),
    ...socialMeta({ title: "Free Placement Exam", description: EXAM_DESCRIPTION, path: "/free-exam", locale }),
  };
}

export default async function FreeExamPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
      <div className="mb-8 space-y-3 text-center">
        <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          100% free · no commitment
        </span>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Take your free placement exam</h1>
        <p className="mx-auto max-w-md text-muted-foreground">
          Tell us about yourself and we&apos;ll send you a free exam plus a personalized recommendation
          for the right diploma or course.
        </p>
      </div>
      <FreeExamForm />
    </div>
  );
}
