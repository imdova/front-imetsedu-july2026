"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft, ChevronRight, Menu as MenuIcon, X as CloseIcon,
  Loader2, Check, FileQuestion, Lock, StickyNote,
} from "lucide-react";

import { Link, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { dal } from "@/lib/dal";
import { ROUTES } from "@integration/constants";
import { useResetOnChange } from "@/hooks/use-reset-on-change";
import {
  getStudentCourseRaw,
  buildLessonPageData,
} from "@integration/services/student-courses";
import type {
  LessonPageData,
  SidebarModule,
  SidebarLesson,
  CurriculumNavLink,
} from "@integration/services/student-courses/view-models";
import {
  markLessonWatched,
  getWatchedLessons,
  calculateProgress,
  saveProgressPct,
} from "@/lib/utils/lesson-progress";
import { getLessonNotes, saveLessonNotes, type LessonNote } from "@/lib/utils/lesson-notes";

/* ─── helpers ────────────────────────────────────────────────────────────── */

function navHref(courseId: string, nav: CurriculumNavLink): string {
  if (nav.kind === "quiz" && nav.quizId) {
    return ROUTES.STUDENT.COURSE_QUIZ(courseId, nav.quizId);
  }
  return ROUTES.STUDENT.COURSE_LESSON(courseId, nav.slug);
}

function lessonHref(courseId: string, item: SidebarLesson): string {
  if (item.kind === "quiz" && item.quizId) {
    return ROUTES.STUDENT.COURSE_QUIZ(courseId, item.quizId);
  }
  return ROUTES.STUDENT.COURSE_LESSON(courseId, item.slug);
}

/* ─── Lesson video player ─────────────────────────────────────────────────── */

function youtubeEmbedUrl(raw: string | undefined): string | null {
  if (!raw?.trim()) return null;
  const value = raw.trim();
  try {
    if (value.includes("youtube.com/watch") || value.includes("youtube.com/embed")) {
      const url = value.startsWith("http") ? value : `https://${value}`;
      const id = new URL(url).searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}?rel=0` : null;
    }
    if (value.includes("youtu.be/")) {
      const id = value.split("youtu.be/")[1]?.split(/[?&]/)[0];
      return id ? `https://www.youtube.com/embed/${id}?rel=0` : null;
    }
  } catch {
    return null;
  }
  if (/^[a-zA-Z0-9_-]{6,}$/.test(value)) {
    return `https://www.youtube.com/embed/${value}?rel=0`;
  }
  return null;
}

function VdoCipherPlayer({ videoId, title }: { videoId: string; title: string }) {
  const [creds, setCreds] = React.useState<{ otp: string; playbackInfo: string } | null>(null);
  const [err, setErr] = React.useState<string | null>(null);

  // Clearing the previous video's credentials is a reset — do it in render so a
  // new videoId never paints against the old OTP.
  useResetOnChange([videoId], () => {
    setCreds(null);
    setErr(null);
  });

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/vdocipher/otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ videoId }),
        });
        if (cancelled) return;
        if (!res.ok) { setErr("Failed to load video"); return; }
        const data = await res.json() as { otp?: string; playbackInfo?: string };
        if (!data.otp || !data.playbackInfo) { setErr("Invalid video credentials"); return; }
        setCreds({ otp: data.otp, playbackInfo: data.playbackInfo });
      } catch {
        if (!cancelled) setErr("Failed to load video");
      }
    })();
    return () => { cancelled = true; };
  }, [videoId]);

  if (err) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-6 text-center text-white/80">
        <p className="text-sm">{err}</p>
      </div>
    );
  }
  if (!creds) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="size-8 animate-spin text-white/60" />
      </div>
    );
  }

  const src = `https://player.vdocipher.com/v2/?otp=${encodeURIComponent(creds.otp)}&playbackInfo=${encodeURIComponent(creds.playbackInfo)}`;
  return (
    <iframe
      title={title}
      src={src}
      className="h-full w-full border-0"
      allow="encrypted-media"
      allowFullScreen
    />
  );
}

function LessonVideo({ contentType, contentUrl, title }: { contentType?: string; contentUrl?: string; title: string }) {
  const t = useTranslations("Student");
  if (contentType === "youtube_url") {
    const embed = youtubeEmbedUrl(contentUrl);
    if (embed) {
      return (
        <iframe
          title={title}
          src={embed}
          className="h-full w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    }
  }

  if (contentType === "vdocipher_embed" && contentUrl?.trim()) {
    return <VdoCipherPlayer videoId={contentUrl.trim()} title={title} />;
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-6 text-center text-white/50">
      <p className="text-sm">{t("lpUnavailable")}</p>
      {contentUrl?.trim() && <p className="max-w-md text-xs break-all opacity-70">{contentUrl}</p>}
    </div>
  );
}

/* ─── Curriculum sidebar item ─────────────────────────────────────────────── */

function CurriculumItem({
  item, courseId, activeSlug, isWatched,
}: {
  item: SidebarLesson;
  courseId: string;
  activeSlug: string;
  isWatched: boolean;
}) {
  const t = useTranslations("Student");
  const isQuiz = item.kind === "quiz";
  const isActive = item.slug === activeSlug;
  const isDone = !isQuiz && (isWatched || item.status === "completed");

  return (
    <Link
      href={lessonHref(courseId, item)}
      className={cn(
        "flex items-center gap-3 border-s-2 px-5 py-3 ps-7 text-sm no-underline transition-colors hover:bg-muted/50",
        isActive
          ? "border-s-primary bg-primary/5 text-primary"
          : isDone
            ? "border-s-emerald-400 bg-emerald-50/40 text-muted-foreground dark:bg-emerald-950/20"
            : isQuiz
              ? "border-s-transparent text-primary"
              : "border-s-transparent text-muted-foreground",
      )}
    >
      {isQuiz ? (
        <FileQuestion className="size-4 shrink-0 text-primary" />
      ) : isDone ? (
        <Check className="size-4 shrink-0 text-emerald-600" strokeWidth={2.5} />
      ) : item.status === "locked" ? (
        <Lock className="size-4 shrink-0 text-muted-foreground/40" />
      ) : (
        <ChevronRight className="size-4 shrink-0 text-primary rtl:rotate-180" />
      )}
      <div className="flex-1 min-w-0">
        <p className={cn("font-medium truncate", isActive && "text-primary")}>
          {item.title}
        </p>
        {isQuiz && <p className="text-[10px] font-bold uppercase tracking-wider text-primary">{t("cdQuiz")}</p>}
        {isDone && !isActive && <p className="text-[10px] font-semibold text-emerald-600">{t("lpWatched")}</p>}
      </div>
      <span className="shrink-0 text-xs text-muted-foreground">{item.duration}</span>
    </Link>
  );
}

/* ─── Lesson notes (localStorage, per device) ─────────────────────────────── */

function LessonNotes({ courseId, slug, t }: { courseId: string; slug: string; t: ReturnType<typeof useTranslations> }) {
  // Lazy init reads this lesson's notes once; the parent passes key={slug} so a
  // lesson change remounts (re-reads) instead of a setState-in-effect.
  const [notes, setNotes] = React.useState<LessonNote[]>(() => getLessonNotes(courseId, slug));
  const [draft, setDraft] = React.useState("");

  const add = () => {
    const text = draft.trim();
    if (!text) return;
    const next = [...notes, { id: `n_${Date.now().toString(36)}`, text, at: Date.now() }];
    setNotes(next);
    saveLessonNotes(courseId, slug, next);
    setDraft("");
  };
  const remove = (id: string) => {
    const next = notes.filter((n) => n.id !== id);
    setNotes(next);
    saveLessonNotes(courseId, slug, next);
  };

  return (
    <div className="rounded-2xl border border-border/70 bg-card p-5">
      <p className="flex items-center gap-2 font-semibold"><StickyNote className="size-4 text-primary" />{t("lpMyNotes")}</p>
      {notes.length > 0 && (
        <ul className="mt-3 space-y-2">
          {notes.map((n) => (
            <li key={n.id} className="group flex items-start gap-2 rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-sm">
              <span className="min-w-0 flex-1">
                <span className="block whitespace-pre-wrap break-words">{n.text}</span>
                <span className="mt-0.5 block text-[0.7rem] text-muted-foreground">{new Date(n.at).toLocaleString()}</span>
              </span>
              <button
                type="button"
                onClick={() => remove(n.id)}
                aria-label={t("lpDeleteNote")}
                className="shrink-0 text-muted-foreground opacity-0 transition hover:text-destructive group-hover:opacity-100"
              >
                <CloseIcon className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-3 flex items-start gap-2">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={2}
          placeholder={t("lpNotePlaceholder")}
          className="min-h-[44px] flex-1 resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <button
          type="button"
          onClick={add}
          disabled={!draft.trim()}
          className="shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          {t("lpAddNote")}
        </button>
      </div>
      <p className="mt-2 text-[0.7rem] text-muted-foreground">{t("lpNotesLocal")}</p>
    </div>
  );
}

/* ─── Main lesson page ────────────────────────────────────────────────────── */

export default function StudentLessonPage() {
  const params = useParams();
  const t = useTranslations("Student");
  const router = useRouter();
  const courseId = typeof params.id === "string" ? params.id : "";
  const lessonSlug = typeof params.lessonId === "string" ? params.lessonId : "";

  const [data, setData] = React.useState<LessonPageData | null>(null);
  const [modules, setModules] = React.useState<SidebarModule[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [tocOpen, setTocOpen] = React.useState(false);
  const [watchedSlugs, setWatchedSlugs] = React.useState<Set<string>>(new Set());
  const [localPct, setLocalPct] = React.useState<number | null>(null);
  const [localDone, setLocalDone] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (!courseId || !lessonSlug) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      const res = await getStudentCourseRaw(courseId);
      if (cancelled) return;

      if (!res.ok) {
        setError(typeof res.error === "string" ? res.error : "Failed to load lesson");
        setLoading(false);
        return;
      }

      const raw = res.data;
      const lessonData = buildLessonPageData(raw, courseId, lessonSlug);
      if (!lessonData) {
        setError("Lesson not found");
        setLoading(false);
        return;
      }

      setData(lessonData);
      setModules(lessonData.modules);
      setError(null);

      // Progress tracking
      markLessonWatched(courseId, lessonSlug);
      const watched = getWatchedLessons(courseId);
      const pct = calculateProgress(watched.size, lessonData.lessonsTotal);
      setWatchedSlugs(new Set(watched));
      setLocalPct(pct);
      setLocalDone(watched.size);
      saveProgressPct(courseId, pct);
      void dal.student.updateCourseProgress(courseId, pct);

      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [courseId, lessonSlug]);

  const toggleModule = (id: string) =>
    setModules((prev) => prev.map((m) => m.id === id ? { ...m, expanded: !m.expanded } : m));

  // Mark the current lesson complete, then advance to the next item (or finish → overview).
  const completeAndContinue = React.useCallback(() => {
    if (!data) return;
    markLessonWatched(courseId, lessonSlug);
    router.push((data.nextNav ? navHref(courseId, data.nextNav) : ROUTES.STUDENT.COURSE_OVERVIEW(courseId)) as never);
  }, [data, courseId, lessonSlug, router]);

  if (!courseId || !lessonSlug) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-background">
        <p className="text-muted-foreground">Invalid lesson link.</p>
        <Link href={ROUTES.STUDENT.COURSES} className="text-primary hover:underline">Back to My Courses</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data || error) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-background">
        <p className="text-muted-foreground">{error ?? "Lesson not found."}</p>
        <Link href={ROUTES.STUDENT.COURSES} className="text-primary hover:underline">Back to My Courses</Link>
      </div>
    );
  }

  const sidebarModules = modules.length ? modules : data.modules;
  const displayPct = localPct ?? data.progressPct;
  const displayDone = localDone ?? data.lessonsCompleted;
  const displayTotal = data.lessonsTotal;

  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      {/* Top bar */}
      <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border/70 bg-background/90 px-4 backdrop-blur-xl sm:px-6">
        <Link
          href={ROUTES.STUDENT.COURSES}
          className="inline-flex min-h-10 shrink-0 items-center gap-2 text-sm font-semibold text-primary no-underline hover:underline"
        >
          <ArrowLeft className="size-4 shrink-0 rtl:rotate-180" />
          <span className="hidden sm:inline">{t("lpBackCourses")}</span>
        </Link>
        <p className="min-w-0 flex-1 truncate text-center text-sm font-semibold">
          {data.courseTitle}
        </p>
        <span className="hidden shrink-0 items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold tabular-nums text-primary sm:inline-flex">
          {t("lpComplete", { pct: displayPct })}
        </span>
        {/* Mobile TOC toggle */}
        <button
          type="button"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold lg:hidden"
          onClick={() => setTocOpen(true)}
        >
          <MenuIcon className="size-4" />
          {t("lpContents")}
        </button>
      </header>

      <div className="flex flex-1 min-h-0">
        {/* Mobile backdrop */}
        <div
          className={cn(
            "fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden",
            tocOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
          )}
          onClick={() => setTocOpen(false)}
        />

        {/* Curriculum sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 start-0 z-50 flex w-[min(85vw,320px)] flex-col border-e border-border/70 bg-card transition-transform duration-300 lg:relative lg:inset-auto lg:z-auto lg:w-[300px] lg:translate-x-0 lg:shrink-0",
            tocOpen ? "translate-x-0" : "-translate-x-full rtl:translate-x-full",
          )}
        >
          <button
            type="button"
            className="absolute end-3 top-3 grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-muted lg:hidden"
            onClick={() => setTocOpen(false)}
          >
            <CloseIcon className="size-4" />
          </button>

          <div className="border-b border-border/70 p-5">
            <h2 className="mb-3 text-sm font-bold">{t("quizCourseContent")}</h2>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${displayPct}%` }}
              />
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              {t("lpProgressLine", { pct: displayPct, done: displayDone, total: displayTotal })}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto py-2">
            {sidebarModules.map((mod) => (
              <div key={mod.id} className="border-b border-border/60">
                <button
                  type="button"
                  className="flex w-full items-center justify-between px-5 py-3 text-start text-sm font-semibold hover:bg-muted/40"
                  onClick={() => toggleModule(mod.id)}
                >
                  {mod.title}
                  <ChevronRight
                    className={cn("size-4 shrink-0 text-muted-foreground transition-transform", mod.expanded && "rotate-90")}
                  />
                </button>
                {mod.expanded && mod.lessons.map((item) => (
                  <CurriculumItem
                    key={item.slug}
                    item={item}
                    courseId={courseId}
                    activeSlug={lessonSlug}
                    isWatched={item.kind === "lesson" && watchedSlugs.has(item.slug)}
                  />
                ))}
              </div>
            ))}
          </div>

          <div className="border-t border-border/70 p-4">
            <Link
              href={ROUTES.STUDENT.COURSE_OVERVIEW(courseId)}
              className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground no-underline hover:bg-muted hover:text-foreground"
            >
              <ArrowLeft className="size-4 rtl:rotate-180" />
              {t("quizCourseOverview")}
            </Link>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex flex-1 min-w-0 flex-col overflow-auto bg-muted/20">
          {/* Video area */}
          <div className="relative aspect-video max-h-[480px] w-full bg-slate-950">
            <LessonVideo
              title={data.currentLesson.title}
              contentType={data.currentLesson.contentType}
              contentUrl={data.currentLesson.contentUrl}
            />
          </div>

          <div className="mx-auto w-full max-w-4xl space-y-5 p-4 sm:p-6">
            {/* Lesson heading — the student knows what they're consuming */}
            <div>
              <h1 className="font-heading text-xl font-bold tracking-tight sm:text-2xl">{data.currentLesson.title}</h1>
              {data.currentLesson.duration && <p className="mt-1 text-sm text-muted-foreground">{data.currentLesson.duration}</p>}
              {data.currentLesson.description && (
                <div className="mt-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{t("lpAboutLesson")}</p>
                  <p className="mt-1 text-sm leading-relaxed text-foreground/85">{data.currentLesson.description}</p>
                </div>
              )}
            </div>

            {/* My Notes (localStorage) */}
            <LessonNotes key={lessonSlug} courseId={courseId} slug={lessonSlug} t={t} />

            {/* Navigation + mark complete */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-5">
              {data.prevNav ? (
                <Link
                  href={navHref(courseId, data.prevNav)}
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold text-primary no-underline hover:bg-muted"
                >
                  <ArrowLeft className="size-4 rtl:rotate-180" />
                  {t("lpPrevious")}
                </Link>
              ) : <span />}

              <button
                type="button"
                onClick={completeAndContinue}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
              >
                <Check className="size-4" strokeWidth={2.5} />
                {data.nextNav ? t("lpMarkContinue") : t("lpFinishCourse")}
                {data.nextNav && <ChevronRight className="size-4 rtl:rotate-180" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
