/**
 * Fails when client code reads a message namespace its route area does not ship.
 *
 * Why this exists: each area narrows `NextIntlClientProvider` to the namespaces
 * listed in src/i18n/scopes.ts so the browser is not sent the whole catalogue.
 * The cost of getting a list wrong is silent — a component asks for a namespace
 * that is not there and renders a raw key like "Marketing.cardDetails" — so the
 * lists are checked against the code instead of trusted.
 *
 * Method: starting from each scoped area's pages and layouts, follow imports and
 * collect every `useTranslations("Ns")` call in a "use client" file. Server
 * components read messages on the server and are not part of the browser's
 * dictionary, so they are ignored. Barrel files are followed in full, which can
 * only over-report — never miss — a namespace.
 *
 *   node scripts/check-i18n-scopes.mjs
 */
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname, resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";


const scopes = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), "..", "src", "i18n", "scopes.json"), "utf8"));
const PUBLIC_NAMESPACES = scopes.public;
const ROOT_NAMESPACES = scopes.root;
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "src");
const APP = join(SRC, "app", "[locale]");

const exts = [".tsx", ".ts", "/index.tsx", "/index.ts"];
const cache = new Map();

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

function read(file) {
  if (cache.has(file)) return cache.get(file);
  const src = readFileSync(file, "utf8");
  const info = {
    client: /^\s*["']use client["']/.test(src.slice(0, 200)),
    imports: [...src.matchAll(/from\s+["']([^"']+)["']/g)].map((m) => m[1]),
    ns: [...src.matchAll(/useTranslations\(\s*(?:["']([\w.]+)["'])?\s*\)/g)].map((m) => m[1] ?? null),
    // A namespace passed as anything but a string literal cannot be checked.
    dynamic: /useTranslations\(\s*[^"'\s)]/.test(src),
  };
  cache.set(file, info);
  return info;
}

function walk(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.tsx?$/.test(e.name)) out.push(p);
  }
  return out;
}

/** namespace → files, for client components reachable from `entries`. */
function clientNamespaces(entries) {
  const seen = new Set();
  const used = new Map();
  const problems = [];
  const stack = [...entries];
  while (stack.length) {
    const f = stack.pop();
    if (seen.has(f)) continue;
    seen.add(f);
    const info = read(f);
    if (info.client) {
      if (info.dynamic) problems.push(`${relative(ROOT, f)}: useTranslations() with a non-literal namespace`);
      for (const n of info.ns) {
        if (n === null) {
          problems.push(`${relative(ROOT, f)}: useTranslations() with no namespace cannot be scoped`);
          continue;
        }
        const top = n.split(".")[0];
        if (!used.has(top)) used.set(top, new Set());
        used.get(top).add(relative(ROOT, f).replace(/\\/g, "/"));
      }
    }
    for (const spec of info.imports) {
      const r = resolveImport(f, spec);
      if (r) stack.push(r);
    }
  }
  return { used, problems };
}

const isEntry = (f) => /(page|layout|route|error|not-found|loading)\.tsx?$/.test(f);

const AREAS = [
  {
    name: "root layout",
    allowed: ROOT_NAMESPACES,
    entries: readdirSync(APP).filter((n) => /\.tsx?$/.test(n)).map((n) => join(APP, n)).filter(isEntry),
  },
  {
    name: "public site",
    allowed: PUBLIC_NAMESPACES,
    entries: walk(join(APP, "(public)")).filter(isEntry),
  },
];

let failed = false;
for (const { name, allowed, entries } of AREAS) {
  const { used, problems } = clientNamespaces(entries);
  const missing = [...used.keys()].filter((ns) => !allowed.includes(ns)).sort();
  const extra = allowed.filter((ns) => !used.has(ns));

  console.log(`${name}: ships [${allowed.join(", ")}], client code reads [${[...used.keys()].sort().join(", ")}]`);
  for (const p of problems) {
    failed = true;
    console.log(`  ✗ ${p}`);
  }
  for (const ns of missing) {
    failed = true;
    const files = [...used.get(ns)].slice(0, 4).join("\n      ");
    console.log(`  ✗ "${ns}" is read in the browser but not shipped. Read by:\n      ${files}`);
  }
  // Not a failure: a namespace shipped but unread is only wasted bytes.
  for (const ns of extra) console.log(`  · "${ns}" is shipped but no client code reads it — can be dropped.`);
}

if (failed) {
  console.log("\nAdd the namespace to the area's list in src/i18n/scopes.ts, or move the translation to a server component.");
  process.exit(1);
}
console.log("\nOK — every client-read namespace is shipped.");
