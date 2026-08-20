import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { SeoPageDetail } from "@/features/marketing-admin/components/seo-page-detail";

export const metadata = { robots: { index: false } };

export default async function SeoPageDetailPage({ params, searchParams }: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ path?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { path } = await searchParams;
  if (!path) notFound();

  const res = await dal.seo.fetchPublicPageDetail(path);
  if (!res.ok) notFound();

  return <SeoPageDetail initial={res.data} />;
}
