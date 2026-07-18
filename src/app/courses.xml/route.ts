import { dal } from "@/lib/dal";
import { localeUrl } from "@/lib/seo";

// Segment sitemap for courses: the catalogue, category landings, and every
// published course. Registered in SEO Manager → Sitemaps as `courses.xml`.
export const revalidate = 3600;

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function urlNode(path: string, lastmod?: string): string {
  const en = esc(localeUrl(path, "en"));
  const ar = esc(localeUrl(path, "ar"));
  return `  <url><loc>${en}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}<xhtml:link rel="alternate" hreflang="en" href="${en}"/><xhtml:link rel="alternate" hreflang="ar" href="${ar}"/></url>`;
}

export async function GET() {
  const [coursesRes, catsRes] = await Promise.all([
    dal.courses.fetchCourses().catch(() => null),
    dal.lookups.fetchCategories().catch(() => null),
  ]);

  const nodes: string[] = [urlNode("/courses")];
  if (catsRes?.ok) {
    for (const c of catsRes.data) if (c.slug || c.id) nodes.push(urlNode(`/category/${c.slug || c.id}`));
  }
  if (coursesRes?.ok) {
    for (const c of coursesRes.data) {
      if (c.status !== "published" || !c.slug) continue;
      const lm = c.updatedAt ? new Date(c.updatedAt) : null;
      nodes.push(urlNode(`/courses/${c.slug}`, lm && !Number.isNaN(lm.getTime()) ? lm.toISOString() : undefined));
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
