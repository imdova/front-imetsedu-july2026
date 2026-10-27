#!/usr/bin/env node
/**
 * Smoke check: does any public page show a raw i18n key as text?
 *
 *   npm run check:raw-keys                       # against https://imetsedu.com
 *   npm run check:raw-keys -- http://localhost:3100
 *
 * Why this exists: the public site ships only the message keys its client code
 * names (`gen-public-message-keys.mjs`). A key built at runtime that the
 * generator cannot see is silently left out, and next-intl then renders its
 * path — "Nav.navFreeExamDesc" — as the visible text. That happened to the
 * header's Resources menu on every page, in both languages, and nothing failed:
 * the dropdown is closed on load, so a screenshot of the page never showed it.
 *
 * It reads the server-rendered HTML, so it sees the closed dropdown too.
 * Exits 1 if any page leaks a key, so it can gate a deploy.
 */
const base = (process.argv[2] || "https://imetsedu.com").replace(/\/+$/, "");
const paths = [
  "/", "/courses", "/courses/cphq-preparation", "/courses/infection-control-diploma", "/blog",
  "/blog/cpps-certification-guide", "/graduates", "/free-courses", "/careers", "/cphq-course/egypt",
  "/compare/cphq-vs-cic", "/reviews", "/about", "/contact", "/success-stories", "/instructors",
  "/free-exam", "/verify-certificate", "/help",
];
// Namespaces the public site ships (src/i18n/scopes.json) plus the usual suspects.
const NAMESPACES = "Nav|Marketing|Common|Public|Blog|Careers|Auth|Footer";
const RAW_KEY = new RegExp(`>\\s*((?:${NAMESPACES})\\.[A-Za-z0-9_.]+)\\s*<`, "g");

let leaking = 0;
let checked = 0;
for (const locale of ["", "/ar"]) {
  for (const path of paths) {
    const url = base + locale + (path === "/" && locale ? "" : path);
    let res;
    try {
      res = await fetch(url);
    } catch (err) {
      console.log(`ERR  ${url}  ${err.message}`);
      leaking++;
      continue;
    }
    // A 404 is legitimate for a page that has no Arabic twin (blog posts, comparisons).
    if (res.status !== 200) continue;
    checked++;
    const html = await res.text();
    const hits = [...new Set([...html.matchAll(RAW_KEY)].map((m) => m[1]))];
    if (hits.length) {
      leaking++;
      console.log(`RAW  ${url}  → ${hits.slice(0, 6).join(", ")}${hits.length > 6 ? ` (+${hits.length - 6})` : ""}`);
    }
  }
}

console.log(leaking ? `\n${leaking} page(s) leak raw keys (${checked} checked).` : `\nOK — no raw keys on ${checked} pages.`);
process.exit(leaking ? 1 : 0);
