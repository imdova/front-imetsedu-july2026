/**
 * Maps backend `/student-portal/*` responses to the bespoke student-portal UI
 * shapes. Pure + client-safe.
 */
import type {
  EnrolledCourse, Module, Lesson, ScheduleEvent, EventKind, Certificate,
  Notification, NotificationType, StudentAssignment, StudentAssignmentStatus,
  AssignmentSubmission, InstallmentLine, TranscriptRow, Grade,
} from "@/lib/db/student";

const FALLBACK_THUMB = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=240&fit=crop";

function fmtDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? (iso || "—") : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function rel(iso?: string): string {
  if (!iso) return "—";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";
  const m = Math.round((Date.now() - then) / 60000);
  if (m < 60) return `${Math.max(1, m)}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return d === 1 ? "yesterday" : `${d} days ago`;
}

/* ── Courses ── */
function mapLesson(it: any, mi: number, ii: number): Lesson {
  const type = it?.type === "quiz" ? "quiz" : it?.type === "pdf" ? "pdf" : it?.type === "text" ? "text" : "video";
  return {
    id: it?._id ?? it?.id ?? `l${ii}`,
    lessonSlug: `m${mi}-i${ii}`,
    title: it?.title ?? it?.titleEn ?? "Lesson",
    type,
    duration: it?.duration ?? "—",
    completed: !!it?.completed,
    videoId: it?.contentUrl ?? it?.videoId,
    contentType: it?.contentType,
    quizId: it?.quiz?._id ?? (it?.quizId ? String(it.quizId) : undefined),
  };
}
function mapModule(m: any, mi: number): Module {
  return {
    id: m?._id ?? m?.id ?? `m${mi}`,
    title: m?.title ?? m?.titleEn ?? "Module",
    lessons: (m?.items ?? m?.lessons ?? []).map((it: any, ii: number) => mapLesson(it, mi, ii)),
  };
}
export function mapEnrolledCourse(c: any): EnrolledCourse {
  const thumb = Array.isArray(c?.thumbnail) ? c.thumbnail[0] : c?.thumbnail ?? c?.image;
  const modules = (c?.modules ?? []).map(mapModule);
  return {
    id: c?._id ?? c?.id ?? "",
    slug: c?.slug ?? c?._id ?? c?.id ?? "",
    title: c?.title ?? c?.titleEn ?? "—",
    titleAr: c?.titleAr ?? c?.title ?? "—",
    instructor: c?.instructors?.[0]?.name ?? c?.instructor?.name ?? c?.instructorName ?? "—",
    thumbnailUrl: thumb || FALLBACK_THUMB,
    progress: c?.progress ?? 0,
    totalLessons: c?.totalLessons ?? modules.reduce((n: number, m: Module) => n + m.lessons.length, 0),
    completedLessons: c?.completedLessons ?? 0,
    modules,
    category: c?.category?.name ?? c?.category?.nameEn ?? (typeof c?.category === "string" ? c.category : undefined),
    subcategory: c?.subcategory?.name ?? c?.subcategory?.nameEn ?? (typeof c?.subcategory === "string" ? c.subcategory : undefined),
    isFavorite: !!c?.isFavorite,
    materials: (c?.materials ?? []).map((m: any, i: number) => ({
      id: m?._id ?? m?.id ?? `mat_${i}`,
      title: m?.title ?? "Material",
      url: m?.document ?? m?.url ?? "",
    })),
    assignedGroupIds: (c?.assignedGroups ?? []).map((g: any) => (typeof g === "string" ? g : (g?._id ?? g?.id))).filter(Boolean),
  };
}

/* ── Schedule ── */
function toEvent(s: any, kind: EventKind): ScheduleEvent {
  return {
    id: `${s?.groupId ?? s?._id ?? ""}-${s?.startTime ?? s?.dueDate ?? Math.random()}`,
    title: s?.title ?? s?.groupTitle ?? s?.courseTitle ?? (kind === "deadline" ? "Deadline" : "Live session"),
    kind,
    day: s?.lectureDay || s?.day || (s?.dueDate ? fmtDate(s.dueDate) : "—"),
    time: s?.startTime ? `${s.startTime}–${s.endTime ?? ""}` : (s?.time ?? "—"),
    courseCode: s?.groupTitle ?? s?.courseTitle ?? "",
    instructor: s?.instructor,
    joinUrl: s?.zoomLink ?? s?.joinUrl,
  };
}
export function mapSchedule(raw: any): ScheduleEvent[] {
  return [
    ...(raw?.scheduleEvents ?? []).map((s: any) => toEvent(s, "live-class")),
    ...(raw?.deadlineEvents ?? []).map((s: any) => toEvent(s, "deadline")),
    ...(raw?.quizEvents ?? []).map((s: any) => toEvent(s, "exam")),
  ];
}

/* ── Certificates ── */
export function mapCertificate(raw: any): Certificate {
  return {
    id: raw?._id ?? raw?.id ?? "",
    code: raw?.certificateCode ?? raw?.code ?? raw?.verificationCode ?? "—",
    course:
      raw?.courseTitle ?? raw?.course?.title ?? raw?.course?.titleEn ??
      raw?.lmsId?.title ?? raw?.groupId?.title ?? "—",
    issuedAt: String(raw?.issuedAt ?? raw?.createdAt ?? "").slice(0, 10) || "—",
    link: raw?.certificateLink ?? raw?.link ?? undefined,
    lmsId: typeof raw?.lmsId === "string" ? raw.lmsId : (raw?.lmsId?._id ?? raw?.lmsId?.id ?? undefined),
    groupId: typeof raw?.groupId === "string" ? raw.groupId : (raw?.groupId?._id ?? raw?.groupId?.id ?? undefined),
  };
}

/* ── Notifications ── */
function notifType(type?: string, entity?: string): NotificationType {
  const s = `${type ?? ""} ${entity ?? ""}`.toLowerCase();
  if (s.includes("grade")) return "grade";
  if (s.includes("deadline") || s.includes("due") || s.includes("assignment")) return "deadline";
  if (s.includes("cert")) return "cert";
  if (s.includes("payment") || s.includes("installment") || s.includes("invoice")) return "payment";
  if (s.includes("lesson") || s.includes("content") || s.includes("course") || s.includes("group")) return "content";
  return "announce";
}
export function mapStudentNotification(raw: any): Notification {
  return {
    id: raw?._id ?? raw?.id ?? "",
    type: notifType(raw?.type, raw?.entityType),
    title: raw?.title ?? "—",
    description: raw?.message ?? "",
    createdAt: rel(raw?.createdAt),
    read: !!raw?.isRead,
  };
}

/* ── Assignments ── */
function asgStatus(raw: any): StudentAssignmentStatus {
  const subStatus = String(raw?.submission?.status ?? "").toLowerCase();
  if (subStatus === "approved") return "graded";
  if (raw?.submission) return "submitted";
  const s = String(raw?.status ?? "").toLowerCase();
  if (s === "graded") return "graded";
  if (s === "submitted") return "submitted";
  return "pending";
}
export function mapStudentAssignment(raw: any): StudentAssignment {
  const sub = raw?.submission;
  const submission: AssignmentSubmission | undefined = sub
    ? {
        _id: sub?._id ?? undefined,
        status: sub?.status,
        score: sub?.score,
        letterGrade: sub?.letterGrade,
        feedback: sub?.feedback,
        assignmentFileUrl: sub?.assignmentFileUrl,
        notes: sub?.notes,
        createdAt: sub?.createdAt,
        updatedAt: sub?.updatedAt,
        submissionDate: sub?.submissionDate,
      }
    : undefined;
  return {
    id: raw?._id ?? raw?.id ?? "",
    title: raw?.title ?? raw?.titleEn ?? "—",
    course: raw?.courseTitle ?? raw?.course?.title ?? raw?.group?.title ?? "—",
    dueDate: fmtDate(raw?.dueDate),
    rawDueDate: raw?.dueDate ?? undefined,
    status: asgStatus(raw),
    grade: raw?.grade ?? raw?.score,
    maxGrade: raw?.maxGrade ?? 100,
    description: raw?.description ?? "",
    priority: raw?.priority === "urgent" ? "urgent" : "regular",
    files: Array.isArray(raw?.files) && raw.files.length > 0 ? raw.files : undefined,
    submission,
    groupTitle: raw?.group?.title ?? undefined,
  };
}

/* ── Installments / Transcript / Grades ── */
export function mapInstallment(raw: any, i: number): InstallmentLine {
  const s = String(raw?.status ?? "").toUpperCase();
  return {
    index: raw?.index ?? i + 1,
    amount: raw?.amount ?? 0,
    currency: "EGP",
    dueDate: raw?.paidDate ?? fmtDate(raw?.dueDate),
    status: s === "PAID" ? "PAID" : s === "DUE" ? "DUE" : "SCHEDULED",
  };
}
export function mapTranscriptRow(raw: any): TranscriptRow {
  const avg = raw?.avgQuizScore ?? raw?.progress ?? 0;
  return {
    course: raw?.courseTitle ?? raw?.course?.title ?? "—",
    credits: raw?.credits ?? 0,
    items: [{ item: "Average quiz score", score: avg, max: 100 }],
    average: avg,
  };
}
export function mapGradesFromTranscripts(rows: any[]): Grade[] {
  return (rows ?? []).map((tr) => ({
    id: tr?.courseId ?? tr?._id ?? "",
    course: tr?.courseTitle ?? "—",
    item: "Course average",
    type: "quiz" as const,
    score: tr?.avgQuizScore ?? 0,
    max: 100,
    status: tr?.isCompleted ? ("graded" as const) : ("pending" as const),
    date: "—",
  }));
}
