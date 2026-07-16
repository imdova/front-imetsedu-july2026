"use client";

import * as React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  Play, PlayCircle, HelpCircle, ChevronDown, Video, CalendarDays, Search, Download,
  Send, Award, FileText, UploadCloud, MessageSquare, Building2, CheckCircle2,
  LayoutGrid, List as ListIcon, Lock, Paperclip, Loader2, X,
} from "lucide-react";
import { toast } from "sonner";

import { useRouter } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import { ROUTES } from "@integration/constants";
import type { EnrolledCourse, ScheduleEvent, StudentAssignment, Certificate } from "@/lib/db/student";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useResetOnChange } from "@/hooks/use-reset-on-change";

type Tab = "overview" | "materials" | "assignments" | "certificate" | "feedback";

export function CourseDetailView({
  course, assignments, liveEvents, certificates = [],
}: {
  course: EnrolledCourse;
  assignments: StudentAssignment[];
  liveEvents: ScheduleEvent[];
  certificates?: Certificate[];
}) {
  const t = useTranslations("Student");
  const router = useRouter();
  const [tab, setTab] = React.useState<Tab>("overview");

  // Navigate to the full-page lesson player (lessons) or the quiz runner (quizzes).
  const allLessons = course.modules.flatMap((m) => m.lessons);
  const firstIncompleteSlug = (allLessons.find((l) => !l.completed) ?? allLessons[0])?.lessonSlug ?? "m0-i0";
  const play = (lessonSlug?: string) => {
    const slug = lessonSlug ?? firstIncompleteSlug;
    const lesson = allLessons.find((l) => l.lessonSlug === slug);
    if (lesson?.type === "quiz" && lesson.quizId) {
      router.push(ROUTES.STUDENT.COURSE_QUIZ(course.id, lesson.quizId) as never);
    } else {
      router.push(ROUTES.STUDENT.COURSE_LESSON(course.id, slug) as never);
    }
  };

  const totalLessons = course.totalLessons || course.modules.reduce((n, m) => n + m.lessons.length, 0);
  const openCount = assignments.filter((a) => a.status === "pending").length;

  const tabs: { key: Tab; label: string; badge?: number }[] = [
    { key: "overview", label: t("cdTabOverview") },
    { key: "materials", label: t("cdTabMaterials") },
    { key: "assignments", label: t("cdTabAssignments"), badge: openCount },
    { key: "certificate", label: t("cdTabCertificate") },
    { key: "feedback", label: t("cdTabFeedback") },
  ];

  return (
    <div className="space-y-5">
      {/* Header card */}
      <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative h-24 w-40 shrink-0 overflow-hidden rounded-xl bg-muted">
            <Image src={course.thumbnailUrl} alt={course.title} fill sizes="160px" className="object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            {course.category && <span className="inline-flex rounded-full bg-primary px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-primary-foreground">{course.category}</span>}
            <h1 className="mt-1.5 font-heading text-2xl font-bold tracking-tight">{course.title}</h1>
            <p className="mt-3 text-sm font-semibold text-muted-foreground">{t("cdOverallCompletion")}</p>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${course.progress}%` }} />
            </div>
            <p className="mt-1.5 text-sm"><span className="font-bold">{course.progress}%</span> <span className="text-muted-foreground">{t("cdLessonsCompleted", { done: course.completedLessons, total: totalLessons })}</span></p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="text-xs text-muted-foreground">{t("cdLastAccessed")}: —</span>
            <Button className="gap-2" disabled={allLessons.length === 0} onClick={() => play(firstIncompleteSlug)} ><Play className="size-4" />{t("cdContinueLearning")}</Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-border/70">
        {tabs.map((x) => (
          <button key={x.key} type="button" onClick={() => setTab(x.key)}
            className={cn("relative -mb-px flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
              tab === x.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>
            {x.label}
            {x.badge ? <span className="grid size-5 place-items-center rounded-full bg-destructive text-[0.7rem] font-bold text-white">{x.badge}</span> : null}
          </button>
        ))}
      </div>

      {tab === "overview" && <OverviewTab course={course} liveEvents={liveEvents} t={t} onPlay={play} />}
      {tab === "materials" && <MaterialsTab course={course} t={t} />}
      {tab === "assignments" && <AssignmentsTab assignments={assignments} t={t} />}
      {tab === "certificate" && <CertificateTab certificates={certificates} t={t} />}
      {tab === "feedback" && <FeedbackTab courseId={course.id} title={course.title} t={t} />}
    </div>
  );
}

type T = ReturnType<typeof useTranslations>;

/* ───────────── Overview ───────────── */
function OverviewTab({ course, liveEvents, t, onPlay }: { course: EnrolledCourse; liveEvents: ScheduleEvent[]; t: T; onPlay: (lessonSlug?: string) => void }) {
  const [open, setOpen] = React.useState<Set<number>>(() => new Set([0]));
  const toggle = (i: number) => setOpen((p) => { const n = new Set(p); n.has(i) ? n.delete(i) : n.add(i); return n; });
  const next = liveEvents[0];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
        <h2 className="font-heading text-xl font-bold">{t("cdCurriculum")}</h2>
        <p className="text-sm text-muted-foreground">{t("cdCurriculumSub")}</p>
        <div className="mt-4 space-y-3">
          {course.modules.map((m, i) => (
            <div key={m.id} className="overflow-hidden rounded-xl border border-border/70">
              <button type="button" onClick={() => toggle(i)}
                className={cn("flex w-full items-center gap-3 px-4 py-3.5 text-start font-semibold transition-colors",
                  open.has(i) ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted/40")}>
                <span className={cn("grid size-7 shrink-0 place-items-center rounded-lg text-sm", open.has(i) ? "bg-white/20" : "bg-muted")}>{i + 1}</span>
                <span className="flex-1">{t("cdModule", { n: i + 1, title: m.title })}</span>
                <ChevronDown className={cn("size-4 transition-transform", open.has(i) && "rotate-180")} />
              </button>
              {open.has(i) && (
                <div className="divide-y divide-border/60">
                  {m.lessons.map((l) => (
                    <button key={l.id} type="button" onClick={() => onPlay(l.lessonSlug)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-start transition-colors hover:bg-primary/5">
                      {l.type === "quiz"
                        ? <HelpCircle className="size-5 shrink-0 text-primary" />
                        : <PlayCircle className="size-5 shrink-0 text-muted-foreground" />}
                      <span className="flex-1 text-sm font-medium">{l.title}</span>
                      {l.completed && <CheckCircle2 className="size-4 shrink-0 text-success" />}
                      {l.type === "quiz"
                        ? <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[0.65rem] font-bold uppercase text-primary">{t("cdQuiz")}</span>
                        : <Play className="size-4 shrink-0 text-muted-foreground" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Live sessions */}
      <aside className="space-y-4">
        <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
          <h3 className="font-heading text-base font-bold">{t("cdLiveTitle")}</h3>
          <div className="mt-3 rounded-xl border border-border/60 p-3">
            <div className="flex items-center gap-2.5">
              <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary"><Video className="size-5" /></span>
              <div>
                <p className="text-sm font-semibold">{t("cdLiveLectures")}</p>
                {next && <p className="text-xs text-muted-foreground">{t("cdNextLive", { when: `${next.day} · ${next.time}` })}</p>}
              </div>
            </div>
            {next?.joinUrl
              ? <Button className="mt-3 w-full gap-2" size="sm" onClick={() => window.open(next.joinUrl, "_blank")}><Video className="size-4" />{t("cdJoinZoom")}</Button>
              : <p className="mt-3 text-xs text-muted-foreground">{t("cdNoZoom")}</p>}
          </div>
          <div className="mt-4 flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-sm font-semibold"><CalendarDays className="size-4 text-primary" />{t("cdLectureSchedule")}</p>
            <span className="text-xs font-medium text-primary">{t("cdFullSchedule")}</span>
          </div>
          <div className="mt-2 space-y-2">
            {liveEvents.length === 0 ? (
              <p className="text-xs text-muted-foreground">—</p>
            ) : liveEvents.slice(0, 5).map((e) => (
              <div key={e.id} className="rounded-lg border border-success/30 bg-success/5 p-3">
                <p className="flex items-center gap-1.5 text-sm font-medium"><span className="size-1.5 rounded-full bg-success" />{e.courseCode || e.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{e.day} · {e.time}</p>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

/* ───────────── Materials ───────────── */
function MaterialsTab({ course, t }: { course: EnrolledCourse; t: T }) {
  const [q, setQ] = React.useState("");
  const materials = (course.materials ?? []).filter((m) => m.title.toLowerCase().includes(q.trim().toLowerCase()));

  return (
    <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm">
      <h2 className="font-heading text-2xl font-bold">{t("cdMaterialsTitle")}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{t("cdMaterialsSub")}</p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[240px] flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("cdSearchMaterials")} className="ps-9" />
        </div>
        <Button className="gap-2" disabled={materials.length === 0} onClick={() => materials.forEach((m) => m.url && window.open(m.url, "_blank"))}>
          <Download className="size-4" />{t("cdDownloadAll")}
        </Button>
      </div>
      <div className="mt-5">
        {materials.length === 0 ? (
          <div className="grid place-items-center rounded-xl border border-dashed border-border/70 py-16 text-center">
            <FileText className="size-10 text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">{t("cdNoMaterials")}</p>
          </div>
        ) : (
          <MaterialsGroup count={materials.length} t={t}>
            {materials.map((m) => (
              <div key={m.id} className="flex items-center justify-between gap-3 px-4 py-3.5">
                <span className="inline-flex min-w-0 items-center gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-destructive/10 text-destructive"><FileText className="size-4" /></span>
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{m.title}</span>
                    <span className="text-xs text-muted-foreground">{t("cdDownload")} · —</span>
                  </span>
                </span>
                <Button variant="ghost" size="icon-sm" disabled={!m.url} onClick={() => window.open(m.url, "_blank")} aria-label={t("cdDownload")}><Download className="size-4" /></Button>
              </div>
            ))}
          </MaterialsGroup>
        )}
      </div>
    </div>
  );
}

function MaterialsGroup({ count, t, children }: { count: number; t: T; children: React.ReactNode }) {
  const [open, setOpen] = React.useState(true);
  return (
    <div className="overflow-hidden rounded-xl border border-border/70">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-3 bg-muted/30 px-4 py-3.5 text-start hover:bg-muted/50">
        <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-muted text-sm font-semibold">1</span>
        <span className="flex-1">
          <span className="block font-semibold">{t("cdMaterialsGroup")}</span>
          <span className="text-xs text-muted-foreground">{t("cdMaterialsFileCount", { n: count })} · —</span>
        </span>
        <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      {open && <div className="divide-y divide-border/60">{children}</div>}
    </div>
  );
}

/* ───────────── Assignments ───────────── */
function isClosed(a: StudentAssignment): boolean {
  return a.status === "pending" && !!a.rawDueDate && new Date(a.rawDueDate).getTime() < Date.now();
}

function AssignmentsTab({ assignments, t }: { assignments: StudentAssignment[]; t: T }) {
  const [active, setActive] = React.useState<StudentAssignment | null>(null);
  const [view, setView] = React.useState<"list" | "grid">("list");
  const inProgress = assignments.filter((a) => a.status === "pending" && !isClosed(a)).length;
  const submitted = assignments.filter((a) => a.status === "submitted").length;
  const graded = assignments.filter((a) => a.status === "graded").length;

  const subline = (a: StudentAssignment) =>
    `${a.priority === "urgent" ? t("cdUrgent") : t("cdRegular")} · ${t("cdAttachments", { n: a.files?.length ?? 0 })}`;

  const statusBadge = (a: StudentAssignment) => {
    const closed = isClosed(a);
    const map = {
      pending: ["bg-muted text-muted-foreground", t("cdNotStarted")],
      submitted: ["bg-primary/10 text-primary", t("cdSubmittedKpi")],
      graded: ["bg-success/10 text-success", t("cdGraded")],
      closed: ["bg-destructive/10 text-destructive", t("cdClosed")],
    } as const;
    const [cls, label] = closed ? map.closed : map[a.status];
    return <span className={cn("inline-block rounded-md px-2 py-0.5 text-xs font-semibold uppercase", cls)}>{label}</span>;
  };

  const briefButton = (a: StudentAssignment, full?: boolean) =>
    !!a.files?.length && (
      <Button size="sm" variant="ghost" className={cn("gap-1.5", full && "w-full")} title={t("cdSubAssignmentFiles")} onClick={() => window.open(a.files![0], "_blank")}>
        <Paperclip className="size-3.5" />{t("cdDownloadBrief")}
      </Button>
    );

  const action = (a: StudentAssignment, full?: boolean) => {
    if (isClosed(a)) return <Button size="sm" variant="secondary" disabled className={cn("gap-1.5", full && "w-full")}><Lock className="size-3.5" />{t("cdClosed")}</Button>;
    if (a.status === "pending") return <Button size="sm" onClick={() => setActive(a)} className={cn(full && "w-full")}>{t("cdSubmit")}</Button>;
    return <Button size="sm" variant="outline" disabled={!a.submission?.assignmentFileUrl} className={cn("gap-1.5", full && "w-full")} onClick={() => a.submission?.assignmentFileUrl && window.open(a.submission.assignmentFileUrl, "_blank")}><Download className="size-3.5" />{t("cdDownload")}</Button>;
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        {[[t("cdInProgress"), inProgress], [t("cdSubmittedKpi"), submitted], [t("cdGraded"), graded]].map(([label, n]) => (
          <div key={label as string} className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label as string}</p>
            <p className="mt-2 text-3xl font-bold tabular-nums">{n as number}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
        <div className="flex items-center justify-between p-5">
          <h3 className="font-heading text-lg font-bold">{t("cdCourseAssignments")}</h3>
          <div className="flex items-center rounded-lg border p-0.5">
            <button type="button" onClick={() => setView("grid")} aria-label="Grid view" className={cn("grid size-8 place-items-center rounded-md", view === "grid" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground")}><LayoutGrid className="size-4" /></button>
            <button type="button" onClick={() => setView("list")} aria-label="List view" className={cn("grid size-8 place-items-center rounded-md", view === "list" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground")}><ListIcon className="size-4" /></button>
          </div>
        </div>

        {assignments.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">{t("cdNoAssignments")}</p>
        ) : view === "list" ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y bg-muted/20 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3 text-start">{t("cdColTitle")}</th>
                <th className="px-3 py-3 text-start">{t("cdColDeadline")}</th>
                <th className="px-3 py-3 text-start">{t("cdColStatus")}</th>
                <th className="px-3 py-3 text-start">{t("cdColGrade")}</th>
                <th className="px-5 py-3 text-end">{t("cdColAction")}</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((a, i) => (
                <tr key={a.id} className="border-b last:border-0">
                  <td className="px-5 py-3"><p className="font-medium">{i + 1}. {a.title}</p><p className="text-xs text-muted-foreground">{subline(a)}</p></td>
                  <td className="px-3 py-3 text-muted-foreground">{a.dueDate}</td>
                  <td className="px-3 py-3">{statusBadge(a)}</td>
                  <td className="px-3 py-3 text-muted-foreground tabular-nums">{a.grade != null ? `${a.grade}/${a.maxGrade}` : "--"}</td>
                  <td className="px-5 py-3"><div className="flex justify-end gap-1">{briefButton(a)}{action(a)}</div></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="grid gap-4 border-t border-border/60 p-5 sm:grid-cols-2">
            {assignments.map((a, i) => (
              <div key={a.id} className="flex flex-col rounded-xl border border-border/70 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[0.7rem] font-bold uppercase tracking-wide text-muted-foreground">{a.priority === "urgent" ? t("cdUrgent") : t("cdRegular")}</span>
                  {statusBadge(a)}
                </div>
                <p className="mt-2 font-semibold">{i + 1}. {a.title}</p>
                <p className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-muted-foreground"><Paperclip className="size-3.5" />{t("cdAttachments", { n: a.files?.length ?? 0 })}</p>
                <p className="mt-2 text-xs text-muted-foreground">{t("cdColDeadline")}: {a.dueDate}</p>
                <p className="text-xs text-muted-foreground">{t("cdColGrade")}: {a.grade != null ? `${a.grade}/${a.maxGrade}` : "--"}</p>
                <div className="mt-3 flex flex-col gap-2">{briefButton(a, true)}{action(a, true)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <SubmitModal assignment={active} onClose={() => setActive(null)} t={t} />
    </div>
  );
}

function fileNameFromUrl(url: string): string {
  try {
    return decodeURIComponent(url.split("/").pop() || url);
  } catch {
    return url;
  }
}

function SubmitModal({ assignment, onClose, t }: { assignment: StudentAssignment | null; onClose: () => void; t: T }) {
  const [url, setUrl] = React.useState("");
  const [fileName, setFileName] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [confirm, setConfirm] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  useResetOnChange([assignment], () => { if (assignment) { setUrl(""); setFileName(""); setNotes(""); setConfirm(false); } });
  if (!assignment) return null;

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    const res = await dal.student.uploadStudentFile(file);
    setUploading(false);
    if (res.ok) { setUrl(res.data); setFileName(file.name); }
    else toast.error(res.error || t("cdSubUploadFailed"));
  };

  const submit = async () => {
    if (!url.trim()) { toast.error(t("cdSubNeedFile")); return; }
    if (!confirm) { toast.error(t("cdSubNeedConfirm")); return; }
    setBusy(true);
    const res = await dal.student.submitAssignment(assignment.id, { assignmentFileUrl: url, notes });
    setBusy(false);
    if (res.ok) { toast.success(t("cdSubSubmitted")); onClose(); }
    else toast.error(res.error || t("cdSubSubmitted"));
  };

  return (
    <Dialog open={!!assignment} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <h3 className="font-heading text-xl font-bold">{t("cdSubTitle")}</h3>
        <div className="space-y-4">
          {!!assignment.files?.length && (
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">{t("cdSubAssignmentFiles")}</Label>
              <ul className="space-y-1.5">
                {assignment.files.map((f, i) => (
                  <li key={f}>
                    <a
                      href={f}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 rounded-lg border bg-muted/20 px-3 py-2 text-sm hover:bg-muted/40"
                    >
                      <FileText className="size-4 shrink-0 text-primary" />
                      <span className="min-w-0 flex-1 truncate">{fileNameFromUrl(f) || `${t("cdDownload")} ${i + 1}`}</span>
                      <Download className="size-3.5 shrink-0 text-muted-foreground" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <input ref={fileInputRef} type="file" className="hidden" onChange={onFileChange} />
          {fileName ? (
            <div className="flex items-center gap-2 rounded-2xl border border-success/40 bg-success/[0.05] px-4 py-3">
              <CheckCircle2 className="size-5 shrink-0 text-success" />
              <span className="min-w-0 flex-1 truncate text-sm font-medium">{fileName}</span>
              <Button type="button" variant="ghost" size="icon" className="size-7 shrink-0" onClick={() => { setUrl(""); setFileName(""); }}>
                <X className="size-4" />
              </Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="grid w-full place-items-center gap-1.5 rounded-2xl border-2 border-dashed border-border/70 bg-muted/20 py-8 text-center transition-colors hover:bg-muted/30 disabled:opacity-60"
            >
              {uploading ? <Loader2 className="size-8 animate-spin text-primary" /> : <UploadCloud className="size-8 text-primary" />}
              <p className="text-sm">{uploading ? t("cdSubUploading") : t("cdSubDrop")}</p>
              <p className="text-xs text-muted-foreground">{t("cdSubBrowse")} {t("cdSubFrom")}</p>
            </button>
          )}

          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-sm font-medium"><MessageSquare className="size-4" />{t("cdSubNote")}</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t("cdSubNotePh")} className="min-h-24" />
          </div>
          <label className="flex cursor-pointer items-start gap-2 text-sm text-muted-foreground">
            <Checkbox checked={confirm} onCheckedChange={(c) => setConfirm(!!c)} className="mt-0.5" />
            <span>{t("cdSubConfirm")}</span>
          </label>
        </div>
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>{t("cdSubCancel")}</Button>
          <Button className="gap-2" disabled={busy || uploading || !url} onClick={submit}><Send className="size-4" />{t("cdSubSubmit")}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ───────────── Certificate ───────────── */
function CertificateTab({ certificates, t }: { certificates: Certificate[]; t: T }) {
  if (certificates.length === 0) {
    return (
      <div className="grid place-items-center rounded-2xl border border-dashed border-border/70 bg-card py-20 text-center">
        <Award className="size-12 text-muted-foreground/40" />
        <p className="mt-3 font-semibold">{t("cdCertTitle")}</p>
        <p className="mt-1 text-sm text-muted-foreground">{t("cdCertEmpty")}</p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {certificates.map((c) => (
        <div key={c.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-success/30 bg-success/[0.04] p-5 shadow-sm">
          <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-success/15 text-success"><Award className="size-6" /></span>
          <div className="min-w-0 flex-1">
            <p className="font-heading text-lg font-bold">{t("cdCertIssued")}</p>
            <p className="text-sm text-muted-foreground tabular-nums">{c.code} · {c.issuedAt}</p>
          </div>
          {c.link ? (
            <Button asChild className="gap-1.5">
              <a href={c.link} target="_blank" rel="noreferrer" download><Download className="size-4" />{t("cdCertDownload")}</a>
            </Button>
          ) : (
            <span className="text-xs text-muted-foreground">{t("cdCertProcessing")}</span>
          )}
        </div>
      ))}
    </div>
  );
}

/* ───────────── Feedback ───────────── */
const DIMENSIONS = [
  { key: "overall", label: "cdFbOverall", sub: "cdFbOverallSub" },
  { key: "support", label: "cdFbSupport", sub: "cdFbSupportSub" },
  { key: "platform", label: "cdFbPlatform", sub: "cdFbPlatformSub" },
  { key: "materials", label: "cdFbMaterials", sub: "cdFbMaterialsSub" },
  { key: "communication", label: "cdFbCommunication", sub: "cdFbCommunicationSub" },
] as const;

function FeedbackTab({ courseId, title, t }: { courseId: string; title: string; t: T }) {
  const [scores, setScores] = React.useState<Record<string, number>>({});
  const [comment, setComment] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const ratedCount = DIMENSIONS.filter((d) => scores[d.key]).length;

  const submit = async () => {
    if (!scores.overall) { toast.error(t("cdFbNeedAll")); return; }
    setBusy(true);
    const res = await dal.student.submitCourseRating(courseId, {
      overall: scores.overall,
      support: scores.support, platform: scores.platform, materials: scores.materials, communication: scores.communication,
    }, comment || undefined);
    setBusy(false);
    if (res.ok) toast.success(t("cdFbSubmitted"));
    else toast.error(res.error || t("cdFbSubmitted"));
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border/70 bg-card p-4 text-sm text-muted-foreground shadow-sm">{t("cdFbNoInstructors")}</div>
      <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
        <div>
          <h2 className="font-heading text-xl font-bold">{t("cdFbCourseFeedback")}</h2>
          <p className="text-sm text-muted-foreground">{title}</p>
        </div>
        <div className="text-end">
          <p className="text-2xl font-bold text-primary">{Math.round((ratedCount / DIMENSIONS.length) * 100)}%</p>
          <p className="text-xs text-muted-foreground">{t("cdFbRated", { n: ratedCount, total: DIMENSIONS.length })}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
        <div className="flex items-center gap-2.5 border-b border-border/60 pb-4">
          <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary"><Building2 className="size-5" /></span>
          <p className="font-semibold">{t("cdFbAcademy")}</p>
        </div>
        <div className="mt-4 space-y-6">
          {DIMENSIONS.map((d) => (
            <div key={d.key}>
              <div className="flex items-start justify-between gap-3">
                <div><p className="font-semibold">{t(d.label)}</p><p className="text-sm text-muted-foreground">{t(d.sub)}</p></div>
                <span className="text-xs text-muted-foreground">{scores[d.key] ? `${scores[d.key]} / 5` : t("cdFbNotRated")}</span>
              </div>
              <div className="mt-2 grid max-w-md grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" onClick={() => setScores((p) => ({ ...p, [d.key]: n }))}
                    className={cn("rounded-lg border py-2 text-sm font-semibold transition-colors",
                      scores[d.key] === n ? "border-primary bg-primary text-primary-foreground" : "border-border bg-muted/30 hover:bg-muted")}>
                    {n}
                  </button>
                ))}
              </div>
              <div className="mt-1 flex max-w-md justify-between text-[0.7rem] text-muted-foreground"><span>1 · {t("cdFbPoor")}</span><span>3 · {t("cdFbNeutral")}</span><span>5 · {t("cdFbExcellent")}</span></div>
            </div>
          ))}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">{t("cdFbComments")}</Label>
            <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder={t("cdFbCommentsPh")} className="min-h-24" />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button className="gap-2" disabled={busy} onClick={submit}><Send className="size-4" />{t("cdFbSubmit")}</Button>
      </div>
    </div>
  );
}
