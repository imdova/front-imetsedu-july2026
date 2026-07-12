/**
 * SEO DAL — FULLY LIVE.
 *
 * Settings, overview, page overrides, redirects, JSON-LD schema AND the analytics
 * tables (sitemaps/backlinks/gsc/geo/broken-urls) all delegate to the NestJS
 * `seo` module via `@integration/services/seo` (`/admin/seo/*`), mapping backend
 * `_id` → UI `id`. UI types are still sourced from `@/lib/db/seo` (type-only);
 * the `Result<T>` shape is unchanged so the SEO Manager UI works without edits.
 */
import { ok, type Result } from "@integration/lib/api-client";
import * as svc from "@integration/services/seo";
import type * as db from "@/lib/db/seo";

/* ── Mappers (backend DTO → UI view-model) ── */
const mapPage = (d: svc.SeoPageDto): db.SeoPage => ({
  id: d._id, path: d.path, title: d.title, description: d.description,
  titleAr: d.titleAr, descriptionAr: d.descriptionAr, ogImage: d.ogImage,
  focusKeyword: d.focusKeyword, canonical: d.canonical, noindex: d.noindex,
});
const mapRedirect = (d: svc.SeoRedirectDto): db.SeoRedirect => ({
  id: d._id, from: d.from, to: d.to, type: d.type as db.RedirectType, isActive: d.isActive,
});
const mapSchema = (d: svc.SeoSchemaDto): db.SeoSchema => ({
  id: d._id, name: d.name, type: d.type, jsonld: d.jsonld, status: d.status,
  pagesLinked: d.pagesLinked, health: d.health as db.SchemaHealth, issues: d.issues ?? [],
});

/* ── Overview + settings (LIVE) ── */
export async function fetchOverview(): Promise<Result<db.SeoOverview>> {
  const res = await svc.getOverview();
  return res.ok ? ok(res.data as db.SeoOverview) : res;
}
export async function fetchSettings(): Promise<Result<db.SeoSettings>> {
  const res = await svc.getSettings();
  return res.ok ? ok(res.data as db.SeoSettings) : res;
}
/** The exact fields the backend `UpdateSeoSettingsDto` accepts. */
const SEO_SETTINGS_KEYS: (keyof db.SeoSettings)[] = [
  "siteName", "titleTemplate", "defaultTitle", "defaultDescription", "defaultOgImage",
  "twitterHandle", "canonicalBaseUrl", "keywords", "indexable", "robotsTxt", "sitemapEnabled",
];
export async function updateSettings(patch: Partial<db.SeoSettings>): Promise<Result<db.SeoSettings>> {
  // `fetchSettings` returns the raw Mongo document (`_id`, `__v`, `createdAt`,
  // `updatedAt`) and the editor echoes it back on save; strip everything except
  // the known fields so the strict (`forbidNonWhitelisted`) backend DTO doesn't 400.
  const clean: Record<string, unknown> = {};
  for (const k of SEO_SETTINGS_KEYS) {
    if (patch[k] !== undefined) clean[k] = patch[k];
  }
  const res = await svc.updateSettings(clean as Partial<db.SeoSettings>);
  return res.ok ? ok(res.data as db.SeoSettings) : res;
}

/* ── Page overrides (LIVE) ── */
export async function fetchPages(): Promise<Result<db.SeoPage[]>> {
  const res = await svc.listPages();
  return res.ok ? ok(res.data.map(mapPage)) : res;
}
export async function createPage(input: db.SeoPageInput): Promise<Result<db.SeoPage>> {
  const res = await svc.createPage(input);
  return res.ok ? ok(mapPage(res.data)) : res;
}
export async function updatePage(id: string, patch: Partial<db.SeoPageInput>): Promise<Result<db.SeoPage | null>> {
  const res = await svc.updatePage(id, patch);
  return res.ok ? ok(res.data ? mapPage(res.data) : null) : res;
}
export async function deletePage(id: string): Promise<Result<boolean>> {
  const res = await svc.deletePage(id);
  return res.ok ? ok(true) : res;
}

/* ── Redirects (LIVE) ── */
export async function fetchRedirects(): Promise<Result<db.SeoRedirect[]>> {
  const res = await svc.listRedirects();
  return res.ok ? ok(res.data.map(mapRedirect)) : res;
}
export async function createRedirect(input: db.SeoRedirectInput): Promise<Result<db.SeoRedirect>> {
  const res = await svc.createRedirect(input);
  return res.ok ? ok(mapRedirect(res.data)) : res;
}
export async function updateRedirect(id: string, patch: Partial<db.SeoRedirectInput>): Promise<Result<db.SeoRedirect | null>> {
  const res = await svc.updateRedirect(id, patch);
  return res.ok ? ok(res.data ? mapRedirect(res.data) : null) : res;
}
export async function deleteRedirect(id: string): Promise<Result<boolean>> {
  const res = await svc.deleteRedirect(id);
  return res.ok ? ok(true) : res;
}

/* ── Schema (JSON-LD) (LIVE) ── */
export async function fetchSchemas(): Promise<Result<{ data: db.SeoSchema[]; summary: db.SchemaSummary }>> {
  const res = await svc.listSchemas();
  return res.ok ? ok({ data: res.data.data.map(mapSchema), summary: res.data.summary }) : res;
}
export async function createSchema(input: db.SeoSchemaInput): Promise<Result<db.SeoSchema>> {
  const res = await svc.createSchema(input);
  return res.ok ? ok(mapSchema(res.data)) : res;
}
export async function updateSchema(id: string, patch: Partial<db.SeoSchemaInput>): Promise<Result<db.SeoSchema | null>> {
  const res = await svc.updateSchema(id, patch);
  return res.ok ? ok(res.data ? mapSchema(res.data) : null) : res;
}
export async function deleteSchema(id: string): Promise<Result<boolean>> {
  const res = await svc.deleteSchema(id);
  return res.ok ? ok(true) : res;
}

/* ── Analytics (LIVE) ── */
const rec = (o: object) => o as unknown as Record<string, unknown>;
const mapSitemap = (d: svc.SitemapDto): db.Sitemap => ({
  id: d._id, url: d.url, type: d.type, lastCrawled: d.lastCrawled, urlsFound: d.urlsFound, status: d.status as db.SitemapStatus,
});
const mapBacklink = (d: svc.BacklinkDto): db.Backlink => ({
  id: d._id, sourceUrl: d.sourceUrl, anchor: d.anchor, destination: d.destination, authority: d.authority,
  attribute: d.attribute as db.LinkAttribute, status: d.status as db.BacklinkStatus, firstSeen: d.createdAt,
});
const mapGsc = (d: svc.GscRowDto): db.GscRow => ({
  id: d._id, kind: d.kind as db.GscKind, key: d.key, clicks: d.clicks, impressions: d.impressions, ctr: d.ctr, position: d.position,
});
const mapGeo = (d: svc.GeoMentionDto): db.GeoMention => ({
  id: d._id, prompt: d.prompt, engine: d.engine, mentioned: d.mentioned, citationUrl: d.citationUrl, notes: d.notes,
});
const mapBroken = (d: svc.BrokenUrlDto): db.BrokenUrl => ({
  id: d._id, url: d.url, statusCode: d.statusCode, referrer: d.referrer, hits: d.hits, resolved: d.resolved,
});

/* Sitemaps */
export async function fetchSitemaps(): Promise<Result<{ data: db.Sitemap[]; summary: db.SitemapSummary }>> {
  const res = await svc.listSitemaps();
  return res.ok ? ok({ data: res.data.data.map(mapSitemap), summary: res.data.summary }) : res;
}
export async function createSitemap(input: db.SitemapInput): Promise<Result<db.Sitemap>> {
  const res = await svc.createSitemap(rec(input));
  return res.ok ? ok(mapSitemap(res.data)) : res;
}
export async function recrawlSitemap(id: string): Promise<Result<db.Sitemap | null>> {
  const res = await svc.recrawlSitemap(id);
  return res.ok ? ok(res.data ? mapSitemap(res.data) : null) : res;
}
export async function deleteSitemap(id: string): Promise<Result<boolean>> {
  const res = await svc.deleteSitemap(id);
  return res.ok ? ok(true) : res;
}

/* Backlinks */
export async function fetchBacklinks(): Promise<Result<{ data: db.Backlink[]; summary: db.BacklinkSummary }>> {
  const res = await svc.listBacklinks();
  return res.ok ? ok({ data: res.data.data.map(mapBacklink), summary: res.data.summary }) : res;
}
export async function createBacklink(input: db.BacklinkInput): Promise<Result<db.Backlink>> {
  const res = await svc.createBacklink(rec(input));
  return res.ok ? ok(mapBacklink(res.data)) : res;
}
export async function importBacklinks(items: db.BacklinkInput[]): Promise<Result<number>> {
  return svc.importBacklinks(items.map(rec));
}
export async function scanBacklinks(): Promise<Result<number>> {
  return svc.scanBacklinks();
}
export async function deleteBacklink(id: string): Promise<Result<boolean>> {
  const res = await svc.deleteBacklink(id);
  return res.ok ? ok(true) : res;
}

/* Google Search Console */
export async function fetchGsc(): Promise<Result<{ data: db.GscRow[]; summary: db.GscSummary }>> {
  const res = await svc.listGsc();
  return res.ok ? ok({ data: res.data.data.map(mapGsc), summary: res.data.summary }) : res;
}
export async function importGsc(items: db.GscInput[]): Promise<Result<number>> {
  return svc.importGsc(items.map(rec));
}
export async function clearGsc(): Promise<Result<boolean>> {
  const res = await svc.clearGsc();
  return res.ok ? ok(true) : res;
}
export async function deleteGscRow(id: string): Promise<Result<boolean>> {
  const res = await svc.deleteGscRow(id);
  return res.ok ? ok(true) : res;
}

/* GEO */
export async function fetchGeo(): Promise<Result<{ data: db.GeoMention[]; summary: db.GeoSummary }>> {
  const res = await svc.listGeo();
  return res.ok ? ok({ data: res.data.data.map(mapGeo), summary: res.data.summary }) : res;
}
export async function createGeo(input: db.GeoInput): Promise<Result<db.GeoMention>> {
  const res = await svc.createGeo(rec(input));
  return res.ok ? ok(mapGeo(res.data)) : res;
}
export async function deleteGeo(id: string): Promise<Result<boolean>> {
  const res = await svc.deleteGeo(id);
  return res.ok ? ok(true) : res;
}

/* Broken URLs */
export async function fetchBroken(): Promise<Result<{ data: db.BrokenUrl[]; summary: db.BrokenSummary }>> {
  const res = await svc.listBroken();
  return res.ok ? ok({ data: res.data.data.map(mapBroken), summary: res.data.summary }) : res;
}
export async function createBroken(input: db.BrokenInput): Promise<Result<db.BrokenUrl>> {
  const res = await svc.createBroken(rec(input));
  return res.ok ? ok(mapBroken(res.data)) : res;
}
export async function resolveBroken(id: string, resolved: boolean): Promise<Result<db.BrokenUrl | null>> {
  const res = await svc.resolveBroken(id, resolved);
  return res.ok ? ok(res.data ? mapBroken(res.data) : null) : res;
}
export async function deleteBroken(id: string): Promise<Result<boolean>> {
  const res = await svc.deleteBroken(id);
  return res.ok ? ok(true) : res;
}
