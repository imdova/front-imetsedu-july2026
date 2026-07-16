import type { MetadataRoute } from "next";

import { dal } from "@/lib/dal";
import { localeUrl } from "@/lib/seo";

// Public, indexable static routes (locale-agnostic paths).
const STATIC_PATHS = [
  "/", "/courses", "/free-courses", "/instructors", "/about", "/become-instructor",
  "/contact", "/help", "/blog", "/careers", "/privacy", "/terms",
];

/** One sitemap entry per path, with en as canonical + ar hreflang alternate. */
function entry(path: string, lastModified?: Date): MetadataRoute.Sitemap[number] {
  return {
    url: localeUrl(path, "en"),
    ...(lastModified ? { lastModified } : {}),
    alternates: { languages: { ar: localeUrl(path, "ar") } },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [coursesRes, catsRes, instRes, freeRes] = await Promise.all([
    dal.courses.fetchCourses().catch(() => null),
    dal.lookups.fetchCategories().catch(() => null),
    dal.lookups.fetchInstructors().catch(() => null),
    dal.freeCourses.fetchFreePrograms().catch(() => null),
  ]);

  const entries: MetadataRoute.Sitemap = STATIC_PATHS.map((p) => entry(p));

  if (coursesRes?.ok) {
    for (const c of coursesRes.data) {
      if (c.status !== "published" || !c.slug) continue;
      const lm = new Date(c.updatedAt);
      entries.push(entry(`/courses/${c.slug}`, Number.isNaN(lm.getTime()) ? undefined : lm));
    }
  }
  if (catsRes?.ok) {
    for (const c of catsRes.data) entries.push(entry(`/category/${c.slug || c.id}`));
  }
  if (instRes?.ok) {
    for (const i of instRes.data) entries.push(entry(`/instructors/${i.slug || i.id}`));
  }
  // Only published programs come back from the public endpoint.
  if (freeRes?.ok) {
    for (const p of freeRes.data) entries.push(entry(`/free-courses/${p.slug}`));
  }

  return entries;
}
