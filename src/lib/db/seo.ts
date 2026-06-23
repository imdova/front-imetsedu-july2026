/**
 * SEO seed (mock DB) — global settings, per-page meta overrides, redirects and
 * JSON-LD schema. Mirrors the clone-spec `seo` module's must-have pieces; the
 * analytics tables (sitemaps/backlinks/gsc/geo/broken-urls) are a later phase.
 */
import { respond, clone } from "./delay";

export interface SeoSettings {
  siteName: string;
  titleTemplate: string; // e.g. "%s | IMETS"
  defaultTitle: string;
  defaultDescription: string;
  defaultOgImage: string;
  twitterHandle: string;
  canonicalBaseUrl: string;
  keywords: string[];
  indexable: boolean;
  robotsTxt: string;
  sitemapEnabled: boolean;
}

export interface SeoPage {
  id: string;
  path: string;
  title: string;
  description: string;
  titleAr: string;
  descriptionAr: string;
  ogImage: string;
  focusKeyword: string;
  canonical: string;
  noindex: boolean;
}
export type SeoPageInput = Omit<SeoPage, "id">;

export type RedirectType = "301" | "302" | "307" | "308";
export interface SeoRedirect {
  id: string;
  from: string;
  to: string;
  type: RedirectType;
  isActive: boolean;
}
export type SeoRedirectInput = Omit<SeoRedirect, "id">;

export type SchemaHealth = "valid" | "warnings" | "errors";
export interface SeoSchema {
  id: string;
  name: string;
  type: string; // Organization / Course / FAQPage / …
  jsonld: string; // raw JSON-LD
  status: boolean; // active
  pagesLinked: number;
  health: SchemaHealth;
  issues: string[];
}
export type SeoSchemaInput = Omit<SeoSchema, "id" | "pagesLinked" | "health" | "issues">;
export interface SchemaSummary {
  total: number;
  active: number;
  valid: number;
  needAttention: number;
  healthScore: number;
}

export interface SeoIssue {
  id: string;
  label: string;
  severity: "low" | "medium" | "high";
}
export interface SeoOverview {
  avgPageScore: number;
  pageOverrides: number;
  redirects: number;
  noindexPages: number;
  issues: SeoIssue[];
}

let settings: SeoSettings = {
  siteName: "IMETS School of Business",
  titleTemplate: "%s | IMETS",
  defaultTitle: "IMETS School of Business — Professional Diplomas & Courses",
  defaultDescription: "Accredited professional diplomas, certificates and live courses in business, finance and management.",
  defaultOgImage: "https://main-api.imetsedu.com/og/default.png",
  twitterHandle: "@imetsedu",
  canonicalBaseUrl: "https://imetsedu.com",
  keywords: ["business diploma", "professional certificate", "finance courses", "Cairo"],
  indexable: true,
  robotsTxt: "User-agent: *\nAllow: /\nSitemap: https://imetsedu.com/sitemap.xml",
  sitemapEnabled: true,
};

const pages: SeoPage[] = [
  {
    id: "sp_1", path: "/", title: "IMETS — Professional Diplomas & Courses",
    description: "Accredited diplomas and live courses in business, finance and management.",
    titleAr: "آيمتس — دبلومات ودورات احترافية", descriptionAr: "دبلومات ودورات معتمدة في الأعمال والمالية والإدارة.",
    ogImage: "", focusKeyword: "professional diplomas", canonical: "", noindex: false,
  },
  {
    id: "sp_2", path: "/courses", title: "Courses — IMETS",
    description: "Browse accredited business and finance courses.",
    titleAr: "الدورات — آيمتس", descriptionAr: "تصفح دورات الأعمال والمالية المعتمدة.",
    ogImage: "", focusKeyword: "business courses", canonical: "", noindex: false,
  },
  {
    id: "sp_3", path: "/admin", title: "Admin", description: "Admin console.",
    titleAr: "الإدارة", descriptionAr: "لوحة الإدارة.", ogImage: "", focusKeyword: "", canonical: "", noindex: true,
  },
];

const redirects: SeoRedirect[] = [
  { id: "rd_1", from: "/old-courses", to: "/courses", type: "301", isActive: true },
  { id: "rd_2", from: "/promo", to: "/lp/summer-intake-2026", type: "302", isActive: true },
  { id: "rd_3", from: "/blog/legacy", to: "/blog", type: "301", isActive: false },
];

const schemas: SeoSchema[] = [
  {
    id: "sc_1", name: "Organization", type: "Organization",
    jsonld: JSON.stringify({ "@context": "https://schema.org", "@type": "Organization", name: "IMETS School of Business", url: "https://imetsedu.com" }, null, 2),
    status: true, pagesLinked: 12, health: "valid", issues: [],
  },
  {
    id: "sc_2", name: "Course — default", type: "Course",
    jsonld: JSON.stringify({ "@context": "https://schema.org", "@type": "Course", name: "{{course.title}}", provider: { "@type": "Organization", name: "IMETS" } }, null, 2),
    status: true, pagesLinked: 48, health: "warnings", issues: ["Missing 'description' field recommended by Google"],
  },
];

let pageSeq = pages.length;
let rdSeq = redirects.length;
let scSeq = schemas.length;

/* ── Settings ── */
export const getSeoSettings = () => respond(clone(settings));
export async function updateSeoSettings(patch: Partial<SeoSettings>): Promise<SeoSettings> {
  settings = { ...settings, ...patch };
  return respond(clone(settings));
}

/* ── Overview ── */
export async function getSeoOverview(): Promise<SeoOverview> {
  const issues: SeoIssue[] = [];
  if (!settings.titleTemplate) issues.push({ id: "i_tpl", label: "No global title template set", severity: "medium" });
  if (!settings.sitemapEnabled) issues.push({ id: "i_sitemap", label: "Sitemap generation is disabled", severity: "high" });
  if (!settings.indexable) issues.push({ id: "i_robots", label: "Site is set to noindex (not crawlable)", severity: "high" });
  const dupTitles = pages.length - new Set(pages.map((p) => p.title)).size;
  if (dupTitles > 0) issues.push({ id: "i_dup", label: `${dupTitles} duplicate meta title(s)`, severity: "medium" });
  if (redirects.some((r) => r.from === r.to)) issues.push({ id: "i_redir", label: "A redirect points to itself", severity: "high" });
  return respond({
    avgPageScore: 82,
    pageOverrides: pages.length,
    redirects: redirects.length,
    noindexPages: pages.filter((p) => p.noindex).length,
    issues,
  });
}

/* ── Page overrides ── */
export const listPages = () => respond([...pages]);
export async function createPage(input: SeoPageInput): Promise<SeoPage> {
  const row: SeoPage = { ...input, id: `sp_${++pageSeq}` };
  pages.push(row);
  return respond(row);
}
export async function updatePage(id: string, patch: Partial<SeoPageInput>): Promise<SeoPage | null> {
  const row = pages.find((p) => p.id === id);
  if (!row) return respond(null);
  Object.assign(row, patch);
  return respond(clone(row));
}
export async function deletePage(id: string): Promise<boolean> {
  const i = pages.findIndex((p) => p.id === id);
  if (i === -1) return respond(false);
  pages.splice(i, 1);
  return respond(true);
}

/* ── Redirects ── */
export const listRedirects = () => respond([...redirects]);
export async function createRedirect(input: SeoRedirectInput): Promise<SeoRedirect> {
  const row: SeoRedirect = { ...input, id: `rd_${++rdSeq}` };
  redirects.push(row);
  return respond(row);
}
export async function updateRedirect(id: string, patch: Partial<SeoRedirectInput>): Promise<SeoRedirect | null> {
  const row = redirects.find((r) => r.id === id);
  if (!row) return respond(null);
  Object.assign(row, patch);
  return respond(clone(row));
}
export async function deleteRedirect(id: string): Promise<boolean> {
  const i = redirects.findIndex((r) => r.id === id);
  if (i === -1) return respond(false);
  redirects.splice(i, 1);
  return respond(true);
}

/* ── Schema (JSON-LD) ── */
function summarize(): SchemaSummary {
  const active = schemas.filter((s) => s.status).length;
  const valid = schemas.filter((s) => s.health === "valid").length;
  const needAttention = schemas.filter((s) => s.health !== "valid").length;
  return {
    total: schemas.length, active, valid, needAttention,
    healthScore: schemas.length ? Math.round((valid / schemas.length) * 100) : 100,
  };
}
export const listSchemas = () => respond({ data: [...schemas], summary: summarize() });
export async function createSchema(input: SeoSchemaInput): Promise<SeoSchema> {
  let health: SchemaHealth = "valid";
  const issues: string[] = [];
  try { JSON.parse(input.jsonld); } catch { health = "errors"; issues.push("Invalid JSON"); }
  const row: SeoSchema = { ...input, id: `sc_${++scSeq}`, pagesLinked: 0, health, issues };
  schemas.push(row);
  return respond(row);
}
export async function updateSchema(id: string, patch: Partial<SeoSchemaInput>): Promise<SeoSchema | null> {
  const row = schemas.find((s) => s.id === id);
  if (!row) return respond(null);
  Object.assign(row, patch);
  if (patch.jsonld !== undefined) {
    try { JSON.parse(patch.jsonld); row.health = "valid"; row.issues = []; }
    catch { row.health = "errors"; row.issues = ["Invalid JSON"]; }
  }
  return respond(clone(row));
}
export async function deleteSchema(id: string): Promise<boolean> {
  const i = schemas.findIndex((s) => s.id === id);
  if (i === -1) return respond(false);
  schemas.splice(i, 1);
  return respond(true);
}

/* ════════════════════════════════════════════════════════════════════════ */
/*  Analytics tables — sitemaps · backlinks · GSC · GEO · broken URLs          */
/* ════════════════════════════════════════════════════════════════════════ */

const isoNow = () => new Date().toISOString();
const hostOf = (url: string) => { try { return new URL(url).hostname; } catch { return url; } };

/* ── Sitemaps ── */
export type SitemapStatus = "ok" | "error" | "pending";
export interface Sitemap {
  id: string; url: string; type: string; lastCrawled?: string; urlsFound: number; status: SitemapStatus;
}
export type SitemapInput = { url: string; type: string };
export interface SitemapSummary { total: number; discoveredUrls: number; errorRate: number }

const sitemaps: Sitemap[] = [
  { id: "sm_1", url: "https://imetsedu.com/sitemap.xml", type: "index", lastCrawled: "2026-06-20T09:00:00.000Z", urlsFound: 248, status: "ok" },
  { id: "sm_2", url: "https://imetsedu.com/sitemap-courses.xml", type: "courses", lastCrawled: "2026-06-20T09:00:00.000Z", urlsFound: 132, status: "ok" },
  { id: "sm_3", url: "https://imetsedu.com/sitemap-blog.xml", type: "blog", urlsFound: 0, status: "error" },
];
let smSeq = sitemaps.length;
const sitemapSummary = (): SitemapSummary => ({
  total: sitemaps.length,
  discoveredUrls: sitemaps.reduce((s, x) => s + x.urlsFound, 0),
  errorRate: sitemaps.length ? Math.round((sitemaps.filter((x) => x.status === "error").length / sitemaps.length) * 1000) / 10 : 0,
});
export const listSitemaps = () => respond({ data: [...sitemaps], summary: sitemapSummary() });
export async function createSitemap(input: SitemapInput): Promise<Sitemap> {
  const row: Sitemap = { ...input, id: `sm_${++smSeq}`, urlsFound: 0, status: "pending" };
  sitemaps.push(row); return respond(row);
}
export async function recrawlSitemap(id: string): Promise<Sitemap | null> {
  const row = sitemaps.find((s) => s.id === id);
  if (!row) return respond(null);
  row.lastCrawled = isoNow(); row.status = "ok"; row.urlsFound = row.urlsFound || 50;
  return respond(clone(row));
}
export async function deleteSitemap(id: string): Promise<boolean> {
  const i = sitemaps.findIndex((s) => s.id === id);
  if (i === -1) return respond(false);
  sitemaps.splice(i, 1); return respond(true);
}

/* ── Backlinks ── */
export type LinkAttribute = "dofollow" | "nofollow";
export type BacklinkStatus = "new" | "live" | "lost";
export interface Backlink {
  id: string; sourceUrl: string; anchor: string; destination: string; authority: number;
  attribute: LinkAttribute; status: BacklinkStatus; firstSeen: string;
}
export type BacklinkInput = Omit<Backlink, "id" | "firstSeen">;
export interface BacklinkSummary { total: number; referringDomains: number; avgAuthority: number; lost: number }

const backlinks: Backlink[] = [
  { id: "bl_1", sourceUrl: "https://forbesmiddleeast.com/article", anchor: "IMETS diploma", destination: "/courses", authority: 82, attribute: "dofollow", status: "live", firstSeen: "2026-04-10T09:00:00.000Z" },
  { id: "bl_2", sourceUrl: "https://medium.com/@author/post", anchor: "business courses Egypt", destination: "/", authority: 61, attribute: "dofollow", status: "live", firstSeen: "2026-05-02T09:00:00.000Z" },
  { id: "bl_3", sourceUrl: "https://oldblog.net/x", anchor: "click here", destination: "/courses/pmp", authority: 24, attribute: "nofollow", status: "lost", firstSeen: "2026-03-01T09:00:00.000Z" },
];
let blSeq = backlinks.length;
const backlinkSummary = (): BacklinkSummary => ({
  total: backlinks.length,
  referringDomains: new Set(backlinks.map((b) => hostOf(b.sourceUrl))).size,
  avgAuthority: backlinks.length ? Math.round(backlinks.reduce((s, b) => s + b.authority, 0) / backlinks.length) : 0,
  lost: backlinks.filter((b) => b.status === "lost").length,
});
export const listBacklinks = () => respond({ data: [...backlinks], summary: backlinkSummary() });
export async function createBacklink(input: BacklinkInput): Promise<Backlink> {
  const row: Backlink = { ...input, id: `bl_${++blSeq}`, firstSeen: isoNow() };
  backlinks.push(row); return respond(row);
}
export async function importBacklinks(items: BacklinkInput[]): Promise<number> {
  for (const it of items) backlinks.push({ ...it, id: `bl_${++blSeq}`, firstSeen: isoNow() });
  return respond(items.length);
}
export async function scanBacklinks(): Promise<number> {
  const found: BacklinkInput[] = [
    { sourceUrl: "https://news.example.com/edu", anchor: "IMETS School", destination: "/", authority: 55, attribute: "dofollow", status: "new" },
  ];
  for (const it of found) backlinks.push({ ...it, id: `bl_${++blSeq}`, firstSeen: isoNow() });
  return respond(found.length);
}
export async function deleteBacklink(id: string): Promise<boolean> {
  const i = backlinks.findIndex((b) => b.id === id);
  if (i === -1) return respond(false);
  backlinks.splice(i, 1); return respond(true);
}

/* ── Google Search Console import ── */
export type GscKind = "query" | "page";
export interface GscRow {
  id: string; kind: GscKind; key: string; clicks: number; impressions: number; ctr: number; position: number;
}
export type GscInput = Omit<GscRow, "id">;
export interface GscSummary { clicks: number; impressions: number; ctr: number; position: number }

const gsc: GscRow[] = [
  { id: "gs_1", kind: "query", key: "business diploma cairo", clicks: 412, impressions: 9800, ctr: 4.2, position: 3.1 },
  { id: "gs_2", kind: "query", key: "pmp course egypt", clicks: 286, impressions: 7400, ctr: 3.9, position: 4.6 },
  { id: "gs_3", kind: "page", key: "/courses", clicks: 940, impressions: 21000, ctr: 4.5, position: 2.4 },
];
let gsSeq = gsc.length;
const gscSummary = (): GscSummary => {
  const clicks = gsc.reduce((s, r) => s + r.clicks, 0);
  const impressions = gsc.reduce((s, r) => s + r.impressions, 0);
  return {
    clicks, impressions,
    ctr: impressions ? Math.round((clicks / impressions) * 1000) / 10 : 0,
    position: gsc.length ? Math.round((gsc.reduce((s, r) => s + r.position, 0) / gsc.length) * 10) / 10 : 0,
  };
};
export const listGsc = () => respond({ data: [...gsc], summary: gscSummary() });
export async function importGsc(items: GscInput[]): Promise<number> {
  for (const it of items) gsc.push({ ...it, id: `gs_${++gsSeq}` });
  return respond(items.length);
}
export async function clearGsc(): Promise<boolean> {
  gsc.splice(0, gsc.length); return respond(true);
}
export async function deleteGscRow(id: string): Promise<boolean> {
  const i = gsc.findIndex((r) => r.id === id);
  if (i === -1) return respond(false);
  gsc.splice(i, 1); return respond(true);
}

/* ── GEO (AI answer-engine mentions) ── */
export interface GeoMention {
  id: string; prompt: string; engine: string; mentioned: boolean; citationUrl?: string; notes?: string;
}
export type GeoInput = Omit<GeoMention, "id">;
export interface GeoSummary { total: number; mentions: number; mentionRate: number; engines: number }

const geo: GeoMention[] = [
  { id: "ge_1", prompt: "best business diploma in Egypt", engine: "ChatGPT", mentioned: true, citationUrl: "https://imetsedu.com/courses", notes: "Cited as a top option" },
  { id: "ge_2", prompt: "PMP prep Cairo", engine: "Perplexity", mentioned: false, notes: "Competitor cited instead" },
];
let geSeq = geo.length;
const geoSummary = (): GeoSummary => {
  const mentions = geo.filter((g) => g.mentioned).length;
  return {
    total: geo.length, mentions,
    mentionRate: geo.length ? Math.round((mentions / geo.length) * 1000) / 10 : 0,
    engines: new Set(geo.map((g) => g.engine)).size,
  };
};
export const listGeo = () => respond({ data: [...geo], summary: geoSummary() });
export async function createGeo(input: GeoInput): Promise<GeoMention> {
  const row: GeoMention = { ...input, id: `ge_${++geSeq}` };
  geo.push(row); return respond(row);
}
export async function deleteGeo(id: string): Promise<boolean> {
  const i = geo.findIndex((g) => g.id === id);
  if (i === -1) return respond(false);
  geo.splice(i, 1); return respond(true);
}

/* ── Broken URLs (404 monitor) ── */
export interface BrokenUrl {
  id: string; url: string; statusCode: number; referrer?: string; hits: number; resolved: boolean;
}
export type BrokenInput = { url: string; statusCode: number; referrer?: string };
export interface BrokenSummary { total: number; open: number; resolved: number }

const broken: BrokenUrl[] = [
  { id: "br_1", url: "/courses/old-finance", statusCode: 404, referrer: "https://google.com", hits: 38, resolved: false },
  { id: "br_2", url: "/blog/2024/launch", statusCode: 404, referrer: "/blog", hits: 12, resolved: false },
  { id: "br_3", url: "/promo-2025", statusCode: 410, hits: 5, resolved: true },
];
let brSeq = broken.length;
const brokenSummary = (): BrokenSummary => ({
  total: broken.length,
  open: broken.filter((b) => !b.resolved).length,
  resolved: broken.filter((b) => b.resolved).length,
});
export const listBroken = () => respond({ data: [...broken], summary: brokenSummary() });
export async function createBroken(input: BrokenInput): Promise<BrokenUrl> {
  const row: BrokenUrl = { ...input, id: `br_${++brSeq}`, hits: 1, resolved: false };
  broken.push(row); return respond(row);
}
export async function resolveBroken(id: string, resolved: boolean): Promise<BrokenUrl | null> {
  const row = broken.find((b) => b.id === id);
  if (!row) return respond(null);
  row.resolved = resolved; return respond(clone(row));
}
export async function deleteBroken(id: string): Promise<boolean> {
  const i = broken.findIndex((b) => b.id === id);
  if (i === -1) return respond(false);
  broken.splice(i, 1); return respond(true);
}
