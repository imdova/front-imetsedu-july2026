/**
 * Maps backend LMS documents (`/lms-courses`, `/lms-categories`,
 * `/lms-sub-categories`) to the UI LMS shapes. Pure + client-safe.
 */
import type {
  LmsCourse, LmsStats, LmsCourseDetail, LmsCategory, LmsSubcategory,
  CurriculumModule, CurriculumItem, LmsMaterial,
} from "@/lib/db/lms";

function fmtDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? (iso || "—") : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function lessonsOf(modules?: any[]): number {
  return (modules ?? []).reduce((n, m) => n + (m?.items?.length ?? m?.lessons?.length ?? 0), 0);
}

export function mapLmsCourse(raw: any): LmsCourse {
  return {
    id: raw?._id ?? raw?.id,
    name: raw?.title ?? raw?.name ?? "—",
    category: raw?.category?.name ?? raw?.category?.nameEn ?? "—",
    subcategory: raw?.subcategory?.name ?? raw?.subcategory?.nameEn ?? "—",
    createdAt: fmtDate(raw?.createdAt),
    groups: raw?.numberOfGroups ?? raw?.assignedGroups?.length ?? 0,
    enrollment: raw?.enrollment ?? raw?.students?.length ?? 0,
    revenue: raw?.revenue ?? 0,
    active: raw?.isActive ?? true,
    lessons: lessonsOf(raw?.modules),
  };
}

export function computeLmsStats(rawList: any[]): LmsStats {
  const list = rawList ?? [];
  return {
    activeCourses: list.filter((c) => c?.isActive).length,
    totalLessons: list.reduce((n, c) => n + lessonsOf(c?.modules), 0),
    avgCompletion: list.length ? Math.round(list.reduce((s, c) => s + (c?.overallProgress ?? 0), 0) / list.length) : 0,
  };
}

export function mapLmsCategory(raw: any): LmsCategory {
  return {
    id: raw?._id ?? raw?.id,
    name: raw?.name ?? raw?.nameEn ?? "—",
    createdAt: fmtDate(raw?.createdAt),
    courses: raw?.coursesCount ?? raw?.courseCount ?? 0,
  };
}

export interface LmsAssignmentRow {
  id: string;
  title: string;
  priority: string;
  dueDate: string;
  createdDate: string;
  attachments: number;
}
export function mapLmsAssignment(raw: any): LmsAssignmentRow {
  const p = String(raw?.priority ?? "regular");
  return {
    id: raw?._id ?? raw?.id ?? "",
    title: raw?.title ?? raw?.titleEn ?? "—",
    priority: p.charAt(0).toUpperCase() + p.slice(1),
    dueDate: fmtDate(raw?.dueDate),
    createdDate: fmtDate(raw?.createdAt),
    attachments: Array.isArray(raw?.files) ? raw.files.length : 0,
  };
}

export function mapLmsSubcategory(raw: any): LmsSubcategory {
  return {
    ...mapLmsCategory(raw),
    parentId: raw?.parentCategory?._id ?? raw?.parentCategory ?? raw?.parentCategoryId ?? "",
    parentName: raw?.parentCategory?.name ?? raw?.parentCategory?.nameEn ?? "—",
  };
}

function mapModule(m: any): CurriculumModule {
  return {
    id: m?._id ?? m?.id,
    title: m?.title ?? m?.titleEn ?? "—",
    items: (m?.items ?? m?.lessons ?? []).map((it: any): CurriculumItem => ({
      id: it?._id ?? it?.id,
      type: (it?.type === "quiz" ? "quiz" : "lesson") as CurriculumItem["type"],
      title: it?.title ?? it?.titleEn ?? "—",
      videoSource: it?.videoSource,
      videoUrl: it?.videoUrl,
    })),
  };
}

function mapMaterial(m: any): LmsMaterial {
  const doc = m?.document ?? m?.url ?? "";
  return {
    id: m?._id ?? m?.id ?? "",
    name: m?.title ?? m?.name ?? "—",
    category: /^https?:\/\//i.test(String(doc)) ? "Link" : "Document",
    size: m?.size ?? "—",
    uploadDate: fmtDate(m?.createdAt),
    targetGroup: m?.targetGroup ?? "All",
  };
}

export function mapLmsCourseDetail(raw: any): LmsCourseDetail {
  return {
    ...mapLmsCourse(raw),
    totalEnrolled: raw?.enrollment ?? raw?.students?.length ?? 0,
    modules: (raw?.modules ?? []).map(mapModule),
    assignedGroups: [],
    assignedGroupIds: (raw?.assignedGroups ?? []).map((g: any) => (typeof g === "string" ? g : g?._id ?? g?.id)).filter(Boolean),
    studentIds: (raw?.students ?? []).map((s: any) => (typeof s === "string" ? s : s?._id ?? s?.id)).filter(Boolean),
    materials: (raw?.materials ?? []).map(mapMaterial),
    rating: raw?.ratings?.avg ?? raw?.rating ?? 0,
    ratingCount: raw?.ratings?.count ?? 0,
    avgProgress: raw?.overallProgress ?? 0,
    quizPassRate: raw?.quizPassRate ?? 0,
  };
}
