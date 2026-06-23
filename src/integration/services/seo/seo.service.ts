import { api, type Result } from "@integration/services/http/client";
import {
  API_SEO_OVERVIEW, API_SEO_SETTINGS, API_SEO_PAGES, apiSeoPage,
  API_SEO_REDIRECTS, apiSeoRedirect, API_SEO_SCHEMAS, apiSeoSchema,
  API_PUBLIC_SEO_SETTINGS, API_PUBLIC_SEO_PAGE, API_PUBLIC_SEO_REDIRECTS, API_PUBLIC_SEO_SCHEMAS,
} from "@integration/constants/api/seo";
import type {
  SeoSettingsDto, SeoPageDto, SeoRedirectDto, SeoSchemaDto, SeoOverviewDto, SeoSchemaSummaryDto,
} from "./types";

/* ── Analytics tables ── */
import {
  API_SEO_SITEMAPS, apiSeoSitemap, apiSeoSitemapRecrawl,
  API_SEO_BACKLINKS, API_SEO_BACKLINKS_IMPORT, API_SEO_BACKLINKS_SCAN, apiSeoBacklink,
  API_SEO_GSC, API_SEO_GSC_IMPORT, API_SEO_GSC_CLEAR, apiSeoGscRow,
  API_SEO_GEO, apiSeoGeo, API_SEO_BROKEN, apiSeoBrokenResolve, apiSeoBroken,
} from "@integration/constants/api/seo";
import type {
  SitemapDto, BacklinkDto, GscRowDto, GeoMentionDto, BrokenUrlDto,
  SitemapSummaryDto, BacklinkSummaryDto, GscSummaryDto, GeoSummaryDto, BrokenSummaryDto,
} from "./types";

export const listSitemaps = () => api.get<{ data: SitemapDto[]; summary: SitemapSummaryDto }>(API_SEO_SITEMAPS);
export const createSitemap = (input: Record<string, unknown>) => api.post<SitemapDto>(API_SEO_SITEMAPS, input);
export const recrawlSitemap = (id: string) => api.post<SitemapDto>(apiSeoSitemapRecrawl(id), {});
export const deleteSitemap = (id: string) => api.delete<{ success: boolean }>(apiSeoSitemap(id));

export const listBacklinks = () => api.get<{ data: BacklinkDto[]; summary: BacklinkSummaryDto }>(API_SEO_BACKLINKS);
export const createBacklink = (input: Record<string, unknown>) => api.post<BacklinkDto>(API_SEO_BACKLINKS, input);
export const importBacklinks = (items: Record<string, unknown>[]) => api.post<number>(API_SEO_BACKLINKS_IMPORT, { items });
export const scanBacklinks = () => api.post<number>(API_SEO_BACKLINKS_SCAN, {});
export const deleteBacklink = (id: string) => api.delete<{ success: boolean }>(apiSeoBacklink(id));

export const listGsc = () => api.get<{ data: GscRowDto[]; summary: GscSummaryDto }>(API_SEO_GSC);
export const importGsc = (items: Record<string, unknown>[]) => api.post<number>(API_SEO_GSC_IMPORT, { items });
export const clearGsc = () => api.delete<{ success: boolean }>(API_SEO_GSC_CLEAR);
export const deleteGscRow = (id: string) => api.delete<{ success: boolean }>(apiSeoGscRow(id));

export const listGeo = () => api.get<{ data: GeoMentionDto[]; summary: GeoSummaryDto }>(API_SEO_GEO);
export const createGeo = (input: Record<string, unknown>) => api.post<GeoMentionDto>(API_SEO_GEO, input);
export const deleteGeo = (id: string) => api.delete<{ success: boolean }>(apiSeoGeo(id));

export const listBroken = () => api.get<{ data: BrokenUrlDto[]; summary: BrokenSummaryDto }>(API_SEO_BROKEN);
export const createBroken = (input: Record<string, unknown>) => api.post<BrokenUrlDto>(API_SEO_BROKEN, input);
export const resolveBroken = (id: string, resolved: boolean) => api.patch<BrokenUrlDto>(apiSeoBrokenResolve(id), { resolved });
export const deleteBroken = (id: string) => api.delete<{ success: boolean }>(apiSeoBroken(id));

/* ── Public reads (site metadata + middleware; cached, no auth) ── */
export const getPublicSettings = () =>
  api.get<SeoSettingsDto>(API_PUBLIC_SEO_SETTINGS, { requireAuth: false, revalidate: 300 });
export const getPublicPage = (path: string) =>
  api.get<SeoPageDto | null>(API_PUBLIC_SEO_PAGE, { requireAuth: false, params: { path }, revalidate: 300 });
export const getPublicRedirects = () =>
  api.get<SeoRedirectDto[]>(API_PUBLIC_SEO_REDIRECTS, { requireAuth: false, revalidate: 300 });
export const getPublicSchemas = () =>
  api.get<SeoSchemaDto[]>(API_PUBLIC_SEO_SCHEMAS, { requireAuth: false, revalidate: 300 });

/* Overview + settings */
export const getOverview = () => api.get<SeoOverviewDto>(API_SEO_OVERVIEW);
export const getSettings = () => api.get<SeoSettingsDto>(API_SEO_SETTINGS);
export const updateSettings = (patch: Partial<SeoSettingsDto>) => api.patch<SeoSettingsDto>(API_SEO_SETTINGS, patch);

/* Page overrides */
export const listPages = () => api.get<SeoPageDto[]>(API_SEO_PAGES);
export const createPage = (input: Record<string, unknown>) => api.post<SeoPageDto>(API_SEO_PAGES, input);
export const updatePage = (id: string, patch: Record<string, unknown>) => api.patch<SeoPageDto>(apiSeoPage(id), patch);
export const deletePage = (id: string) => api.delete<{ success: boolean }>(apiSeoPage(id));

/* Redirects */
export const listRedirects = () => api.get<SeoRedirectDto[]>(API_SEO_REDIRECTS);
export const createRedirect = (input: Record<string, unknown>) => api.post<SeoRedirectDto>(API_SEO_REDIRECTS, input);
export const updateRedirect = (id: string, patch: Record<string, unknown>) => api.patch<SeoRedirectDto>(apiSeoRedirect(id), patch);
export const deleteRedirect = (id: string) => api.delete<{ success: boolean }>(apiSeoRedirect(id));

/* Schema (JSON-LD) */
export const listSchemas = () => api.get<{ data: SeoSchemaDto[]; summary: SeoSchemaSummaryDto }>(API_SEO_SCHEMAS);
export const createSchema = (input: Record<string, unknown>) => api.post<SeoSchemaDto>(API_SEO_SCHEMAS, input);
export const updateSchema = (id: string, patch: Record<string, unknown>) => api.patch<SeoSchemaDto>(apiSeoSchema(id), patch);
export const deleteSchema = (id: string) => api.delete<{ success: boolean }>(apiSeoSchema(id));

export type { Result };
