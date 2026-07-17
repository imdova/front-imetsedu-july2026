/**
 * SEO helpers — canonical/hreflang alternates and JSON-LD builders.
 *
 * URL model mirrors the i18n routing (`localePrefix: "as-needed"`): English is
 * served at the root, Arabic under `/ar`. `x-default` points at English.
 */
import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { mergeSeo } from "@/lib/public-seo";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://imetsedu.com").replace(/\/$/, "");
export const SITE_NAME = "IMETS Medical School";
export const SITE_LOGO = `${SITE_URL}/icon`;

/** Absolute URL for a locale-agnostic public path (leading slash, no locale). */
export function localeUrl(path: string, locale: string): string {
  const clean = path === "/" ? "" : path;
  return locale === routing.defaultLocale
    ? `${SITE_URL}${clean || "/"}`
    : `${SITE_URL}/${locale}${clean}`;
}

/** `alternates` block: self-canonical + hreflang (en / ar / x-default). */
export function seoAlternates(path: string, locale: string): Metadata["alternates"] {
  return {
    canonical: localeUrl(path, locale),
    languages: {
      en: localeUrl(path, "en"),
      ar: localeUrl(path, "ar"),
      "x-default": localeUrl(path, "en"),
    },
  };
}

/** Strip HTML + collapse whitespace + clamp to a meta-description length. */
export function metaDescription(input?: string, fallback = ""): string {
  const text = (input || fallback).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return text.length > 160 ? `${text.slice(0, 157).trimEnd()}…` : text;
}

/** Shared OpenGraph/Twitter block for a public page. When no `image` is given,
 * the file-based default `opengraph-image` is used automatically. */
export function socialMeta(opts: {
  title: string;
  description: string;
  path: string;
  locale: string;
  image?: string;
}): Pick<Metadata, "openGraph" | "twitter"> {
  const images = opts.image ? [opts.image] : undefined;
  return {
    openGraph: {
      title: opts.title,
      description: opts.description,
      url: localeUrl(opts.path, opts.locale),
      siteName: SITE_NAME,
      type: "website",
      locale: opts.locale === "ar" ? "ar_EG" : "en_US",
      ...(images ? { images } : {}),
    },
    twitter: { card: "summary_large_image", title: opts.title, description: opts.description, ...(images ? { images } : {}) },
  };
}

/** Full metadata block for a static public page (title + description + canonical
 * + hreflang + social), with admin-managed SEO (settings + per-path override)
 * merged underneath so it contributes fields the page doesn't set. */
export async function staticPageMeta(opts: {
  title: string;
  description: string;
  path: string;
  locale: string;
  image?: string;
}): Promise<Metadata> {
  const base: Metadata = {
    title: opts.title,
    description: opts.description,
    alternates: seoAlternates(opts.path, opts.locale),
    ...socialMeta(opts),
  };
  return mergeSeo(opts.path, base);
}

/* ───────────────────────────── JSON-LD ───────────────────────────── */

export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: SITE_LOGO,
  };
}

export function websiteLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/search?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

export function personLd(opts: {
  name: string;
  jobTitle?: string;
  image?: string;
  url: string;
  locale: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: opts.name,
    ...(opts.jobTitle ? { jobTitle: opts.jobTitle } : {}),
    ...(opts.image ? { image: opts.image } : {}),
    url: opts.url,
    worksFor: { "@type": "EducationalOrganization", name: SITE_NAME, sameAs: SITE_URL },
    inLanguage: opts.locale,
  };
}

export function courseLd(opts: {
  name: string;
  description: string;
  url: string;
  image?: string;
  locale: string;
  price?: number;
  currency?: string;
  rating?: number;
  reviewCount?: number;
  /** Real, admin-entered reviews only. Never sample or generated ones —
   *  marking up invented reviews is a review-snippet policy violation. */
  reviews?: { author: string; rating: number; body: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: opts.name,
    description: opts.description,
    url: opts.url,
    ...(opts.image ? { image: opts.image } : {}),
    inLanguage: opts.locale,
    provider: { "@type": "EducationalOrganization", name: SITE_NAME, sameAs: SITE_URL },
    ...(opts.rating && opts.rating > 0 && opts.reviewCount && opts.reviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: opts.rating,
            reviewCount: opts.reviewCount,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
    ...(opts.reviews?.length
      ? {
          review: opts.reviews.map((r) => ({
            "@type": "Review",
            author: { "@type": "Person", name: r.author },
            reviewRating: {
              "@type": "Rating",
              ratingValue: r.rating,
              bestRating: 5,
              worstRating: 1,
            },
            reviewBody: r.body,
          })),
        }
      : {}),
    ...(opts.price && opts.price > 0
      ? { offers: { "@type": "Offer", price: opts.price, priceCurrency: opts.currency ?? "EGP", category: "Paid", url: opts.url } }
      : {}),
  };
}

/**
 * A real, watchable video. Only call this when the course actually has one —
 * a VideoObject describing a video that does not exist on the page is a
 * structured-data violation, not a missing nice-to-have.
 */
export function courseVideoLd(opts: {
  name: string;
  description: string;
  videoId: string;
  contentUrl: string;
  uploadDate?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: opts.name,
    description: opts.description,
    thumbnailUrl: `https://i.ytimg.com/vi/${opts.videoId}/hqdefault.jpg`,
    embedUrl: `https://www.youtube.com/embed/${opts.videoId}`,
    contentUrl: opts.contentUrl,
    ...(opts.uploadDate ? { uploadDate: opts.uploadDate } : {}),
    isFamilyFriendly: true,
    publisher: { "@type": "Organization", name: SITE_NAME },
  };
}

export function breadcrumbLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}
