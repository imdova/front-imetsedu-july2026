/** Raw backend shapes from the NestJS `seo` module. */
export interface SeoSettingsDto {
  siteName: string;
  titleTemplate: string;
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

export interface SeoPageDto {
  _id: string;
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

export interface SeoRedirectDto {
  _id: string;
  from: string;
  to: string;
  type: string;
  isActive: boolean;
}

export interface SeoSchemaDto {
  _id: string;
  name: string;
  type: string;
  jsonld: string;
  status: boolean;
  pagesLinked: number;
  health: string;
  issues: string[];
}

export interface SeoOverviewDto {
  avgPageScore: number;
  pageOverrides: number;
  redirects: number;
  noindexPages: number;
  issues: { id: string; label: string; severity: "low" | "medium" | "high" }[];
}

export interface SeoSchemaSummaryDto {
  total: number;
  active: number;
  valid: number;
  needAttention: number;
  healthScore: number;
}

/* ── Analytics ── */
export interface SitemapDto { _id: string; url: string; type: string; lastCrawled?: string; urlsFound: number; status: string }
export interface BacklinkDto { _id: string; sourceUrl: string; anchor: string; destination: string; authority: number; attribute: string; status: string; createdAt: string }
export interface GscRowDto { _id: string; kind: string; key: string; clicks: number; impressions: number; ctr: number; position: number }
export interface GeoMentionDto { _id: string; prompt: string; engine: string; mentioned: boolean; citationUrl?: string; notes?: string }
export interface BrokenUrlDto { _id: string; url: string; statusCode: number; referrer?: string; hits: number; resolved: boolean }

export interface SitemapSummaryDto { total: number; discoveredUrls: number; errorRate: number }
export interface BacklinkSummaryDto { total: number; referringDomains: number; avgAuthority: number; lost: number }
export interface GscSummaryDto { clicks: number; impressions: number; ctr: number; position: number }
export interface GeoSummaryDto { total: number; mentions: number; mentionRate: number; engines: number }
export interface BrokenSummaryDto { total: number; open: number; resolved: number }
