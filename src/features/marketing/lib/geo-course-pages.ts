import egypt from "../content/geo/egypt.json";
import saudiArabia from "../content/geo/saudi-arabia.json";
import uae from "../content/geo/uae.json";
import ipcEgypt from "../content/geo/infection-control-diploma-egypt.json";
import ipcSaudiArabia from "../content/geo/infection-control-diploma-saudi-arabia.json";
import ipcUae from "../content/geo/infection-control-diploma-uae.json";
import hmEgypt from "../content/geo/hospital-management-diploma-egypt.json";
import hmSaudiArabia from "../content/geo/hospital-management-diploma-saudi-arabia.json";
import hmUae from "../content/geo/hospital-management-diploma-uae.json";
import kuwait from "../content/geo/kuwait.json";
import qatar from "../content/geo/qatar.json";
import oman from "../content/geo/oman.json";
import jordan from "../content/geo/jordan.json";
import ipcKuwait from "../content/geo/infection-control-diploma-kuwait.json";

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
 * Waves 1 and 2 of the money-page programme: CPHQ in Egypt (live since SEO-08),
 * Saudi Arabia and the UAE, then the same three markets for the infection
 * control and hospital management diplomas.
 *
 * Wave 3 (Kuwait, Qatar, Oman, Jordan) quotes in US dollars by decision, not by
 * oversight: the course records hold EGP, SAR and USD only, and rather than cut
 * the markets the programme prices them from the international offer and says so
 * on the page. That removes local pricing as a differentiator, so each of these
 * pages has to earn its place on regulatory substance alone — MOH-run delivery
 * in Kuwait, QCHP registration and CPD in Qatar, OMSB and workforce
 * nationalisation in Oman, HCAC and medical tourism in Jordan. The content gate
 * is what holds that line.
 */
const PAGES: GeoCoursePage[] = [
  egypt as GeoCoursePage,
  saudiArabia as GeoCoursePage,
  uae as GeoCoursePage,
  ipcEgypt as GeoCoursePage,
  ipcSaudiArabia as GeoCoursePage,
  ipcUae as GeoCoursePage,
  hmEgypt as GeoCoursePage,
  hmSaudiArabia as GeoCoursePage,
  hmUae as GeoCoursePage,
  kuwait as GeoCoursePage,
  qatar as GeoCoursePage,
  oman as GeoCoursePage,
  jordan as GeoCoursePage,
  ipcKuwait as GeoCoursePage,
];

/** Every country page that exists. */
export function listGeoCoursePages(): GeoCoursePage[] {
  return PAGES;
}

/**
 * One market page, or undefined — the route 404s on undefined.
 *
 * Keyed by segment *and* country, not country alone: once a second programme
 * has market pages, `/cphq-course/egypt` and `/infection-control-diploma/egypt`
 * both have country "egypt", and a country-only lookup would serve whichever
 * happened to be registered first — CPHQ content under an infection-control URL.
 */
export function getGeoCoursePage(
  segment: string,
  country: string,
): GeoCoursePage | undefined {
  const wanted = country.toLowerCase();
  return PAGES.find(
    (p) => p.country === wanted && PROGRAM_SEGMENT[p.courseSlug] === segment,
  );
}

/** The country pages for one course, used to link them from the course page. */
export function geoCoursePagesFor(courseSlug: string): GeoCoursePage[] {
  return PAGES.filter((p) => p.courseSlug === courseSlug);
}

/**
 * URL segment each programme's market pages live under.
 *
 * CPHQ uses `cphq-course` rather than its course slug because that is the URL
 * that shipped and is already indexed; changing it would throw away whatever
 * the Egypt page has earned. Every other programme uses its own slug, which is
 * what the blueprint specifies.
 *
 * A programme absent from this map has no market pages, and `geoCoursePath`
 * says so loudly rather than inventing a URL that no route serves.
 */
export const PROGRAM_SEGMENT: Record<string, string> = {
  "cphq-preparation": "cphq-course",
  "infection-control-diploma": "infection-control-diploma",
  "hospital-management-diploma": "hospital-management-diploma",
};

/** Locale-independent path for a market page. */
export function geoCoursePath(page: GeoCoursePage): string {
  const segment = PROGRAM_SEGMENT[page.courseSlug];
  if (!segment) {
    throw new Error(
      `No URL segment registered for "${page.courseSlug}". Add it to PROGRAM_SEGMENT ` +
        `and create the matching route folder, or the page will 404.`,
    );
  }
  return `/${segment}/${page.country}`;
}

/** Market pages grouped by the route segment that serves them. */
export function geoPagesBySegment(segment: string): GeoCoursePage[] {
  return PAGES.filter((p) => PROGRAM_SEGMENT[p.courseSlug] === segment);
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
