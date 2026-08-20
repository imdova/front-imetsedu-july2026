// Admin
export const API_SEO_OVERVIEW = "/admin/seo/overview";
export const API_SEO_SETTINGS = "/admin/seo/settings";
export const API_SEO_PAGES = "/admin/seo/pages";
export const API_SEO_PUBLIC_PAGES = "/admin/seo/public-pages";
export const API_SEO_PUBLIC_PAGE_DETAIL = "/admin/seo/public-pages/detail";
export const API_SEO_PUBLIC_PAGE_ENTITY = "/admin/seo/public-pages/entity";
export const apiSeoPage = (id: string) => `/admin/seo/pages/${id}`;
export const API_SEO_REDIRECTS = "/admin/seo/redirects";
export const apiSeoRedirect = (id: string) => `/admin/seo/redirects/${id}`;
export const API_SEO_SCHEMAS = "/admin/seo/schemas";
export const apiSeoSchema = (id: string) => `/admin/seo/schemas/${id}`;

// Admin — analytics tables
export const API_SEO_SITEMAPS = "/admin/seo/sitemaps";
export const apiSeoSitemap = (id: string) => `/admin/seo/sitemaps/${id}`;
export const apiSeoSitemapRecrawl = (id: string) => `/admin/seo/sitemaps/${id}/recrawl`;
export const API_SEO_BACKLINKS = "/admin/seo/backlinks";
export const API_SEO_BACKLINKS_IMPORT = "/admin/seo/backlinks/import";
export const API_SEO_BACKLINKS_SCAN = "/admin/seo/backlinks/scan";
export const apiSeoBacklink = (id: string) => `/admin/seo/backlinks/${id}`;
export const API_SEO_GSC = "/admin/seo/gsc";
export const API_SEO_GSC_IMPORT = "/admin/seo/gsc/import";
export const API_SEO_GSC_CLEAR = "/admin/seo/gsc/clear";
export const apiSeoGscRow = (id: string) => `/admin/seo/gsc/${id}`;
export const API_SEO_GEO = "/admin/seo/geo";
export const apiSeoGeo = (id: string) => `/admin/seo/geo/${id}`;
export const API_SEO_BROKEN = "/admin/seo/broken-urls";
export const apiSeoBrokenResolve = (id: string) => `/admin/seo/broken-urls/${id}/resolve`;
export const apiSeoBroken = (id: string) => `/admin/seo/broken-urls/${id}`;

// Public (site metadata + middleware)
export const API_PUBLIC_SEO_SETTINGS = "/seo/settings";
export const API_PUBLIC_SEO_PAGE = "/seo/page";
export const API_PUBLIC_SEO_REDIRECTS = "/seo/redirects";
export const API_PUBLIC_SEO_SCHEMAS = "/seo/schemas";
