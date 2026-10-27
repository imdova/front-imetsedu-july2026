/**
 * Title-length gate: no generated <title> may be longer than 60 characters.
 *
 *   npm run test:titles                 bundled content only (this runs on prebuild)
 *   TITLES_LIVE=1 npm run test:titles   also checks every published blog post and
 *                                       every course's admin-set SEO title in the CMS
 *
 * Covers the four page kinds the audit named:
 *   country  src/features/marketing/content/geo/*.json      → { absolute: title }
 *   compare  src/features/marketing/content/compare/*.json  → { absolute: title }
 *   course   bundled `pageSeo` titles (+ live admin titles)  → { absolute: title }
 *   blog     seoTitle || title                               → { absolute: … }
 * plus the job-title builder, which has to hold the limit for any input.
 *
 * Offline by default so a build never depends on the network. The live mode is
 * what catches a CMS edit made after the last deploy.
 */
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  TITLE_MAX,
  blogTitle,
  clampTitle,
  isBranded,
  jobTitle,
  renderedTitle,
} from "../src/lib/seo-titles.ts";
import { getCourseContent } from "../src/features/marketing/lib/course-content.ts";

const HERE = dirname(fileURLToPath(import.meta.url));
const CONTENT = join(HERE, "..", "src", "features", "marketing", "content");
const API = process.env.NEXT_PUBLIC_API_URL || "https://main-api.imetsedu.com";
const LIVE = process.env.TITLES_LIVE === "1";

/** Fails with every offender listed, not just the first. */
function assertAllFit(rows) {
  const over = rows.filter(([, title]) => title.length > TITLE_MAX);
  assert.equal(
    over.length,
    0,
    `${over.length} title(s) over ${TITLE_MAX} characters:\n` +
      over.map(([where, t]) => `  ${t.length}  ${where}  "${t}"`).join("\n"),
  );
}

function jsonTitles(dir) {
  const rows = [];
  for (const file of readdirSync(join(CONTENT, dir)).filter((f) => f.endsWith(".json"))) {
    const page = JSON.parse(readFileSync(join(CONTENT, dir, file), "utf8"));
    for (const lang of ["en", "ar"]) {
      const title = page[lang]?.title;
      if (title) rows.push([`${dir}/${file.replace(".json", "")} [${lang}]`, title]);
    }
  }
  assert.ok(rows.length > 0, `no titles found under content/${dir}`);
  return rows;
}

test("country pages: every market title fits", () => assertAllFit(jsonTitles("geo")));

test("compare pages: every comparison title fits", () => assertAllFit(jsonTitles("compare")));

test("course pages: bundled SEO titles fit", () => {
  const slugs = ["cphq-preparation", "cic-preparation", "hospital-management-diploma", "infection-control-diploma"];
  const rows = [];
  for (const slug of slugs) {
    for (const locale of ["en", "ar"]) {
      const seo = getCourseContent({ slug, titleEn: slug, titleAr: slug, locale }).pageSeo;
      const title = locale === "ar" ? seo?.metaTitleAr : seo?.metaTitleEn;
      if (title) rows.push([`course ${slug} [${locale}]`, title]);
    }
  }
  assert.ok(rows.length > 0, "no bundled course SEO titles found");
  assertAllFit(rows);
});

test("blog: title is seoTitle || title, with no brand suffix", () => {
  assert.equal(blogTitle({ seoTitle: "CPHQ Eligibility Requirements", title: "A much longer headline" }), "CPHQ Eligibility Requirements");
  assert.equal(blogTitle({ seoTitle: "  ", title: "Headline" }), "Headline");
  assert.equal(blogTitle({ seoTitle: null, title: "Headline" }), "Headline");
  assert.ok(!isBranded(blogTitle({ seoTitle: "CPHQ Guide", title: "x" })));
});

test("a branded title is not suffixed twice", () => {
  assert.equal(renderedTitle("About IMETS"), "About IMETS");
  assert.equal(renderedTitle("Careers"), "Careers | IMETS");
});

test("job titles: '{Role} — {City} | IMETS Careers', never over the limit", () => {
  assert.equal(jobTitle({ title: "Quality Manager", city: "Riyadh" }), "Quality Manager — Riyadh | IMETS Careers");
  assert.equal(jobTitle({ title: "Quality Manager", city: "" }), "Quality Manager | IMETS Careers");
  assert.equal(jobTitle({ title: "Quality Manager" }), "Quality Manager | IMETS Careers");
  const long = jobTitle({
    title: "Senior Infection Prevention and Control Nurse Specialist (Night Shift, Hospital Group)",
    city: "Abu Dhabi",
  });
  assert.ok(long.length <= TITLE_MAX, `${long.length}: ${long}`);
  assert.ok(long.endsWith(" — Abu Dhabi | IMETS Careers"), long);
  // An absurd city still leaves a title that fits and keeps the role.
  const huge = jobTitle({ title: "Quality Manager", city: "A".repeat(80) });
  assert.ok(huge.length <= TITLE_MAX && huge.startsWith("Quality Manager"), huge);
  // Arabic roles are measured in characters too.
  const ar = jobTitle({ title: "مدير جودة ومكافحة عدوى في مجموعة مستشفيات كبرى بالمنطقة الشرقية", city: "الرياض" });
  assert.ok(ar.length <= TITLE_MAX, `${ar.length}: ${ar}`);
});

test("clampTitle cuts at a word boundary and adds an ellipsis", () => {
  assert.equal(clampTitle("short", 20), "short");
  const out = clampTitle("one two three four five six", 15);
  assert.ok(out.length <= 15 && out.endsWith("…") && !out.includes("fou"), out);
});

test("live: every published blog post fits", { skip: !LIVE && "set TITLES_LIVE=1" }, async () => {
  const rows = [];
  for (let page = 1; page < 20; page++) {
    const res = await fetch(`${API}/blog?limit=50&page=${page}`);
    assert.ok(res.ok, `GET /blog?page=${page} → ${res.status}`);
    const body = await res.json();
    const list = body.data ?? [];
    for (const p of list) rows.push([`blog/${p.slug}`, blogTitle(p)]);
    if (list.length < 50) break;
  }
  assert.ok(rows.length > 0, "the API returned no blog posts");
  assertAllFit(rows);
});

test("live: every course's admin SEO title fits", { skip: !LIVE && "set TITLES_LIVE=1" }, async () => {
  const res = await fetch(`${API}/courses?limit=100`);
  assert.ok(res.ok, `GET /courses → ${res.status}`);
  const courses = (await res.json()).data ?? [];
  const rows = [];
  for (const c of courses) {
    for (const [lang, t] of [["en", c.seo?.metaTitleEn], ["ar", c.seo?.metaTitleAr]]) {
      if (t) rows.push([`courses/${c.slug} [${lang}]`, t]);
    }
  }
  assert.ok(rows.length > 0, "no course carries an admin SEO title");
  assertAllFit(rows);
});
