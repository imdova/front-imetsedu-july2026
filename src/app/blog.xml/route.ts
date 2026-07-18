import { dal } from "@/lib/dal";
import { localeUrl } from "@/lib/seo";

// Segment sitemap for the blog: the index, category landings, and every
// published article. Registered in SEO Manager → Sitemaps as `blog.xml`.
export const revalidate = 3600;

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function urlNode(path: string, lastmod?: string): string {
  const en = esc(localeUrl(path, "en"));
  const ar = esc(localeUrl(path, "ar"));
  return `  <url><loc>${en}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}<xhtml:link rel="alternate" hreflang="en" href="${en}"/><xhtml:link rel="alternate" hreflang="ar" href="${ar}"/></url>`;
}

export async function GET() {
  const [blogRes, catsRes] = await Promise.all([
    dal.blog.fetchPublicArticles({ limit: 1000 }).catch(() => null),
    dal.blog.fetchTopics().catch(() => null),
  ]);

  const nodes: string[] = [urlNode("/blog")];
  if (catsRes?.ok) {
    for (const c of catsRes.data) if (c.slug) nodes.push(urlNode(`/blog/category/${c.slug}`));
  }
  if (blogRes?.ok) {
    for (const p of blogRes.data.data) {
      if (!p.slug) continue;
      const lm = p.updatedAt ? new Date(p.updatedAt) : null;
      nodes.push(urlNode(`/blog/${p.slug}`, lm && !Number.isNaN(lm.getTime()) ? lm.toISOString() : undefined));
    }
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${nodes.join("\n")}\n</urlset>`;
  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
