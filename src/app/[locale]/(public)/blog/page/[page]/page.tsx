import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import {
  BlogListing,
  blogListingMetadata,
  blogListingPageNumbers,
} from "@/features/blog/components/blog-listing-page";

/** Article listing, pages 2+. Cleared early by the `blog` cache tag. */
export const revalidate = 600;

/** Prerender every page of the archive, in both locales. */
export async function generateStaticParams() {
  const numbers = await blogListingPageNumbers();
  return numbers.flatMap((n) => [
    { locale: "en", page: String(n) },
    { locale: "ar", page: String(n) },
  ]);
}

type Params = Promise<{ locale: string; page: string }>;

/** `/blog/page/abc`, `/blog/page/0`, `/blog/page/2.5` are not pages. */
const parsePage = (raw: string) => (/^[1-9]\d*$/.test(raw) ? Number(raw) : null);

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, page } = await params;
  const n = parsePage(page);
  if (!n) return {};
  return blogListingMetadata({ locale, page: n });
}

export default async function BlogPageN({ params }: { params: Params }) {
  const { locale, page } = await params;
  setRequestLocale(locale);

  const n = parsePage(page);
  if (!n) notFound();
  // Page 1 is the listing itself; /blog/page/1 would be a second URL for it.
  if (n === 1) permanentRedirect(locale === "ar" ? "/ar/blog" : "/blog");

  return <BlogListing locale={locale} page={n} />;
}
