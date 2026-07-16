import { dal } from "@/lib/dal";
import type { BuilderCourse } from "@/features/blog-admin/components/article-builder";

/**
 * Published courses offered to the article editor's "Related courses" picker.
 * Only published ones: a draft course has no public page to link to.
 */
export async function blogBuilderCourses(): Promise<BuilderCourse[]> {
  const res = await dal.courses.fetchCourses({ status: "published" });
  if (!res.ok) return [];
  return res.data
    .filter((c) => c.slug)
    .map((c) => ({ slug: c.slug, title: c.titleEn, category: c.category }))
    .sort((a, b) => a.title.localeCompare(b.title));
}
