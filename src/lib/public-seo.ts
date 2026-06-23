/**
 * Public SEO metadata resolver — turns the admin-managed SEO settings + per-page
 * overrides into a Next `Metadata` object for `generateMetadata`. Reads the
 * public, cached SEO endpoints; degrades gracefully if the backend is
 * unavailable (returns minimal metadata rather than throwing).
 */
import type { Metadata } from "next";
import * as seoSvc from "@integration/services/seo";

export async function resolveSeoMetadata(path: string): Promise<Metadata> {
  const [settingsRes, pageRes] = await Promise.all([
    seoSvc.getPublicSettings(),
    seoSvc.getPublicPage(path),
  ]);
  const s = settingsRes.ok ? settingsRes.data : null;
  const p = pageRes.ok ? pageRes.data : null;

  const baseTitle = p?.title || s?.defaultTitle || s?.siteName || "IMETS";
  const title =
    s?.titleTemplate?.includes("%s") && p?.title
      ? s.titleTemplate.replace("%s", p.title)
      : baseTitle;
  const description = p?.description || s?.defaultDescription || "";
  const image = p?.ogImage || s?.defaultOgImage || "";
  const noindex = (s ? !s.indexable : false) || !!p?.noindex;

  const meta: Metadata = {
    title,
    description,
    openGraph: { title, description, ...(image ? { images: [image] } : {}) },
  };
  if (noindex) meta.robots = { index: false, follow: false };
  if (p?.canonical) meta.alternates = { canonical: p.canonical };
  if (s?.twitterHandle) meta.twitter = { card: "summary_large_image", site: s.twitterHandle };
  return meta;
}

/**
 * Merge admin-managed SEO for `path` UNDER a page's own `base` metadata, so the
 * page keeps its (localized) title/description/alternates while inheriting
 * admin-controlled fields it doesn't set — e.g. a site-wide/ per-page noindex,
 * canonical, OG image and twitter handle. Best-effort; never throws.
 */
export async function mergeSeo(path: string, base: Metadata): Promise<Metadata> {
  const admin = await resolveSeoMetadata(path).catch(() => ({} as Metadata));
  return {
    ...admin,
    ...base,
    openGraph: { ...admin.openGraph, ...base.openGraph },
  };
}
