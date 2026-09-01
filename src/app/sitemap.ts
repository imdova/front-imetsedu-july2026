import type { MetadataRoute } from "next";

import { dal } from "@/lib/dal";
import { localeUrl } from "@/lib/seo";

// Public, indexable static routes (locale-agnostic paths).
const STATIC_PATHS = [
  "/",
  "/courses",
  "/free-courses",
  "/instructors",
  "/about",
  "/become-instructor",
  "/contact",
  "/help",
  "/blog",
  "/careers",
  "/privacy",
  "/terms",
  "/success-stories",
];

/** One sitemap entry per path, with en as canonical + ar hreflang alternate. */
function entry(
  path: string,
  lastModified?: Date,
): MetadataRoute.Sitemap[number] {
  return {
    url: localeUrl(path, "en"),
    ...(lastModified ? { lastModified } : {}),
    alternates: { languages: { ar: localeUrl(path, "ar") } },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [coursesRes, catsRes, instRes, freeRes, blogRes, blogCatsRes] = await Promise.all([
    dal.courses.fetchCourses().catch(() => null),
    dal.lookups.fetchCategories().catch(() => null),
    dal.lookups.fetchInstructors().catch(() => null),
    dal.freeCourses.fetchFreePrograms().catch(() => null),
    dal.blog.fetchPublicArticles({ limit: 1000 }).catch(() => null),
    dal.blog.fetchTopics().catch(() => null),
  ]);

  const entries: MetadataRoute.Sitemap = STATIC_PATHS.map((p) => entry(p));

  if (coursesRes?.ok) {
    for (const c of coursesRes.data) {
      if (c.status !== "published" || !c.slug) continue;
      const lm = new Date(c.updatedAt);
      entries.push(
        entry(
          `/courses/${c.slug}`,
          Number.isNaN(lm.getTime()) ? undefined : lm,
        ),
      );
    }
  }
  if (catsRes?.ok) {
    for (const c of catsRes.data)
      entries.push(entry(`/category/${c.slug || c.id}`));
  }
  if (instRes?.ok) {
    for (const i of instRes.data)
      entries.push(entry(`/instructors/${i.slug || i.id}`));
  }
  /*
   * Free-lecture detail pages are intentionally NOT listed. They are noindexed
   * (lead capture, not search assets) and several duplicate the H1 of a paid
   * course page — submitting a noindexed URL only asks Google to crawl
   * something it is then told to drop. The `/free-courses` index above stays.
   */
  // Published blog articles (the public list returns only PUBLISHED).
  if (blogRes?.ok) {
    for (const post of blogRes.data.data) {
      if (!post.slug) continue;
      const lm = post.updatedAt ? new Date(post.updatedAt) : undefined;
      entries.push(entry(`/blog/${post.slug}`, lm && !Number.isNaN(lm.getTime()) ? lm : undefined));
    }
  }
  // Blog category landing pages.
  if (blogCatsRes?.ok) {
    for (const c of blogCatsRes.data)
      if (c.slug) entries.push(entry(`/blog/category/${c.slug}`));
  }

  return entries;
}
