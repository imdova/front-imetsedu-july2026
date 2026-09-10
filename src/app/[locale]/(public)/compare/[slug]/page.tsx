import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { JsonLd } from "@/components/seo/json-ld";
import { localeUrl, breadcrumbLd, socialMeta, courseEntityId, SITE_URL } from "@/lib/seo";
import { mergeSeo } from "@/lib/public-seo";
import { plainText } from "@/features/marketing/lib/geo-rich-text";
import {
  getComparisonPage,
  comparisonContent,
  comparisonLocale,
  comparisonPath,
  listComparisonPages,
} from "@/features/marketing/lib/comparison-pages";
import { ComparisonLanding } from "@/features/marketing/components/comparison-landing";

/**
 * Decision-stage comparison pages (`/compare/cphq-vs-cic`).
 *
 * Only comparisons with written content resolve; anything else 404s.
 */

export function generateStaticParams() {
  return listComparisonPages().map((p) => ({ slug: p.slug }));
}

type RouteParams = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { locale, slug } = await params;
  const page = getComparisonPage(slug);
  if (!page) return {};

  const c = comparisonContent(page, locale);
  const path = comparisonPath(page);
  const written = comparisonLocale(page, locale);
  const canonical = localeUrl(path, written);
  const languages: Record<string, string> = { en: localeUrl(path, "en") };
  if (page.ar) languages.ar = localeUrl(path, "ar");
  languages["x-default"] = localeUrl(path, "en");

  return mergeSeo(path, {
    title: { absolute: c.title },
    description: plainText(c.metaDescription),
    alternates: { canonical, languages },
    ...socialMeta({ title: c.h1, description: c.metaDescription, path, locale }),
  });
}

export default async function ComparePageRoute({ params }: RouteParams) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const page = getComparisonPage(slug);
  if (!page) notFound();

  const c = comparisonContent(page, locale);
  const ar = locale === "ar";
  const path = comparisonPath(page);
  const written = comparisonLocale(page, locale);

  const crumb = breadcrumbLd([
    { name: ar ? "الرئيسية" : "Home", url: localeUrl("/", locale) },
    { name: ar ? "الكورسات" : "Courses", url: localeUrl("/courses", locale) },
    { name: c.h1, url: localeUrl(path, locale) },
  ]);

  /*
   * A WebPage that references the course entities it discusses, rather than
   * describing them again. Emitting Course nodes here would create a second
   * definition of each product competing with the one on its own course page,
   * and on a page that sells neither that is a pure cost.
   *
   * No Offer either: this page quotes no price and is not a purchase point.
   */
  const pageLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${SITE_URL}${path}`,
    name: c.h1,
    description: plainText(c.metaDescription),
    inLanguage: written,
    about: c.options
      .filter((o) => o.courseSlug)
      .map((o) => ({ "@id": courseEntityId(o.courseSlug as string) })),
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: c.faqs.map((f) => ({
      "@type": "Question",
      name: plainText(f.q),
      acceptedAnswer: { "@type": "Answer", text: plainText(f.a) },
    })),
  };

  return (
    <>
      <JsonLd data={[crumb, pageLd, faqLd]} />
      <nav
        aria-label="Breadcrumb"
        className="mx-auto flex max-w-5xl flex-wrap items-center gap-1 px-4 pt-8 text-xs text-muted-foreground sm:px-6"
      >
        <Link href="/" className="hover:text-foreground">
          {ar ? "الرئيسية" : "Home"}
        </Link>
        <ChevronRight className="size-3.5 rtl:rotate-180" />
        <Link href="/courses" className="hover:text-foreground">
          {ar ? "الكورسات" : "Courses"}
        </Link>
        <ChevronRight className="size-3.5 rtl:rotate-180" />
        <span className="line-clamp-1 text-foreground">{c.h1}</span>
      </nav>

      <ComparisonLanding page={page} locale={locale} />
    </>
  );
}
