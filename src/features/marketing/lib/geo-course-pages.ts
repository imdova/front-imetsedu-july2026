import egypt from "../content/geo/egypt.json";
import saudiArabia from "../content/geo/saudi-arabia.json";
import uae from "../content/geo/uae.json";

/**
 * Country landing pages for a course (`/cphq-course/egypt`).
 *
 * These exist to compete for "cphq course egypt" and its siblings, which the
 * generic course page ranks for only weakly. The obvious way to build them —
 * one template, swap the country name in the H1 — is a doorway page under
 * Google's spam policies, and shipping three of those is worse than shipping
 * none. So the content is data, not a template: every country supplies its own
 * prose, and a country with nothing specific to say does not get a page.
 *
 * That rule is enforced, not just documented. `scripts/check-geo-content.mjs`
 * runs on `prebuild` and fails the build if any country drops under 600 words
 * per locale, or if two countries' pages are more similar than the threshold.
 *
 * Adding a country: write `content/geo/<country>.json`, register it below, and
 * run `npm run check:geo`. Prices are NOT written into the JSON — `{price}` is
 * substituted at render from the course's stored offer in that currency, so a
 * price change in the admin never leaves a stale number on a landing page.
 */

/** A small comparison table, e.g. exam windows against application deadlines. */
export interface GeoTable {
  head: string[];
  rows: string[][];
}

export interface GeoSection {
  heading: string;
  /**
   * Body copy. May carry `[label](/path)` links — the money page's job includes
   * routing to the articles and the course page, and those links have to sit in
   * prose where they are contextual rather than in a footer block.
   */
  paragraphs: string[];
  bullets?: string[];
  table?: GeoTable;
}

export interface GeoLocaleContent {
  countryName: string;
  title: string;
  metaDescription: string;
  h1: string;
  intro: string;
  sections: GeoSection[];
  faqs: { q: string; a: string }[];
  ctaHeading: string;
  ctaBody: string;
}

export interface GeoCoursePage {
  /** URL segment, e.g. "egypt". */
  country: string;
  /** ISO-3166 alpha-2, for `areaServed` in structured data. */
  countryCode: string;
  /** Currency the page quotes in — must be one the course actually prices in. */
  currency: "EGP" | "SAR" | "USD";
  /** The course this page sells. */
  courseSlug: string;
  en: GeoLocaleContent;
  /**
   * Optional. Arabic mirrors are a later wave of this programme, and a page
   * without one is served in English at both URLs with the Arabic URL
   * canonicalising to the English one — the same treatment the English-only
   * blog posts get. Declaring an `ar` alternate for a page that does not exist
   * would advertise a translation Google would then find in English.
   */
  ar?: GeoLocaleContent;
}

/*
 * Wave 1 of the money-page programme: Egypt (live since SEO-08), plus Saudi
 * Arabia and the UAE. Later waves — other Gulf markets, other courses, the
 * Arabic mirrors — are deliberately not registered until their content is
 * written to the same bar, because an unregistered market has no URL at all.
 */
const PAGES: GeoCoursePage[] = [
  egypt as GeoCoursePage,
  saudiArabia as GeoCoursePage,
  uae as GeoCoursePage,
];

/** Every country page that exists. */
export function listGeoCoursePages(): GeoCoursePage[] {
  return PAGES;
}

/** One country page, or undefined — the route 404s on undefined. */
export function getGeoCoursePage(country: string): GeoCoursePage | undefined {
  return PAGES.find((p) => p.country === country.toLowerCase());
}

/** The country pages for one course, used to link them from the course page. */
export function geoCoursePagesFor(courseSlug: string): GeoCoursePage[] {
  return PAGES.filter((p) => p.courseSlug === courseSlug);
}

/**
 * Locale-independent path for a country page.
 *
 * The `/cphq-course` segment is the route directory name, so it is fixed here
 * rather than derived from `courseSlug`. A second course wanting geo pages
 * needs its own route folder — and a matching branch in this function.
 */
export function geoCoursePath(page: GeoCoursePage): string {
  return `/cphq-course/${page.country}`;
}

/** The locale a page is actually written in, for canonical + hreflang. */
export function geoLocale(page: GeoCoursePage, locale: string): "en" | "ar" {
  return locale === "ar" && page.ar ? "ar" : "en";
}

/** Pick the content for the active locale, falling back to English. */
export function geoContent(page: GeoCoursePage, locale: string): GeoLocaleContent {
  return locale === "ar" && page.ar ? page.ar : page.en;
}

/**
 * The market pages that cite a given article, for the reciprocal link.
 *
 * The relevance is not inferred: each market page's own copy chose which
 * articles to cite, so pointing back at exactly those is a link the content
 * author already made in one direction. Guessing "this article mentions Egypt,
 * so link it" would be the fabricated version of the same idea.
 *
 * The citation is the whole test. An earlier version also required the article
 * to already promote that page's course, which quietly dropped the genuine
 * cases — the Saudi page cites `cbahi-vs-jci`, but that article's primary course
 * is the quality diploma, so the reciprocal link never rendered. A money page
 * citing an article outside its own topic would be an authoring mistake, not
 * something worth filtering good links to guard against.
 */
export function geoPagesCiting(articleSlug: string): GeoCoursePage[] {
  const href = `](/blog/${articleSlug})`;
  return PAGES.filter((page) =>
    (["en", "ar"] as const).some((locale) => {
      const c = page[locale];
      if (!c) return false;
      const prose = [
        c.intro,
        ...c.sections.flatMap((s) => [...s.paragraphs, ...(s.bullets ?? [])]),
        ...c.faqs.map((f) => f.a),
        c.ctaBody,
      ].join(" ");
      return prose.includes(href);
    }),
  );
}
