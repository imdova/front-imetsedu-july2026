import audit from "../content/audit.json";
import {
  listGeoCoursePages,
  geoCoursePath,
  type GeoCoursePage,
  type GeoLocaleContent,
} from "@/features/marketing/lib/geo-course-pages";

/**
 * The money-page programme, as a working surface rather than three spreadsheets.
 *
 * Two kinds of fact live here and they are deliberately not mixed:
 *
 *  - **Live** — which markets exist, how many words each carries, what each one
 *    links to. Computed from the content files and the route registry at render
 *    time, so it cannot drift from what is actually deployed.
 *  - **Audited** — inbound editorial link counts, the per-page verdicts, and the
 *    article-to-course mapping. These came from a crawl on a specific date and
 *    are shown with that date attached, because nothing in this codebase can
 *    recompute them.
 *
 * Presenting an audited number as if it were live is how a dashboard starts
 * lying quietly, so the UI labels the two differently and never averages them.
 */

export interface AuditedPage {
  url: string;
  keyword: string;
  synonyms: string[];
  priceEGP: number | null;
  linksIn: number;
  linksOut: number;
  verdict: string;
}

export interface ArticleMapping {
  slug: string;
  cluster: string;
  linksToNow: string;
  shouldLinkTo: string;
  action: "ADD" | "CHANGE" | "INTERIM" | "KEEP";
  notes: string;
}

export interface AuditTask {
  n: number;
  task: string;
  why: string;
  effort: string;
}

export interface MoneyPageAudit {
  sourcedFrom: string;
  auditedOn: string;
  pages: AuditedPage[];
  articles: ArticleMapping[];
  tasks: AuditTask[];
}

export const MONEY_PAGE_AUDIT = audit as MoneyPageAudit;

/* ── the planned set ─────────────────────────────────────────────────────── */

export interface PlannedPage {
  path: string;
  /** The query this page is allowed to own — always head term + qualifier. */
  owns: string;
  convertsTo: string;
  /** What has to be researched before the page can be written. */
  hook: string;
  wave: 1 | 2 | 3 | 4 | 5;
  /**
   * Why this page cannot be written today, if it cannot.
   *
   * A planned page that is merely un-started and one that is *blocked on a fact
   * nobody has* look identical on a roadmap, and the second kind quietly gets
   * re-attempted every planning cycle. Naming the blocker stops that: the entry
   * stays on the roadmap, and the reason it is not moving is on the row.
   */
  blocked?: string;
}

/**
 * The 25-page roadmap.
 *
 * Order is not arbitrary: wave 1 repeats a validated page in two more markets,
 * wave 2 tests whether the template carries to a different product, wave 3 only
 * pays off once 1 and 2 rank, wave 4 needs the English pages to model, and
 * wave 5 is a different funnel stage needing a different template. Cutting the
 * later waves is an expected outcome — 25 thin pages are far worse than 6 good
 * ones, and the content gate exists to force that choice rather than let it
 * happen by accident.
 */
export const PLANNED_PAGES: PlannedPage[] = [
  { path: "/cphq-course/egypt", owns: "cphq course egypt", convertsTo: "cphq-preparation", hook: "GAHAR · EGYCAP · universal health insurance", wave: 1 },
  { path: "/cphq-course/saudi-arabia", owns: "cphq course saudi arabia", convertsTo: "cphq-preparation", hook: "CBAHI · SCFHS classification · Vision 2030", wave: 1 },
  { path: "/cphq-course/uae", owns: "cphq course uae", convertsTo: "cphq-preparation", hook: "DHA · DOH Abu Dhabi · MOHAP · JCI private sector", wave: 1 },

  { path: "/infection-control-diploma/egypt", owns: "infection control diploma egypt", convertsTo: "infection-control-diploma", hook: "GAHAR IPC standards · MOH Egypt", wave: 2 },
  { path: "/infection-control-diploma/saudi-arabia", owns: "infection control diploma saudi arabia", convertsTo: "infection-control-diploma", hook: "CBAHI IPC chapter · SCFHS", wave: 2 },
  { path: "/infection-control-diploma/uae", owns: "infection control course uae", convertsTo: "infection-control-diploma", hook: "DHA / DOH IPC requirements", wave: 2 },
  { path: "/hospital-management-diploma/egypt", owns: "hospital management diploma egypt", convertsTo: "hospital-management-diploma", hook: "GAHAR governance standards · private sector growth", wave: 2 },
  { path: "/hospital-management-diploma/saudi-arabia", owns: "hospital management diploma saudi arabia", convertsTo: "hospital-management-diploma", hook: "Vision 2030 corporatisation · CBAHI leadership", wave: 2 },
  { path: "/hospital-management-diploma/uae", owns: "hospital management course uae", convertsTo: "hospital-management-diploma", hook: "DHA facility licensing · private hospital groups", wave: 2 },

  { path: "/cphq-course/kuwait", owns: "cphq course kuwait", convertsTo: "cphq-preparation", hook: "MOH Kuwait licensing", wave: 3, blocked: "No local currency: the course records price in EGP, SAR and USD only, so this market could quote nothing more local than dollars." },
  { path: "/cphq-course/qatar", owns: "cphq course qatar", convertsTo: "cphq-preparation", hook: "MOPH · QCHP licensing", wave: 3, blocked: "No local currency: the course records price in EGP, SAR and USD only, so this market could quote nothing more local than dollars." },
  { path: "/cphq-course/oman", owns: "cphq course oman", convertsTo: "cphq-preparation", hook: "MOH Oman · verify accreditation body", wave: 3, blocked: "No local currency: the course records price in EGP, SAR and USD only, so this market could quote nothing more local than dollars. The blueprint's own hook here is unverified." },
  { path: "/cphq-course/jordan", owns: "cphq course jordan", convertsTo: "cphq-preparation", hook: "HCAC accreditation", wave: 3, blocked: "No local currency: the course records price in EGP, SAR and USD only, so this market could quote nothing more local than dollars." },
  { path: "/infection-control-diploma/kuwait", owns: "infection control diploma kuwait", convertsTo: "infection-control-diploma", hook: "MOH Kuwait IPC", wave: 3, blocked: "No local currency: the course records price in EGP, SAR and USD only, so this market could quote nothing more local than dollars." },

  { path: "/ar/cphq-course/egypt", owns: "كورس CPHQ مصر", convertsTo: "cphq-preparation", hook: "Arabic mirror of wave 1", wave: 4 },
  { path: "/ar/cphq-course/saudi-arabia", owns: "كورس CPHQ السعودية", convertsTo: "cphq-preparation", hook: "Arabic mirror of wave 1", wave: 4 },
  { path: "/ar/cphq-course/uae", owns: "كورس CPHQ الإمارات", convertsTo: "cphq-preparation", hook: "Arabic mirror of wave 1", wave: 4 },
  { path: "/ar/infection-control-diploma/egypt", owns: "دبلومة مكافحة العدوى مصر", convertsTo: "infection-control-diploma", hook: "Arabic mirror of wave 2", wave: 4 },
  { path: "/ar/infection-control-diploma/saudi-arabia", owns: "دبلومة مكافحة العدوى السعودية", convertsTo: "infection-control-diploma", hook: "Arabic mirror of wave 2", wave: 4 },
  { path: "/ar/hospital-management-diploma/egypt", owns: "دبلومة إدارة المستشفيات مصر", convertsTo: "hospital-management-diploma", hook: "Arabic mirror of wave 2", wave: 4 },
  { path: "/ar/hospital-management-diploma/saudi-arabia", owns: "دبلومة إدارة المستشفيات السعودية", convertsTo: "hospital-management-diploma", hook: "Arabic mirror of wave 2", wave: 4 },

  { path: "/compare/cphq-vs-cic", owns: "cphq vs cic", convertsTo: "cphq-preparation + cic-preparation", hook: "Decision stage, not purchase — different template", wave: 5 },
  { path: "/compare/healthcare-quality-certifications", owns: "best healthcare quality certification", convertsTo: "/category/healthcare-quality", hook: "Comparison across CPHQ, CPPS, CPHRM, Six Sigma", wave: 5 },
  { path: "/compare/cphq-vs-healthcare-quality-diploma", owns: "cphq or a quality diploma", convertsTo: "cphq-preparation + healthcare-quality-management-diploma", hook: "Two of your own products — must be even-handed", wave: 5 },
  { path: "/compare/infection-control-cic-vs-diploma", owns: "cic or infection control diploma", convertsTo: "cic-preparation + infection-control-diploma", hook: "Resolves the exam-vs-practice split", wave: 5 },
];

/* ── live gate measurement ───────────────────────────────────────────────── */

/** Mirrors `scripts/check-geo-content.mjs`, which fails the build on these. */
export const GATE = {
  minWords: 800,
  minArticleLinks: 3,
  minFaqs: 5,
} as const;

export interface GateResult {
  path: string;
  market: string;
  locale: "en" | "ar";
  words: number;
  faqs: number;
  articleLinks: string[];
  linksToCourse: boolean;
  passes: boolean;
}

/** Prose as the reader sees it, with link syntax reduced to its label. */
function proseOf(c: GeoLocaleContent): string {
  return [
    c.h1,
    c.intro,
    ...c.sections.flatMap((s) => [
      s.heading,
      ...s.paragraphs,
      ...(s.bullets ?? []),
      ...(s.table ? [...s.table.head, ...s.table.rows.flat()] : []),
    ]),
    ...c.faqs.flatMap((f) => [f.q, f.a]),
    c.ctaHeading,
    c.ctaBody,
  ].join(" ");
}

function countWords(text: string): number {
  return (
    text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []
  ).length;
}

function linksOf(text: string): string[] {
  return [...text.matchAll(/\[[^\]]+\]\((\/[^)]+)\)/g)].map((m) => m[1]);
}

/** Measure every built market against the gate, live. */
export function measureGate(): GateResult[] {
  const out: GateResult[] = [];
  for (const page of listGeoCoursePages()) {
    for (const locale of ["en", "ar"] as const) {
      const c = page[locale];
      if (!c) continue;
      const text = proseOf(c);
      const hrefs = linksOf(text);
      const articleLinks = [...new Set(hrefs.filter((h) => h.startsWith("/blog/")))];
      const linksToCourse = hrefs.includes(`/courses/${page.courseSlug}`);
      const words = countWords(text);
      out.push({
        path: geoCoursePath(page),
        market: c.countryName,
        locale,
        words,
        faqs: c.faqs.length,
        articleLinks,
        linksToCourse,
        passes:
          words >= GATE.minWords &&
          c.faqs.length >= GATE.minFaqs &&
          articleLinks.length >= GATE.minArticleLinks &&
          linksToCourse,
      });
    }
  }
  return out;
}

/** Which planned paths are actually built and routable today. */
export function builtPaths(): Set<string> {
  return new Set(listGeoCoursePages().map((p) => geoCoursePath(p)));
}

export function liveMarkets(): GeoCoursePage[] {
  return listGeoCoursePages();
}
