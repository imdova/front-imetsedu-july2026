import cphqVsCic from "../content/compare/cphq-vs-cic.json";
import qualityCertifications from "../content/compare/healthcare-quality-certifications.json";
import cphqVsDiploma from "../content/compare/cphq-vs-healthcare-quality-diploma.json";
import cicVsDiploma from "../content/compare/infection-control-cic-vs-diploma.json";
import type { GeoSection } from "./geo-course-pages";

/**
 * Comparison pages (`/compare/cphq-vs-cic`).
 *
 * A different funnel stage from the market pages. Someone landing here has not
 * decided *what* to buy, so a page that argues for one product is answering a
 * question they did not ask — and they can tell. The conversion event for a
 * comparison page is the reader believing the comparison, which means it has to
 * be one they could have written themselves after a fortnight of research.
 *
 * Two of the four compare products we sell against each other. That is the
 * uncomfortable case and the reason the shape below is what it is: every option
 * carries `notFor` as well as `bestFor`, and `scripts/check-geo-content.mjs`
 * fails the build if any option ships without a populated `notFor`. A page that
 * can only say good things about both of our products is not a comparison, it is
 * a catalogue, and the build refuses it rather than trusting an author to
 * remember.
 */

export interface ComparisonOption {
  /** Stable key, used for table columns and React keys. */
  key: string;
  /** What the reader calls it. */
  name: string;
  /** One-line positioning, shown under the name. */
  summary: string;
  /**
   * The course this option maps to, when we sell it. Absent for an option that
   * is a real alternative but not ours — leaving those out entirely would make
   * the comparison useless, and inventing a version we sell would be worse.
   */
  courseSlug?: string;
  /** Who this genuinely suits. */
  bestFor: string[];
  /**
   * Who it does not suit. Required, non-empty, enforced at build time.
   *
   * This is the field that makes the page worth reading. Anyone can list
   * strengths; the reader is trying to work out which option is wrong for them,
   * and a page that will not say costs them nothing to ignore.
   */
  notFor: string[];
}

/** One row of the at-a-glance matrix; `values` is parallel to `options`. */
export interface ComparisonRow {
  label: string;
  values: string[];
}

export interface ComparisonContent {
  title: string;
  metaDescription: string;
  h1: string;
  intro: string;
  options: ComparisonOption[];
  /** The side-by-side matrix. Rows must match the option count. */
  matrix: ComparisonRow[];
  /** Long-form discussion, same shape the market pages use. */
  sections: GeoSection[];
  /** The part readers scroll to. Says which to pick, in plain terms. */
  verdict: { heading: string; paragraphs: string[] };
  faqs: { q: string; a: string }[];
  ctaHeading: string;
  ctaBody: string;
}

export interface ComparisonPage {
  /** URL segment under /compare. */
  slug: string;
  en: ComparisonContent;
  /** Arabic mirror, when written. Same fallback rule as the market pages. */
  ar?: ComparisonContent;
}

const PAGES: ComparisonPage[] = [
  cphqVsCic as ComparisonPage,
  qualityCertifications as ComparisonPage,
  cphqVsDiploma as ComparisonPage,
  cicVsDiploma as ComparisonPage,
];

export function listComparisonPages(): ComparisonPage[] {
  return PAGES;
}

export function getComparisonPage(slug: string): ComparisonPage | undefined {
  return PAGES.find((p) => p.slug === slug.toLowerCase());
}

export function comparisonPath(page: ComparisonPage): string {
  return `/compare/${page.slug}`;
}

/** The locale a page is actually written in, for canonical + hreflang. */
export function comparisonLocale(page: ComparisonPage, locale: string): "en" | "ar" {
  return locale === "ar" && page.ar ? "ar" : "en";
}

export function comparisonContent(page: ComparisonPage, locale: string): ComparisonContent {
  return locale === "ar" && page.ar ? page.ar : page.en;
}

/** Every course slug a comparison page discusses, for cross-linking. */
export function comparedCourseSlugs(page: ComparisonPage): string[] {
  return [
    ...new Set(
      (["en", "ar"] as const).flatMap((l) =>
        (page[l]?.options ?? []).map((o) => o.courseSlug).filter((s): s is string => !!s),
      ),
    ),
  ];
}

/**
 * The comparisons that discuss a given course, for the link from its page.
 *
 * A course page that links to the comparison it loses half the time looks like
 * a mistake and is not. Someone weighing two of our programmes will find that
 * comparison somewhere; it is better that they find ours, which at least
 * describes both accurately.
 */
export function comparisonsForCourse(courseSlug: string): ComparisonPage[] {
  return PAGES.filter((p) => comparedCourseSlugs(p).includes(courseSlug));
}
