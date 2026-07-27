"use client";

import * as React from "react";
import { PlayCircle, FileDown, CheckCircle2, AlertTriangle, BrainCircuit, ChevronLeft, ChevronRight, Play, Lock, Trophy, MessageCircle } from "lucide-react";

import type { FreeLecture } from "@/lib/dal/free-courses";
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
 * Public LMS: watch lectures, then take the quiz — all from one playlist. The
 * quiz is the last playlist item; selecting it replaces the video stage with
 * the quiz screen. Next/Back walk through lectures → quiz.
 */
export function FreeLecturePlayer({
  locale, lectures, quiz = [], onQuizPassed, programName = "", advisorWhatsapp,
}: {
  locale: string;
  lectures: FreeLecture[];
  quiz?: QuizQuestion[];
  onQuizPassed?: () => void;
  programName?: string;
  advisorWhatsapp?: string;
}) {
  const hasQuiz = quiz.length > 0;
  const order = React.useMemo(
    () => [...lectures.map((l) => l.id), ...(hasQuiz ? [QUIZ_ID] : [])],
    [lectures, hasQuiz],
  );
  const [activeId, setActiveId] = React.useState(order[0] ?? "");
  const [watched, setWatched] = React.useState<Set<string>>(() => new Set());
  const [completed, setCompleted] = React.useState<Set<string>>(() => new Set());
  const [ended, setEnded] = React.useState(false);
  const progressPct = lectures.length ? Math.round((completed.size / lectures.length) * 100) : 0;

  const isQuiz = activeId === QUIZ_ID;
  const active = lectures.find((l) => l.id === activeId);
  const idx = Math.max(0, order.indexOf(activeId));
  const lessonIdx = lectures.findIndex((l) => l.id === activeId);

  const title = (l: FreeLecture) => (locale === "ar" ? l.titleAr : l.titleEn) || l.titleEn;
  const desc = (l: FreeLecture) => (locale === "ar" ? l.descriptionAr : l.descriptionEn) || "";

  const select = (id: string) => {
    setActiveId(id);
    setEnded(false);
    if (id !== QUIZ_ID) setWatched((prev) => new Set(prev).add(id));
  };
  const go = (dir: -1 | 1) => { const n = order[idx + dir]; if (n) select(n); };
  const onVideoEnded = () => {
    setEnded(true);
    if (active) setCompleted((prev) => new Set(prev).add(active.id));
  };

  const youTubeId = active && active.videoProvider === "youtube" ? extractYouTubeVideoId(active.videoUrl) : null;

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_20rem] lg:items-start">
      {/* Stage */}
      <div className="space-y-3">
        {/* Course progress (completion bias) */}
        <div className="rounded-xl border border-border/60 bg-card px-4 py-2.5">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span>{tr(locale, "Course progress", "تقدّمك في الكورس")}</span>
            <span className="tabular-nums text-primary">{progressPct}% · {tr(locale, `${completed.size} of ${lectures.length}`, `${completed.size} من ${lectures.length}`)}</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        {isQuiz ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><BrainCircuit className="size-5" /></span>
              <div>
                <h2 className="font-heading text-lg font-bold">{tr(locale, "Test your knowledge", "اختبر معلوماتك")}</h2>
                <p className="text-xs text-muted-foreground">{tr(locale, `${quiz.length} quick questions`, `${quiz.length} أسئلة سريعة`)}</p>
              </div>
            </div>
            <FreeLectureQuiz locale={locale} quiz={quiz} onPassed={onQuizPassed} />
          </div>
        ) : active ? (
          <>
            {/* Free-vs-paid teaser: what the full program adds beyond this lesson. */}
            <div className="rounded-2xl border border-[#f4c430]/40 bg-gradient-to-br from-[#f4c430]/[0.12] to-transparent p-4 sm:p-5">
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
                <YouTubePlayer key={active.id} videoId={youTubeId} autoPlay={false} hideYouTubeChrome onEnded={onVideoEnded} />
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
              {lessonIdx >= 0 && lectures.length > 0 && (
                <span className="pointer-events-none absolute start-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-black/75 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-white shadow backdrop-blur">
                  <Play className="size-3 fill-current" /> {tr(locale, "Free lesson", "درس مجاني")} {lessonIdx + 1} / {lectures.length}
                </span>
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
        ) : null}

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
          {tr(locale, `${lectures.length} lectures`, `${lectures.length} محاضرة`)}{hasQuiz ? tr(locale, " + quiz", " + اختبار") : ""}
        </p>
        <ol className="max-h-[28rem] space-y-1 overflow-y-auto">
          {lectures.map((l, i) => {
            const isOn = l.id === activeId;
            return (
              <li key={l.id}>
                <button type="button" onClick={() => select(l.id)} aria-current={isOn}
                  className={cn("flex w-full items-start gap-2.5 rounded-xl px-2.5 py-2.5 text-start transition-colors", isOn ? "bg-primary/10 ring-1 ring-primary/20" : "hover:bg-muted/60")}>
                  <span className={cn("mt-0.5 grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-bold tabular-nums", isOn ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                    {watched.has(l.id) && !isOn ? <CheckCircle2 className="size-3.5" /> : i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={cn("block text-sm leading-snug", isOn ? "font-semibold text-foreground" : "text-foreground/80")}>{title(l)}</span>
                    <span className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                      <PlayCircle className="size-3" />
                      {l.durationMinutes > 0 ? tr(locale, `${l.durationMinutes} min`, `${l.durationMinutes} دقيقة`) : tr(locale, "Video", "فيديو")}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}

          {hasQuiz && (
            <li>
              {lectures.length > 0 && <div className="my-1 px-2 text-[10px] font-bold uppercase tracking-wider text-primary/70">{tr(locale, "Quiz", "الاختبار")}</div>}
              <button type="button" onClick={() => select(QUIZ_ID)} aria-current={isQuiz}
                className={cn("flex w-full items-start gap-2.5 rounded-xl px-2.5 py-2.5 text-start transition-colors", isQuiz ? "bg-primary/10 ring-1 ring-primary/20" : "hover:bg-muted/60")}>
                <span className={cn("mt-0.5 grid size-6 shrink-0 place-items-center rounded-full", isQuiz ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary")}>
                  <BrainCircuit className="size-3.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className={cn("block text-sm leading-snug", isQuiz ? "font-semibold text-foreground" : "text-foreground/80")}>{tr(locale, "Knowledge check quiz", "اختبار قصير")}</span>
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
