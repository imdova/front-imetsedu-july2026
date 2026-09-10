#!/usr/bin/env node
/**
 * Content gate for the money pages (`/cphq-course/<market>`).
 *
 * These pages are near-identical by construction: same product, same template,
 * one market swapped. That is exactly the shape of build that becomes a set of
 * doorway pages without anyone deciding to make one, and Google treats a *set*
 * of them as a site-wide problem rather than a per-URL one. The risk scales
 * with the page count, which is why the checks live in the build rather than in
 * a reviewer's memory.
 *
 * Five assertions, all mechanical:
 *   1. every locale of every market carries at least MIN_WORDS of prose;
 *   2. no two markets are more alike than MAX_SIMILARITY;
 *   3. no FAQ question is reused across markets;
 *   4. each page links out to at least MIN_ARTICLE_LINKS articles;
 *   5. each page links to the course page it sells;
 *   6. the `{price}` placeholder appears only in fields something substitutes.
 *
 * Similarity is trigram-shingle Jaccard. Word-frequency comparison is not
 * enough: two pages built from one template share whole sentences, and shingles
 * catch that where a bag of words does not.
 *
 * Runs on `prebuild`, so none of this can reach production. Run directly with
 * `npm run check:geo`.
 */
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const COMPARE_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "src",
  "features",
  "marketing",
  "content",
  "compare",
);

const CONTENT_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "src",
  "features",
  "marketing",
  "content",
  "geo",
);

/** The money-page blueprint's gate. Raised from 600 when wave 1 was written. */
const MIN_WORDS = 800;
/**
 * Two independently written pages on the same subject land around 0.10–0.20:
 * they share the credential's vocabulary and little else. Anything at 0.35 is
 * sharing sentences, not just terminology.
 */
const MAX_SIMILARITY = 0.35;
const SHINGLE = 3;
/** A money page that routes nowhere is a dead end for readers and crawlers. */
const MIN_ARTICLE_LINKS = 3;
/**
 * Google truncates a description around 155-160 characters on desktop. Past
 * that the sentence doing the persuading is the one that gets cut, so the limit
 * is checked rather than eyeballed — an audit found four pages over it, all
 * written by someone counting the raw string and forgetting `{price}` expands.
 */
const MAX_DESCRIPTION = 155;
/**
 * Widest plausible substitution per currency, so the check measures what a
 * reader would see rather than a worst case that flags healthy pages. Prices
 * are editable in the admin, so this budgets for the widest value each currency
 * could reasonably reach rather than the one stored today.
 */
const WIDEST_PRICE = { EGP: "EGP 16,500", SAR: "SAR 3,200", USD: "$1,500" };

const LOCALES = ["en", "ar"];

/** Every string a reader actually sees, as one blob. */
function prose(locale) {
  const parts = [
    locale.h1,
    locale.intro,
    ...locale.sections.flatMap((s) => [
      s.heading,
      ...s.paragraphs,
      ...(s.bullets ?? []),
      ...(s.table ? [...s.table.head, ...s.table.rows.flat()] : []),
    ]),
    ...locale.faqs.flatMap((f) => [f.q, f.a]),
    locale.ctaHeading,
    locale.ctaBody,
  ];
  return parts.join(" ");
}

/**
 * Word split that works for Arabic as well as English — splitting on whitespace
 * alone counts punctuation as letters. Markdown link syntax is stripped first
 * so a URL is never mistaken for prose the reader gets credit for.
 */
function words(text) {
  return (
    text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .toLowerCase()
      .match(/[\p{L}\p{N}]+/gu) ?? []
  );
}

function shingles(text) {
  const w = words(text);
  const out = new Set();
  for (let i = 0; i + SHINGLE <= w.length; i++) out.add(w.slice(i, i + SHINGLE).join(" "));
  return out;
}

function jaccard(a, b) {
  if (a.size === 0 || b.size === 0) return 0;
  let shared = 0;
  for (const s of a) if (b.has(s)) shared++;
  return shared / (a.size + b.size - shared);
}

/** Every `[label](/path)` target in a locale's prose. */
function links(locale) {
  const out = [];
  for (const m of prose(locale).matchAll(/\[[^\]]+\]\((\/[^)]+)\)/g)) out.push(m[1]);
  return out;
}

const files = readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".json"));
if (files.length === 0) {
  console.log("check:geo — no market pages registered, nothing to check.");
  process.exit(0);
}

const pages = files.map((f) => JSON.parse(readFileSync(join(CONTENT_DIR, f), "utf8")));

/**
 * A page's identity is its programme *and* its market.
 *
 * Once a second programme has market pages, "egypt" names two different pages.
 * Keying any of the checks below on the country alone would let the CPHQ Egypt
 * page and the infection-control Egypt page share FAQ questions with each other
 * — which is precisely the templating the FAQ check exists to catch — and would
 * print error labels that name neither page unambiguously.
 */
const idOf = (p) => `${p.courseSlug}/${p.country}`;
const errors = [];

/* 1 + 4 + 5 — per page. */
for (const page of pages) {
  for (const locale of LOCALES) {
    const content = page[locale];
    // Arabic is optional: a market without it is served in English at both URLs.
    if (!content) {
      if (locale === "en") errors.push(`${idOf(page)}: missing "en" content`);
      continue;
    }

    const count = words(prose(content)).length;
    if (count < MIN_WORDS) {
      errors.push(
        `${idOf(page)} [${locale}]: ${count} words, needs ${MIN_WORDS}. ` +
          `Write real local content or drop the market — a thin page hurts every other page on the site.`,
      );
    } else {
      console.log(`  ok  ${idOf(page)} [${locale}] — ${count} words`);
    }

    /*
     * `{price}` is substituted in the body copy at render and in the meta
     * description at metadata time. Everywhere else it would reach a reader
     * verbatim — a title, a heading, a table cell or an FAQ question reading
     * "... {price}". That shipped once, in the FAQ structured data, so it is
     * checked rather than remembered.
     */
    const unsubstituted = [
      ["title", content.title],
      ["h1", content.h1],
      ["ctaHeading", content.ctaHeading],
      ...content.sections.map((s) => ["section heading", s.heading]),
      ...content.sections.flatMap((s) =>
        s.table ? [...s.table.head, ...s.table.rows.flat()].map((cell) => ["table cell", cell]) : [],
      ),
      ...content.faqs.map((f) => ["FAQ question", f.q]),
    ];
    for (const [where, text] of unsubstituted) {
      if (String(text).includes("{price}")) {
        errors.push(
          `${idOf(page)} [${locale}]: "{price}" in ${where} — nothing substitutes it there, ` +
            `so the reader sees the placeholder. Use it in body copy or the meta description.`,
        );
      }
    }

    const shownDescription = content.metaDescription.replaceAll(
      "{price}",
      WIDEST_PRICE[page.currency] ?? WIDEST_PRICE.EGP,
    );
    if (shownDescription.length > MAX_DESCRIPTION) {
      errors.push(
        `${idOf(page)} [${locale}]: description renders at ${shownDescription.length} chars, ` +
          `limit ${MAX_DESCRIPTION}. Remember "{price}" expands.`,
      );
    }

    const hrefs = links(content);
    const articleLinks = new Set(hrefs.filter((h) => h.startsWith("/blog/")));
    const coursePath = `/courses/${page.courseSlug}`;
    if (articleLinks.size < MIN_ARTICLE_LINKS) {
      errors.push(
        `${idOf(page)} [${locale}]: links to ${articleLinks.size} article(s), needs ${MIN_ARTICLE_LINKS}.`,
      );
    }
    if (!hrefs.includes(coursePath)) {
      errors.push(`${idOf(page)} [${locale}]: never links to ${coursePath}.`);
    }
  }
}

/* 2 — markets must not be each other's template. */
for (let i = 0; i < pages.length; i++) {
  for (let j = i + 1; j < pages.length; j++) {
    for (const locale of LOCALES) {
      const a = pages[i][locale];
      const b = pages[j][locale];
      if (!a || !b) continue;
      const score = jaccard(shingles(prose(a)), shingles(prose(b)));
      const label = `${idOf(pages[i])} vs ${idOf(pages[j])} [${locale}]`;
      if (score > MAX_SIMILARITY) {
        errors.push(
          `${label}: ${(score * 100).toFixed(1)}% similar, limit ${(MAX_SIMILARITY * 100).toFixed(0)}%. ` +
            `These read as one template with the market swapped.`,
        );
      } else {
        console.log(`  ok  ${label} — ${(score * 100).toFixed(1)}% similar`);
      }
    }
  }
}

/* 3 — a shared FAQ answer is the clearest tell of a templated page. */
const seenQuestions = new Map();
for (const page of pages) {
  for (const locale of LOCALES) {
    for (const faq of page[locale]?.faqs ?? []) {
      const key = faq.q.trim().toLowerCase();
      const prev = seenQuestions.get(key);
      if (prev && prev !== idOf(page)) {
        errors.push(`FAQ reused between ${prev} and ${idOf(page)}: "${faq.q}"`);
      }
      seenQuestions.set(key, idOf(page));
    }
  }
}
console.log(`  ok  ${seenQuestions.size} FAQ questions, none shared between markets`);

/* ── comparison pages ──────────────────────────────────────────────────────
 *
 * Same machinery, different failure mode. A market page fails by being thin;
 * a comparison page fails by being a sales page wearing a table. The check that
 * matters here is `notFor`: every option must say who it does not suit. Two of
 * these pages compare products we sell against each other, and a comparison
 * that only lists strengths on both sides tells the reader nothing they could
 * act on — which is the failure this exists to make impossible rather than
 * merely discouraged.
 */
const MIN_COMPARE_WORDS = 900;

function comparePros(content) {
  return [
    content.h1,
    content.intro,
    ...content.options.flatMap((o) => [o.name, o.summary, ...o.bestFor, ...o.notFor]),
    ...content.matrix.flatMap((r) => [r.label, ...r.values]),
    ...content.sections.flatMap((s) => [s.heading, ...s.paragraphs, ...(s.bullets ?? [])]),
    content.verdict.heading,
    ...content.verdict.paragraphs,
    ...content.faqs.flatMap((f) => [f.q, f.a]),
    content.ctaHeading,
    content.ctaBody,
  ].join(" ");
}

let comparePages = [];
try {
  comparePages = readdirSync(COMPARE_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(readFileSync(join(COMPARE_DIR, f), "utf8")));
} catch {
  comparePages = [];
}

for (const page of comparePages) {
  for (const locale of LOCALES) {
    const content = page[locale];
    if (!content) {
      if (locale === "en") errors.push(`compare/${page.slug}: missing "en" content`);
      continue;
    }

    const text = comparePros(content);
    const count = words(text).length;
    if (count < MIN_COMPARE_WORDS) {
      errors.push(
        `compare/${page.slug} [${locale}]: ${count} words, needs ${MIN_COMPARE_WORDS}.`,
      );
    } else {
      console.log(`  ok  compare/${page.slug} [${locale}] — ${count} words`);
    }

    if (content.metaDescription.length > MAX_DESCRIPTION) {
      errors.push(
        `compare/${page.slug} [${locale}]: description is ${content.metaDescription.length} chars, limit ${MAX_DESCRIPTION}.`,
      );
    }

    if (content.options.length < 2) {
      errors.push(`compare/${page.slug} [${locale}]: a comparison needs at least two options.`);
    }

    for (const o of content.options) {
      if (!Array.isArray(o.notFor) || o.notFor.length === 0) {
        errors.push(
          `compare/${page.slug} [${locale}]: option "${o.key}" has no "notFor". ` +
            `A comparison that will not say who an option is wrong for is a catalogue.`,
        );
      }
      if (!Array.isArray(o.bestFor) || o.bestFor.length === 0) {
        errors.push(`compare/${page.slug} [${locale}]: option "${o.key}" has no "bestFor".`);
      }
    }

    // Every matrix row has to line up with the columns, or the table lies.
    for (const row of content.matrix) {
      if (row.values.length !== content.options.length) {
        errors.push(
          `compare/${page.slug} [${locale}]: matrix row "${row.label}" has ` +
            `${row.values.length} values for ${content.options.length} options.`,
        );
      }
    }

    const hrefs = [];
    for (const m of text.matchAll(/\[[^\]]+\]\((\/[^)]+)\)/g)) hrefs.push(m[1]);
    const articleLinks = new Set(hrefs.filter((h) => h.startsWith("/blog/")));
    if (articleLinks.size < MIN_ARTICLE_LINKS) {
      errors.push(
        `compare/${page.slug} [${locale}]: links to ${articleLinks.size} article(s), needs ${MIN_ARTICLE_LINKS}.`,
      );
    }
  }
}

/* Comparison FAQs share the market pages' uniqueness namespace. */
for (const page of comparePages) {
  for (const locale of LOCALES) {
    for (const faq of page[locale]?.faqs ?? []) {
      const key = faq.q.trim().toLowerCase();
      const id = `compare/${page.slug}`;
      const prev = seenQuestions.get(key);
      if (prev && prev !== id) errors.push(`FAQ reused between ${prev} and ${id}: "${faq.q}"`);
      seenQuestions.set(key, id);
    }
  }
}

/* Two comparisons must not be each other's template either. */
for (let i = 0; i < comparePages.length; i++) {
  for (let j = i + 1; j < comparePages.length; j++) {
    for (const locale of LOCALES) {
      const a = comparePages[i][locale];
      const b = comparePages[j][locale];
      if (!a || !b) continue;
      const score = jaccard(shingles(comparePros(a)), shingles(comparePros(b)));
      const label = `compare/${comparePages[i].slug} vs compare/${comparePages[j].slug} [${locale}]`;
      if (score > MAX_SIMILARITY) {
        errors.push(`${label}: ${(score * 100).toFixed(1)}% similar, limit ${(MAX_SIMILARITY * 100).toFixed(0)}%.`);
      } else {
        console.log(`  ok  ${label} — ${(score * 100).toFixed(1)}% similar`);
      }
    }
  }
}

if (errors.length) {
  console.error("\ncheck:geo FAILED\n");
  for (const e of errors) console.error(`  - ${e}`);
  console.error("");
  process.exit(1);
}

console.log("check:geo passed.");
