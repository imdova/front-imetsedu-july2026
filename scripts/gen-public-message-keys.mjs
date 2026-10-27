/**
 * Which message keys does the public site's browser code actually name?
 *
 * Writes src/i18n/public-message-keys.json — for each namespace the public
 * area ships (src/i18n/scopes.ts), the keys client code can ask for. The public
 * layout hands that list to <IntlScope>, so the browser receives those keys
 * instead of the whole namespace. `Marketing` alone is ~31 KB in English and
 * ~41 KB in Arabic, of which a few kilobytes are read by client components; the
 * rest is copy that server components render on the server.
 *
 * How the list is found (and why it errs towards including too much):
 *  1. Start from the public pages and layouts and follow imports. Every
 *     "use client" file that calls useTranslations("<Namespace>") is a *reader*.
 *  2. Take everything a reader imports, transitively — the helper modules that
 *     hold key tables (`labelKey: "filterDuration4w"`) live there.
 *  3. A key is shipped if its name appears as a string literal in that code. This
 *     over-includes (a literal that merely equals a key name keeps it) and never
 *     under-includes for literal or table-driven keys.
 *  4. A template key such as `spec${n}` ships every key sharing the prefix, and
 *     `${item.key}Desc` every key sharing the suffix, taken only from the reader
 *     files themselves.
 *
 * What it cannot see is a key assembled by string concatenation. That is flagged
 * as an error here, so a new one fails the build instead of rendering a raw key.
 *
 *   node scripts/gen-public-message-keys.mjs           # write
 *   node scripts/gen-public-message-keys.mjs --check   # fail if the file is stale
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname, resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";


const scopes = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), "..", "src", "i18n", "scopes.json"), "utf8"));
const PUBLIC_NAMESPACES = scopes.public;
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "src");
const APP = join(SRC, "app", "[locale]");
const OUT = join(SRC, "i18n", "public-message-keys.json");
const CHECK = process.argv.includes("--check");

const exts = [".tsx", ".ts", "/index.tsx", "/index.ts"];
const files = new Map();

function resolveImport(from, spec) {
  let base;
  if (spec.startsWith("@/")) base = join(SRC, spec.slice(2));
  else if (spec.startsWith("@integration/")) base = join(SRC, "integration", spec.slice(13));
  else if (spec.startsWith(".")) base = resolve(dirname(from), spec);
  else return null;
  if (existsSync(base) && statSync(base).isFile()) return base;
  for (const e of exts) if (existsSync(base + e)) return base + e;
  return null;
}

function load(file) {
  if (!files.has(file)) {
    const src = readFileSync(file, "utf8");
    files.set(file, {
      src,
      client: /^\s*["']use client["']/.test(src.slice(0, 200)),
      imports: [...src.matchAll(/from\s+["']([^"']+)["']/g)].map((m) => m[1]),
    });
  }
  return files.get(file);
}

function walk(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.tsx?$/.test(e.name)) out.push(p);
  }
  return out;
}

function closure(starts) {
  const seen = new Set();
  const stack = [...starts];
  while (stack.length) {
    const f = stack.pop();
    if (seen.has(f)) continue;
    seen.add(f);
    for (const spec of load(f).imports) {
      const r = resolveImport(f, spec);
      if (r) stack.push(r);
    }
  }
  return seen;
}

const isEntry = (f) => /(page|layout|route|error|not-found|loading)\.tsx?$/.test(f);
const entries = [
  ...walk(join(APP, "(public)")).filter(isEntry),
  ...readdirSync(APP).filter((n) => /\.tsx?$/.test(n)).map((n) => join(APP, n)).filter(isEntry),
];

/** Client files that read each shipped namespace. */
const readers = new Map(PUBLIC_NAMESPACES.map((ns) => [ns, new Set()]));
for (const f of closure(entries)) {
  const info = load(f);
  if (!info.client) continue;
  for (const ns of PUBLIC_NAMESPACES) {
    if (new RegExp(`useTranslations\\(\\s*["']${ns}["']\\s*\\)`).test(info.src)) readers.get(ns).add(f);
  }
}

const problems = [];
const result = {};

for (const ns of PUBLIC_NAMESPACES) {
  const messages = JSON.parse(readFileSync(join(ROOT, "messages", "en.json"), "utf8"))[ns] ?? {};
  const keys = Object.keys(messages);
  const nsReaders = [...readers.get(ns)];
  const code = closure(nsReaders);

  // Every string literal in the reader closure that looks like an identifier.
  const literals = new Set();
  for (const f of code) {
    for (const m of load(f).src.matchAll(/["'`]([A-Za-z][\w]*)["'`]/g)) literals.add(m[1]);
  }

  // Template keys (`spec${n}`): only from the readers themselves, and only
  // prefixes long enough to be meaningful — "m${…}" would match half the file.
  const prefixes = new Set();
  for (const f of nsReaders) {
    for (const m of load(f).src.matchAll(/`([A-Za-z][\w]{3,})\$\{/g)) prefixes.add(m[1]);
  }

  // Suffix templates (`${item.titleKey}Desc`): the mirror image, and just as
  // invisible to the literal scan. The first scoped build shipped none of the
  // header's "…Desc" keys, so the Resources menu rendered "Nav.navFreeExamDesc"
  // as its description. Ships every key in the namespace ending in the suffix.
  const suffixes = new Set();
  for (const f of nsReaders) {
    for (const m of load(f).src.matchAll(/`\$\{[^}`]+\}([A-Za-z][\w]{2,})`/g)) suffixes.add(m[1]);
  }

  const shipped = keys.filter(
    (k) => literals.has(k) || [...prefixes].some((p) => k.startsWith(p)) || [...suffixes].some((s) => k.endsWith(s)),
  );
  result[ns] = shipped.sort();

  // A reader asking for a literal key that does not exist is a real bug today.
  // A file can hold several translators (`t` for Marketing, `tc` for Common), so
  // each call is checked against the namespace its own variable was created for.
  for (const f of nsReaders) {
    const { src } = load(f);
    const vars = [...src.matchAll(new RegExp(`const\\s+(\\w+)\\s*=\\s*useTranslations\\(\\s*["']${ns}["']\\s*\\)`, "g"))].map((m) => m[1]);
    for (const v of vars) {
      for (const m of src.matchAll(new RegExp(`\\b${v}(?:\\.rich|\\.raw|\\.has)?\\(\\s*["'](\\w+)["']`, "g"))) {
        if (!keys.includes(m[1])) problems.push(`${relative(ROOT, f)}: ${v}("${m[1]}") — no such key in ${ns}`);
      }
      // Concatenation builds a key this scan cannot see.
      for (const m of src.matchAll(new RegExp(`\\b${v}\\(\\s*(["']\\w*["']\\s*\\+|[\\w.]+\\s*\\+\\s*["'])`, "g"))) {
        problems.push(`${relative(ROOT, f)}: key built by concatenation near "${m[0].slice(0, 40)}" — use a template literal with a prefix, or a lookup table`);
      }
    }
  }

  const bytes = (list) => Buffer.byteLength(JSON.stringify(Object.fromEntries(list.map((k) => [k, messages[k]]))));
  console.log(
    `${ns.padEnd(10)} ${String(shipped.length).padStart(3)}/${keys.length} keys  ` +
      `${(bytes(shipped) / 1024).toFixed(1).padStart(5)} / ${(bytes(keys) / 1024).toFixed(1)} KB (en)  ` +
      `read by ${nsReaders.length} client file(s)`,
  );
}

if (problems.length) {
  console.error("\n" + problems.map((p) => `  ✗ ${p}`).join("\n"));
  process.exit(1);
}

const next = JSON.stringify(result, null, 2) + "\n";
if (CHECK) {
  const current = existsSync(OUT) ? readFileSync(OUT, "utf8").replace(/\r\n/g, "\n") : "";
  if (current !== next) {
    console.error("\nsrc/i18n/public-message-keys.json is stale — run `node scripts/gen-public-message-keys.mjs` and commit it.");
    process.exit(1);
  }
  console.log("\nOK — public-message-keys.json is up to date.");
} else {
  writeFileSync(OUT, next);
  console.log(`\nWrote ${relative(ROOT, OUT)}`);
}
