/**
 * Maps backend taxonomy documents (categories, sub-categories, tags,
 * course-variables) to the Course Settings UI shapes. Pure + client-safe.
 */
import type { TaxonomyRow, CourseSubcategory, CourseVariable } from "@/lib/db/course-taxonomy";

function dateParts(iso?: string): { createdAt: string; createdTime: string } {
  if (!iso) return { createdAt: "—", createdTime: "" };
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { createdAt: "—", createdTime: "" };
  return {
    createdAt: d.toLocaleDateString("en-US"),
    createdTime: d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
  };
}

export function toTaxonomyRow(raw: any): TaxonomyRow {
  const { createdAt, createdTime } = dateParts(raw?.createdAt);
  return {
    id: raw?._id ?? raw?.id,
    nameEn: raw?.nameEn ?? raw?.nameAr ?? "—",
    nameAr: raw?.nameAr ?? raw?.nameEn ?? "—",
    icon: raw?.icon ?? undefined,
    rank: raw?.rank ?? raw?.priority ?? 0,
    createdAt,
    createdTime,
    courses: raw?.coursesCount ?? raw?.courseCount ?? 0,
    active: raw?.isActive ?? true,
  };
}

export function toCourseSubcategory(raw: any): CourseSubcategory {
  return {
    ...toTaxonomyRow(raw),
    parentId: raw?.parentCategory?._id ?? raw?.parentCategory ?? raw?.parentCategoryId ?? "",
    parentName: raw?.parentCategory?.nameEn ?? raw?.parentCategory?.nameAr ?? "—",
    slug: raw?.slug ?? "",
  };
}

export function toCourseVariable(raw: any): CourseVariable {
  const en: string[] = raw?.optionsEn ?? [];
  const ar: string[] = raw?.optionsAr ?? [];
  const len = Math.max(en.length, ar.length);
  return {
    id: raw?._id ?? raw?.id,
    nameEn: raw?.nameEn ?? raw?.nameAr ?? "—",
    nameAr: raw?.nameAr ?? raw?.nameEn ?? "—",
    options: Array.from({ length: len }, (_, i) => ({ en: en[i] ?? ar[i] ?? "", ar: ar[i] ?? en[i] ?? "" })),
  };
}
