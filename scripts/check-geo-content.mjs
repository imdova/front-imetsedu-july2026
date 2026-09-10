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
 *   5. each page links to the course page it sells.
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

if (errors.length) {
  console.error("\ncheck:geo FAILED\n");
  for (const e of errors) console.error(`  - ${e}`);
  console.error("");
  process.exit(1);
}

console.log("check:geo passed.");
