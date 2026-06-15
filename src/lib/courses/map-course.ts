/**
 * Maps a backend course document (`GET /courses`) to the UI `CourseRow` shape.
 * Pure + client-safe.
 */
import type { CourseRow, Difficulty, CourseStatus } from "@/types";

const FALLBACK_THUMB = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=240&fit=crop";

function fmtDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function avgRating(reviews?: any[]): number {
  if (!Array.isArray(reviews) || reviews.length === 0) return 0;
  const rated = reviews.filter((r) => typeof r?.rating === "number");
  if (!rated.length) return 0;
  return Math.round((rated.reduce((s, r) => s + r.rating, 0) / rated.length) * 10) / 10;
}

export function mapCourse(raw: any): CourseRow {
  const egp = raw?.pricing?.egp ?? {};
  const lectures =
    typeof raw?.lectures === "number"
      ? raw.lectures
      : Array.isArray(raw?.modules)
        ? raw.modules.reduce((n: number, m: any) => n + (m?.items?.length ?? m?.lessons?.length ?? 0), 0)
        : 0;
  const category =
    typeof raw?.category === "string" ? raw.category : raw?.category?.nameEn ?? raw?.category?.nameAr ?? "—";
  const difficulty: Difficulty =
    (["Beginner", "Intermediate", "Advanced"] as const).find((d) => d.toLowerCase() === String(raw?.level ?? "").toLowerCase()) ?? "Beginner";

  return {
    id: raw?._id ?? raw?.id,
    slug: raw?.slug ?? "",
    titleEn: raw?.titleEn ?? raw?.titleAr ?? "—",
    titleAr: raw?.titleAr ?? raw?.titleEn ?? "—",
    category,
    difficulty,
    priceEGP: egp.price ?? 0,
    salePriceEGP: egp.salePrice ?? 0,
    students: typeof raw?.students === "number" ? raw.students : Array.isArray(raw?.students) ? raw.students.length : 0,
    lectures,
    rating: typeof raw?.rating === "number" ? raw.rating : avgRating(raw?.textReviews),
    status: (raw?.status === "published" ? "published" : "draft") as CourseStatus,
    isFeatured: !!raw?.isFeatured,
    isBestseller: !!raw?.isBestseller,
    isTopRated: !!raw?.isTopRated,
    thumbnailUrl: raw?.image || raw?.gallery?.[0]?.url || raw?.gallery?.[0] || FALLBACK_THUMB,
    updatedAt: fmtDate(raw?.updatedAt),
    previewVideoUrl: raw?.previewVideoUrl || undefined,
    descriptionEn: raw?.descriptionEn || undefined,
    descriptionAr: raw?.descriptionAr || undefined,
    whoCanAttendEn: raw?.whoCanAttendEn || undefined,
    whoCanAttendAr: raw?.whoCanAttendAr || undefined,
    modules: Array.isArray(raw?.modules)
      ? raw.modules.map((m: any) => ({
          titleEn: m?.titleEn ?? m?.titleAr ?? "Module",
          titleAr: m?.titleAr ?? m?.titleEn ?? "",
          lessons: (m?.lessons ?? m?.items ?? []).map((l: any) => ({
            titleEn: l?.titleEn ?? l?.titleAr ?? "Lesson",
            titleAr: l?.titleAr ?? l?.titleEn ?? "",
            duration: l?.duration || undefined,
            isFreePreview: !!l?.isFreePreview,
          })),
        }))
      : undefined,
  };
}
