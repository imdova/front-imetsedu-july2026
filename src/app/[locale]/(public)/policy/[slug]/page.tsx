import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { PolicyDoc } from "@/features/public/components/policy-doc";
import { POLICIES, POLICY_ORDER } from "@/features/public/lib/policy-content";
import { metaDescription, staticPageMeta } from "@/lib/seo";

export function generateStaticParams() {
  return POLICY_ORDER.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const doc = POLICIES[slug];
  if (!doc) return {};
  return staticPageMeta({
    title: `${doc.title} | IMETS`,
    description: metaDescription(doc.intro),
    path: `/policy/${slug}`,
    locale,
  });
}

export default async function PolicyDocPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const doc = POLICIES[slug];
  if (!doc) notFound();
  return <PolicyDoc doc={doc} />;
}
