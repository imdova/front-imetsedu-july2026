#!/usr/bin/env node
/**
 * Parses the pages a visitor actually lands on, in both languages, and counts
 * images whose alt is missing, or empty without being declared decorative.
 *
 * Usage:
 *   node scripts/check-alt-text.mjs                       # production
 *   node scripts/check-alt-text.mjs http://localhost:3000
 *
 * Exits 1 when any image has no usable alt, so it can gate a deploy.
 */
const base = (process.argv[2] || "https://imetsedu.com").replace(/\/$/, "");
const paths = ["/", "/free-courses", "/courses", "/courses/cphq-preparation"];

const attrs = (tag) => {
  const out = {};
  for (const m of tag.matchAll(/([a-zA-Z-]+)\s*=\s*"([^"]*)"/g)) out[m[1].toLowerCase()] = m[2];
  return out;
};

(async () => {
  let bad = 0;
  for (const locale of ["", "/ar"]) {
    for (const p of paths) {
      const url = `${base}${locale}${p}`;
      const html = await fetch(url).then((r) => r.text());
      const imgs = [...html.matchAll(/<img\b[^>]*>/gi)].map((m) => ({ tag: m[0], ...attrs(m[0]) }));
      const content = imgs.filter((i) => !/facebook\.com\/tr|google-analytics|gtag|\/pixel/i.test(i.src ?? ""));
      const missing = content.filter((i) => !("alt" in i));
      const emptyUndeclared = content.filter((i) => "alt" in i && i.alt.trim() === "" && i["aria-hidden"] !== "true");
      const decorative = content.filter((i) => "alt" in i && i.alt.trim() === "" && i["aria-hidden"] === "true");
      bad += missing.length + emptyUndeclared.length;
      console.log(
        `${(locale + p).padEnd(28)} images ${String(content.length).padStart(3)} | ` +
          `missing ${missing.length} | empty-undeclared ${emptyUndeclared.length} | decorative ${decorative.length}`,
      );
      for (const i of [...missing, ...emptyUndeclared].slice(0, 4)) {
        console.log(`      ${i.tag.slice(0, 120)}`);
      }
    }
  }
  console.log(`\nimages without a usable alt (excluding declared decoration): ${bad}`);
  process.exit(bad ? 1 : 0);
})();
