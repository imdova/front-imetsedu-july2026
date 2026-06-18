/**
 * Maps backend LMS documents (`/lms-courses`, `/lms-categories`,
 * `/lms-sub-categories`) to the UI LMS shapes. Pure + client-safe.
 */
import type {
  LmsCourse, LmsStats, LmsCourseDetail, LmsCategory, LmsSubcategory,
  CurriculumModule, CurriculumItem, LmsMaterial, VideoSource,
} from "@/lib/db/lms";

function fmtDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? (iso || "—") : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function fmtDateTime(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? (iso || "—") : d.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

function initialsOf(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("") || "ST";
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
  files: string[];
}
export function mapLmsAssignment(raw: any): LmsAssignmentRow {
  const p = String(raw?.priority ?? "regular");
  const files = Array.isArray(raw?.files) ? raw.files : [];
  return {
    id: raw?._id ?? raw?.id ?? "",
    title: raw?.title ?? raw?.titleEn ?? "—",
    priority: p.charAt(0).toUpperCase() + p.slice(1),
    dueDate: fmtDate(raw?.dueDate),
    createdDate: fmtDate(raw?.createdAt),
    attachments: files.length,
    files,
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
    items: (m?.items ?? m?.lessons ?? []).map((it: any): CurriculumItem => {
      const type = (it?.type === "quiz" ? "quiz" : "lesson") as CurriculumItem["type"];
      let videoSource: VideoSource | undefined = undefined;
      if (it?.contentType === "youtube_url") videoSource = "youtube";
      else if (it?.contentType === "vdocipher_embed") videoSource = "vdocipher";
      if (!videoSource && it?.videoSource) videoSource = it.videoSource;

      return {
        id: it?._id ?? it?.id,
        type,
        title: it?.title ?? it?.titleEn ?? "—",
        videoSource,
        videoUrl: it?.contentUrl ?? it?.videoUrl,
        quiz: it?.quiz,
      };
    }),
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

/* ── Assignment detail (grading workspace) ── */
export type AssignmentSubRowStatus = "graded" | "submitted" | "late" | "overdue" | "not_submitted";

export interface AssignmentSubmissionRow {
  /** Row key — the submission id when one exists, else a synthetic key. */
  id: string;
  /** The actual submission _id, needed to call the grade-update endpoint. Null until the student submits. */
  submissionId: string | null;
  studentId: string;
  studentName: string;
  studentEmail: string;
  initials: string;
  submittedAt: string | null;
  rawSubmittedAt?: string;
  status: AssignmentSubRowStatus;
  score: number | null;
  plagiarismScore: number | null;
  fileUrl: string | null;
  notes: string;
}

export interface AssignmentDetailVM {
  id: string;
  title: string;
  courseName: string;
  /** Owning LMS course id, when this assignment was scoped to an LMS course. */
  lmsId?: string;
  /** Owning group id, when this assignment was scoped to a group. */
  groupId?: string;
  dueDate: string;
  rawDueDate?: string;
  files: string[];
  priority: string;
  kpis: {
    totalSubmissions: number;
    totalStudents: number;
    avgGrade: number | null;
    avgTurnaroundHours: number | null;
    avgPlagiarismScore: number | null;
  };
  submissions: AssignmentSubmissionRow[];
}

export function mapAssignmentDetail(raw: any): AssignmentDetailVM {
  const courseName = raw?.lmsId?.title ?? raw?.group?.title ?? "—";
  const dueDate: string | undefined = raw?.dueDate;
  const students: any[] = Array.isArray(raw?.students) ? raw.students : [];

  const submissions: AssignmentSubmissionRow[] = students.map((item, i) => {
    const stud = item?.student ?? {};
    const sub = item?.submission;
    const name = stud?.name ?? "Unknown student";

    let status: AssignmentSubRowStatus;
    if (!sub) {
      status = dueDate && Date.now() > new Date(dueDate).getTime() ? "overdue" : "not_submitted";
    } else if (sub.status === "approved" || sub.status === "graded") {
      status = "graded";
    } else if (dueDate && sub.submissionDate && new Date(sub.submissionDate).getTime() > new Date(dueDate).getTime()) {
      status = "late";
    } else {
      status = "submitted";
    }

    return {
      id: sub?._id ?? `row_${stud?._id ?? i}`,
      submissionId: sub?._id ?? null,
      studentId: stud?._id ?? `stu_${i}`,
      studentName: name,
      studentEmail: stud?.email ?? "",
      initials: initialsOf(name),
      submittedAt: sub?.submissionDate ? fmtDateTime(sub.submissionDate) : null,
      rawSubmittedAt: sub?.submissionDate,
      status,
      score: sub?.score ?? null,
      plagiarismScore: sub?.plagiarismScore ?? null,
      fileUrl: sub?.assignmentFileUrl ?? null,
      notes: sub?.notes ?? "",
    };
  });

  const k = raw?.kpis ?? {};
  return {
    id: raw?._id ?? raw?.id ?? "",
    title: raw?.title ?? "—",
    courseName,
    lmsId: raw?.lmsId?._id ?? (typeof raw?.lmsId === "string" ? raw.lmsId : undefined),
    groupId: raw?.group?._id ?? (typeof raw?.group === "string" ? raw.group : undefined),
    dueDate: fmtDate(dueDate),
    rawDueDate: dueDate,
    files: Array.isArray(raw?.files) ? raw.files : [],
    priority: String(raw?.priority ?? "regular"),
    kpis: {
      totalSubmissions: k.totalSubmissions ?? submissions.filter((s) => s.status !== "not_submitted" && s.status !== "overdue").length,
      totalStudents: k.totalStudents ?? submissions.length,
      avgGrade: k.avgGrade ?? null,
      avgTurnaroundHours: k.avgTurnaroundHours ?? null,
      avgPlagiarismScore: k.avgPlagiarismScore ?? null,
    },
    submissions,
  };
}
