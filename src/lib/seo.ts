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

export function courseLd(opts: {
  name: string;
  description: string;
  url: string;
  image?: string;
  locale: string;
  price?: number;
  currency?: string;
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
    ...(opts.price && opts.price > 0
      ? { offers: { "@type": "Offer", price: opts.price, priceCurrency: opts.currency ?? "EGP", category: "Paid", url: opts.url } }
      : {}),
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
