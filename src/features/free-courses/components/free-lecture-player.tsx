"use client";

import * as React from "react";
import { PlayCircle, FileDown, CheckCircle2, AlertTriangle, BrainCircuit, ChevronLeft, ChevronRight, ChevronDown, Play, Lock, Trophy, MessageCircle, X, ListChecks } from "lucide-react";

import type { FreeLecture, FreeModule } from "@/lib/dal/free-courses";
import type { QuizQuestion } from "@/features/free-courses/lib/free-quiz-data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { YouTubePlayer } from "@/features/marketing/components/youtube-player";
import { extractYouTubeVideoId } from "@/features/marketing/lib/youtube-id";
import { FreeLectureQuiz } from "./free-lecture-quiz";

const tr = (locale: string, en: string, ar: string) => (locale === "ar" ? ar : en);
const QUIZ_ID = "__quiz__";

/** Paid-course teasers shown locked in the playlist (drive the unlock intent). */
const LOCKED_TEASERS = [
  { en: "Live Sessions", ar: "جلسات مباشرة" },
  { en: "Mock Exams", ar: "امتحانات تجريبية" },
  { en: "Practice Questions", ar: "أسئلة تدريبية" },
  { en: "Final Assessment", ar: "التقييم النهائي" },
];

/**
 * Public LMS: watch lectures + take quizzes, grouped into modules.
 *
 * An item is **unlocked** when it has playable content — a lesson with a video,
 * or a quiz with a resolved question set. Anything else (a lesson with no video,
 * a quiz with no bank quiz picked) renders in the playlist as a 🔒 locked row
 * that can't be opened, matching the admin's "no video / no quiz = locked" rule.
 *
 * The trailing `quiz` prop is the legacy program-level knowledge check; it still
 * appears as the last playlist item and drives the enroll funnel via onQuizPassed.
 */
export function FreeLecturePlayer({
  locale, lectures, modules = [], quizzesById = {}, quiz = [], onQuizPassed, programName = "", advisorWhatsapp,
}: {
  locale: string;
  /** ALL published items (lessons + quizzes), locked ones included. */
  lectures: FreeLecture[];
  modules?: FreeModule[];
  /** Resolved question sets for quiz-kind items, keyed by lecture id. */
  quizzesById?: Record<string, QuizQuestion[]>;
  /** Legacy program-level knowledge check (trailing playlist item). */
  quiz?: QuizQuestion[];
  onQuizPassed?: () => void;
  programName?: string;
  advisorWhatsapp?: string;
}) {
  const hasQuiz = quiz.length > 0;

  const isUnlocked = React.useCallback(
    (l: FreeLecture) => (l.kind === "quiz" ? (quizzesById[l.id]?.length ?? 0) > 0 : !!l.videoUrl),
    [quizzesById],
  );

  // Display order: module by order → its items by order → ungrouped.
  const orderedLectures = React.useMemo(() => {
    const mods = [...modules].sort((a, b) => a.order - b.order);
    const inMod = (mid: string) => lectures.filter((l) => l.moduleId === mid).sort((a, b) => a.order - b.order);
    const grouped = mods.flatMap((m) => inMod(m.id));
    const ungrouped = lectures.filter((l) => !l.moduleId).sort((a, b) => a.order - b.order);
    return [...grouped, ...ungrouped];
  }, [lectures, modules]);

  const unlocked = React.useMemo(() => orderedLectures.filter(isUnlocked), [orderedLectures, isUnlocked]);
  const lessons = React.useMemo(() => unlocked.filter((l) => l.kind === "lesson"), [unlocked]);

  // Nav sequence (Next/Back + progress) is unlocked items, then the trailing quiz.
  const order = React.useMemo(
    () => [...unlocked.map((l) => l.id), ...(hasQuiz ? [QUIZ_ID] : [])],
    [unlocked, hasQuiz],
  );

  const [activeId, setActiveId] = React.useState(order[0] ?? "");
  const [watched, setWatched] = React.useState<Set<string>>(() => new Set());
  const [completed, setCompleted] = React.useState<Set<string>>(() => new Set());
  const [ended, setEnded] = React.useState(false);
  const [showEnjoy, setShowEnjoy] = React.useState(false);
  const [show80, setShow80] = React.useState(false);
  // Accordion: only one module open at a time — defaults to the active item's module.
  const [openModule, setOpenModule] = React.useState<string>(() => unlocked[0]?.moduleId || "");
  const funnelRef = React.useRef({ enjoy: false, near: false });

  const completedLessons = lessons.filter((l) => completed.has(l.id)).length;
  const progressPct = lessons.length ? Math.round((completedLessons / lessons.length) * 100) : 0;

  const isProgramQuiz = activeId === QUIZ_ID;
  const active = lectures.find((l) => l.id === activeId);
  const idx = Math.max(0, order.indexOf(activeId));
  const lessonIdx = lessons.findIndex((l) => l.id === activeId);

  // The quiz to show in the stage: program-level, or a per-item quiz.
  const stageQuiz: QuizQuestion[] | null = isProgramQuiz
    ? quiz
    : active && active.kind === "quiz"
      ? (quizzesById[active.id] ?? [])
      : null;

  const title = (l: FreeLecture) => (locale === "ar" ? l.titleAr : l.titleEn) || l.titleEn;
  const desc = (l: FreeLecture) => (locale === "ar" ? l.descriptionAr : l.descriptionEn) || "";

  const select = (id: string) => {
    setActiveId(id);
    setEnded(false); setShow80(false); setShowEnjoy(false);
    funnelRef.current = { enjoy: false, near: false };
    if (id !== QUIZ_ID) {
      setWatched((prev) => new Set(prev).add(id));
      const it = lectures.find((l) => l.id === id);
      if (it?.moduleId) setOpenModule(it.moduleId); // keep the played item's module open
    }
  };
  const go = (dir: -1 | 1) => { const n = order[idx + dir]; if (n) select(n); };
  const onVideoEnded = () => {
    setEnded(true);
    if (active) setCompleted((prev) => new Set(prev).add(active.id));
  };
  // In-video conversion funnel: gentle nudge at 20%, unlock banner at 80%.
  const onVideoProgress = (pct: number) => {
    if (pct >= 20 && !funnelRef.current.enjoy) {
      funnelRef.current.enjoy = true;
      setShowEnjoy(true);
      window.setTimeout(() => setShowEnjoy(false), 4500);
    }
    if (pct >= 80 && !funnelRef.current.near) {
      funnelRef.current.near = true;
      setShow80(true);
    }
  };

  const youTubeId = active && active.kind === "lesson" && active.videoProvider === "youtube"
    ? extractYouTubeVideoId(active.videoUrl)
    : null;

  const quizCountTotal = unlocked.filter((l) => l.kind === "quiz").length + (hasQuiz ? 1 : 0);

  /* One playlist row (lesson or quiz), locked or not. */
  const Row = ({ l, n }: { l: FreeLecture; n: number }) => {
    const isOn = l.id === activeId;
    const unlockedRow = isUnlocked(l);
    const isQuizRow = l.kind === "quiz";
    if (!unlockedRow) {
      return (
        <li>
          <div className="flex w-full items-start gap-2.5 rounded-xl px-2.5 py-2.5 text-start opacity-70" aria-disabled>
            <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground">
              <Lock className="size-3.5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm leading-snug text-foreground/70">{title(l)}</span>
              <span className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                {isQuizRow ? <ListChecks className="size-3" /> : <PlayCircle className="size-3" />}
                {tr(locale, "Coming soon", "قريبًا")}
              </span>
            </span>
          </div>
        </li>
      );
    }
    return (
      <li>
        <button type="button" onClick={() => select(l.id)} aria-current={isOn}
          className={cn("flex w-full items-start gap-2.5 rounded-xl px-2.5 py-2.5 text-start transition-colors", isOn ? "bg-primary/10 ring-1 ring-primary/20" : "hover:bg-muted/60")}>
          <span className={cn("mt-0.5 grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-bold tabular-nums", isOn ? "bg-primary text-primary-foreground" : isQuizRow ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
            {isQuizRow ? <BrainCircuit className="size-3.5" /> : watched.has(l.id) && !isOn ? <CheckCircle2 className="size-3.5" /> : n}
          </span>
          <span className="min-w-0 flex-1">
            <span className={cn("block text-sm leading-snug", isOn ? "font-semibold text-foreground" : "text-foreground/80")}>{title(l)}</span>
            <span className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
              {isQuizRow ? <BrainCircuit className="size-3" /> : <PlayCircle className="size-3" />}
              {isQuizRow
                ? tr(locale, `${quizzesById[l.id]?.length ?? 0} questions`, `${quizzesById[l.id]?.length ?? 0} أسئلة`)
                : l.durationMinutes > 0 ? tr(locale, `${l.durationMinutes} min`, `${l.durationMinutes} دقيقة`) : tr(locale, "Video", "فيديو")}
            </span>
          </span>
        </button>
      </li>
    );
  };

  const sortedModules = [...modules].sort((a, b) => a.order - b.order);
  const ungroupedLectures = orderedLectures.filter((l) => !l.moduleId);

  // Global lesson numbering across the whole playlist (only lessons are numbered).
  let lessonNo = 0;
  const rowNumber = (l: FreeLecture) => (l.kind === "lesson" ? ++lessonNo : 0);

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_20rem] lg:items-start">
      {/* Stage */}
      <div className="space-y-3">
        {/* Course progress (completion bias) */}
        <div className="rounded-xl border border-border/60 bg-card px-4 py-2.5">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span>{tr(locale, "Course progress", "تقدّمك في الكورس")}</span>
            <span className="tabular-nums text-primary">{progressPct}% · {tr(locale, `${completedLessons} of ${lessons.length}`, `${completedLessons} من ${lessons.length}`)}</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        {stageQuiz ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><BrainCircuit className="size-5" /></span>
              <div>
                <h2 className="font-heading text-lg font-bold">
                  {active && active.kind === "quiz" && !isProgramQuiz ? title(active) : tr(locale, "Test your knowledge", "اختبر معلوماتك")}
                </h2>
                <p className="text-xs text-muted-foreground">{tr(locale, `${stageQuiz.length} quick questions`, `${stageQuiz.length} أسئلة سريعة`)}</p>
              </div>
            </div>
            <FreeLectureQuiz key={activeId} locale={locale} quiz={stageQuiz} onPassed={onQuizPassed} />
          </div>
        ) : active ? (
          <>
            {/* Free-vs-paid teaser: what the full program adds beyond this lesson. Hidden on mobile. */}
            <div className="hidden rounded-2xl border border-[#f4c430]/40 bg-gradient-to-br from-[#f4c430]/[0.12] to-transparent p-4 sm:block sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-extrabold">🎁 {tr(locale, "You're watching the first lesson — free", "أنت تشاهد أول درس مجاناً")}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {tr(
                      locale,
                      `After this lesson you'll have a clear picture of ${programName || "the program"}. The full program also includes:`,
                      `بعد هذا الدرس ستحصل على فكرة واضحة عن ${programName || "البرنامج"}. أما المنهج الكامل فيتضمن:`,
                    )}
                  </p>
                  <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold">
                    {["Mock Exams", "Live Sessions", "Practice Questions", "WhatsApp Support"].map((b) => (
                      <li key={b} className="inline-flex items-center gap-1"><CheckCircle2 className="size-3.5 text-emerald-500" /> {b}</li>
                    ))}
                  </ul>
                </div>
                <a href="#enroll-offer" className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90">
                  <Lock className="size-4" /> {tr(locale, "Unlock Full Course", "افتح الكورس الكامل")}
                </a>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-black shadow-sm">
              {youTubeId ? (
                <YouTubePlayer key={active.id} videoId={youTubeId} autoPlay={false} hideYouTubeChrome onEnded={onVideoEnded} onProgress={onVideoProgress} />
              ) : active.videoProvider === "vdocipher" ? (
                <div className="relative aspect-video">
                  <iframe
                    key={active.id}
                    src={`https://player.vdocipher.com/v2/?otp=&playbackInfo=&video=${encodeURIComponent(active.videoUrl)}`}
                    allow="encrypted-media; fullscreen"
                    allowFullScreen
                    className="absolute inset-0 size-full"
                    title={title(active)}
                  />
                </div>
              ) : (
                <div className="flex aspect-video items-center justify-center gap-2 text-sm text-white/70">
                  <AlertTriangle className="size-4" />
                  {tr(locale, "This lecture has no video yet.", "لا يوجد فيديو لهذه المحاضرة بعد.")}
                </div>
              )}
              {lessonIdx >= 0 && lessons.length > 0 && (
                <span className="pointer-events-none absolute start-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-black/75 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-white shadow backdrop-blur">
                  <Play className="size-3 fill-current" /> {tr(locale, "Free lesson", "درس مجاني")} {lessonIdx + 1} / {lessons.length}
                </span>
              )}

              {/* 20% — gentle nudge */}
              {showEnjoy && !ended && !show80 && (
                <div className="pointer-events-none absolute inset-x-0 bottom-16 z-10 flex justify-center px-3">
                  <span className="animate-in fade-in rounded-full bg-black/75 px-3.5 py-1.5 text-xs font-semibold text-white shadow backdrop-blur">
                    👋 {tr(locale, "Enjoy the lesson!", "استمتع بالدرس!")}
                  </span>
                </div>
              )}

              {/* 80% — the rest is in the full program */}
              {show80 && !ended && (
                <div className="absolute inset-x-0 bottom-0 z-10 flex items-center gap-3 bg-gradient-to-t from-black/90 to-black/20 p-3 sm:p-4">
                  <p className="min-w-0 flex-1 text-start text-sm font-semibold text-white">
                    {tr(locale, "Almost there — the rest of the program is waiting for you.", "قربت تخلّص — باقي المنهج مستنيك في البرنامج الكامل.")}
                  </p>
                  <a href="#enroll-offer" className="shrink-0 rounded-lg bg-[#f4c430] px-3.5 py-1.5 text-xs font-extrabold text-[#0a1424] transition hover:bg-[#f4c430]/90">
                    {tr(locale, "Unlock", "افتح")}
                  </a>
                  <button onClick={() => setShow80(false)} className="shrink-0 text-white/70 transition hover:text-white" aria-label="Close">
                    <X className="size-4" />
                  </button>
                </div>
              )}

              {/* End-of-video conversion overlay */}
              {ended && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 overflow-y-auto bg-gradient-to-br from-primary/95 to-[#082a6b]/95 p-5 text-center text-white sm:gap-4 sm:p-6">
                  <Trophy className="size-9 text-[#f4c430]" />
                  <div>
                    <p className="text-lg font-extrabold">{tr(locale, `Lesson ${lessonIdx + 1} completed! 🎉`, `انتهى الدرس ${lessonIdx + 1}! 🎉`)}</p>
                    <p className="mt-0.5 text-sm text-white/85">{tr(locale, "Enjoyed the content? Get the full program:", "عجبك المحتوى؟ احصل على البرنامج الكامل:")}</p>
                  </div>
                  <ul className="grid gap-1.5 text-start text-sm">
                    {[["The rest of the lessons", "باقي الدروس"], ["Live sessions", "جلسات مباشرة"], ["Accredited certificate", "شهادة معتمدة"], ["Question bank", "بنك أسئلة"]].map(([en, ar]) => (
                      <li key={en} className="flex items-center gap-2"><CheckCircle2 className="size-4 shrink-0 text-[#f4c430]" /> {tr(locale, en, ar)}</li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap justify-center gap-2 pt-1">
                    <a href="#enroll-offer" className="inline-flex items-center gap-1.5 rounded-xl bg-[#f4c430] px-4 py-2.5 text-sm font-extrabold text-[#0a1424] transition hover:bg-[#f4c430]/90">
                      {tr(locale, "Continue Learning", "أكمل التعلّم")} <ChevronRight className="size-4 rtl:rotate-180" />
                    </a>
                    <a
                      href={advisorWhatsapp ? `https://wa.me/${advisorWhatsapp}?text=${encodeURIComponent(tr(locale, `Hi, I finished the free ${programName} lesson and want to know about the full program.`, `مرحبًا، خلّصت الدرس المجاني من ${programName} وحابب أعرف عن البرنامج الكامل.`))}` : "#enroll-offer"}
                      target={advisorWhatsapp ? "_blank" : undefined}
                      rel={advisorWhatsapp ? "noopener noreferrer" : undefined}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-[#25D366]/90"
                    >
                      <MessageCircle className="size-4" /> {tr(locale, "WhatsApp Advisor", "مستشار واتساب")}
                    </a>
                  </div>
                  <button onClick={() => setEnded(false)} className="text-xs text-white/70 underline underline-offset-2 hover:text-white">
                    {tr(locale, "Re-watch", "إعادة المشاهدة")}
                  </button>
                </div>
              )}
            </div>
            <div>
              <h2 className="font-heading text-lg font-bold">{title(active)}</h2>
              {desc(active) && <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{desc(active)}</p>}
              {active.resourceUrl && (
                <a href={active.resourceUrl} target="_blank" rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-border/70 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/5">
                  <FileDown className="size-3.5" /> {tr(locale, "Download resources", "تحميل المرفقات")}
                </a>
              )}
            </div>
          </>
        ) : (
          <p className="rounded-xl border border-dashed border-border/70 p-6 text-center text-sm text-muted-foreground">
            {tr(locale, "Content is being uploaded — check back soon.", "يجري رفع المحتوى — تابعنا قريبًا.")}
          </p>
        )}

        {/* Next / Back */}
        {order.length > 1 && (
          <div className="flex items-center justify-between gap-3 pt-1">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => go(-1)} disabled={idx <= 0}>
              <ChevronLeft className="size-4 rtl:rotate-180" /> {tr(locale, "Back", "السابق")}
            </Button>
            <span className="text-xs tabular-nums text-muted-foreground">{idx + 1} / {order.length}</span>
            <Button size="sm" className="gap-1.5" onClick={() => go(1)} disabled={idx >= order.length - 1}>
              {tr(locale, "Next", "التالي")} <ChevronRight className="size-4 rtl:rotate-180" />
            </Button>
          </div>
        )}
      </div>

      {/* Playlist */}
      <aside className="rounded-2xl border border-border/70 bg-card p-3 shadow-sm lg:sticky lg:top-24">
        <p className="px-2 pb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          {tr(locale, `${lessons.length} lessons`, `${lessons.length} درس`)}
          {quizCountTotal > 0 ? tr(locale, ` · ${quizCountTotal} quiz${quizCountTotal === 1 ? "" : "zes"}`, ` · ${quizCountTotal} اختبار`) : ""}
        </p>
        <ol className="max-h-[32rem] space-y-1 overflow-y-auto">
          {/* Modules — collapsible accordion, only one open at a time */}
          {sortedModules.map((m) => {
            const items = orderedLectures.filter((l) => l.moduleId === m.id);
            const isOpen = openModule === m.id;
            const mTitle = (locale === "ar" ? m.titleAr : m.titleEn) || m.titleEn;
            const unlockedCount = items.filter(isUnlocked).length;
            const doneCount = items.filter((l) => completed.has(l.id)).length;
            return (
              <li key={m.id} className="rounded-xl">
                <button
                  type="button"
                  onClick={() => setOpenModule(isOpen ? "" : m.id)}
                  aria-expanded={isOpen}
                  className={cn("flex w-full items-center gap-2 rounded-xl px-2.5 py-2.5 text-start transition-colors", isOpen ? "bg-muted/50" : "hover:bg-muted/60")}
                >
                  <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform", !isOpen && (locale === "ar" ? "rotate-90" : "-rotate-90"))} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold leading-snug text-foreground">{mTitle}</span>
                    <span className="mt-0.5 block text-[11px] text-muted-foreground">
                      {items.length === 0
                        ? tr(locale, "Coming soon", "قريبًا")
                        : tr(locale, `${unlockedCount} ${unlockedCount === 1 ? "item" : "items"}${doneCount ? ` · ${doneCount} done` : ""}`, `${unlockedCount} ${unlockedCount === 1 ? "عنصر" : "عناصر"}${doneCount ? ` · ${doneCount} مكتمل` : ""}`)}
                    </span>
                  </span>
                </button>
                {isOpen && items.length > 0 && (
                  <ol className="mt-1 space-y-1 ps-3">
                    {items.map((l) => <Row key={l.id} l={l} n={rowNumber(l)} />)}
                  </ol>
                )}
                {isOpen && items.length === 0 && (
                  <p className="px-3 pb-2 pt-1 text-[11px] text-muted-foreground">{tr(locale, "Lessons are being added — check back soon.", "يجري إضافة الدروس — تابعنا قريبًا.")}</p>
                )}
              </li>
            );
          })}

          {/* Ungrouped (legacy) items */}
          {ungroupedLectures.length > 0 && (
            <>
              {sortedModules.length > 0 && (
                <li className="px-2 pb-0.5 pt-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                  {tr(locale, "Lectures", "المحاضرات")}
                </li>
              )}
              {ungroupedLectures.map((l) => <Row key={l.id} l={l} n={rowNumber(l)} />)}
            </>
          )}

          {/* Trailing program-level knowledge check */}
          {hasQuiz && (
            <li>
              <div className="my-1 px-2 text-[10px] font-bold uppercase tracking-wider text-primary/70">{tr(locale, "Quiz", "الاختبار")}</div>
              <button type="button" onClick={() => select(QUIZ_ID)} aria-current={isProgramQuiz}
                className={cn("flex w-full items-start gap-2.5 rounded-xl px-2.5 py-2.5 text-start transition-colors", isProgramQuiz ? "bg-primary/10 ring-1 ring-primary/20" : "hover:bg-muted/60")}>
                <span className={cn("mt-0.5 grid size-6 shrink-0 place-items-center rounded-full", isProgramQuiz ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary")}>
                  <BrainCircuit className="size-3.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className={cn("block text-sm leading-snug", isProgramQuiz ? "font-semibold text-foreground" : "text-foreground/80")}>{tr(locale, "Knowledge check quiz", "اختبار قصير")}</span>
                  <span className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                    <BrainCircuit className="size-3" /> {tr(locale, `${quiz.length} questions`, `${quiz.length} أسئلة`)}
                  </span>
                </span>
              </button>
            </li>
          )}

          {/* Locked paid-course teasers */}
          <li>
            <div className="mb-1 mt-2 flex items-center gap-1.5 px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
              <Lock className="size-3" /> {tr(locale, "Full course", "الكورس الكامل")}
            </div>
          </li>
          {LOCKED_TEASERS.map((item) => (
            <li key={item.en}>
              <a href="#enroll-offer" className="group flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-start opacity-80 transition hover:bg-muted/60 hover:opacity-100">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary">
                  <Lock className="size-3.5" />
                </span>
                <span className="min-w-0 flex-1 text-sm leading-snug text-foreground/70">{tr(locale, item.en, item.ar)}</span>
                <span className="shrink-0 text-[11px] font-bold text-primary opacity-0 transition group-hover:opacity-100">{tr(locale, "Unlock", "افتح")}</span>
              </a>
            </li>
          ))}
        </ol>
      </aside>
    </div>
  );
}
