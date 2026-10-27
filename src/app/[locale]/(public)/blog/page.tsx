import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import { BlogListing, blogListingMetadata } from "@/features/blog/components/blog-listing-page";

/** Article listing, page 1. Cleared early by the `blog` cache tag. */
export const revalidate = 600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return blogListingMetadata({ locale, page: 1 });
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <BlogListing locale={locale} page={1} />;
}
