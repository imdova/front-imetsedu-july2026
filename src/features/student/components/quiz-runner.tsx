"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  Clock, ArrowLeft, ArrowRight, Trophy, HelpCircle, Check, List, FileCheck,
  RefreshCw, ChevronRight, FileQuestion, Lock, Flag, Settings, Maximize2,
  ListOrdered, Shuffle, ClipboardCheck, BookOpen, X,
} from "lucide-react";
import { toast } from "sonner";

import { Link } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import { ROUTES } from "@integration/constants";
import type { QuizAttemptData } from "@/lib/dal/student";
import type { QuizQuestion } from "@integration/services/quizzes";
import {
  getStudentCourseRaw, buildCourseSidebar, findModuleIndexForQuiz,
} from "@integration/services/student-courses";
import type { SidebarModule, SidebarLesson } from "@integration/services/student-courses/view-models";
import {
  DEFAULT_START_OPTIONS, buildSessionQuestions, quickCount,
  type QuizStartOptions, type QuestionOrder, type QuizSessionMode, type QuestionCountPreset,
} from "@/features/student/lib/quiz-session";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface QuizResult {
  correct: number;
  total: number;
  pct: number;
  passed: boolean;
}

export function QuizRunner({ quiz, attemptsUsed = 0 }: { quiz: QuizAttemptData; attemptsUsed?: number }) {
  const t = useTranslations("Student");
  const passingPct = quiz.passingPct ?? 70;
  const maxAttempts = quiz.numberOfAttempts ?? 2;
  const attemptsLeft = Math.max(0, maxAttempts - attemptsUsed);

  const [phase, setPhase] = React.useState<"intro" | "running" | "done">("intro");
  const [configOpen, setConfigOpen] = React.useState(false);
  const [options, setOptions] = React.useState<QuizStartOptions>(DEFAULT_START_OPTIONS);
  const [session, setSession] = React.useState<QuizQuestion[]>([]);
  const [current, setCurrent] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<number, number>>({});
  const [flagged, setFlagged] = React.useState<Set<number>>(new Set());
  const [seconds, setSeconds] = React.useState(Math.max(1, quiz.timeLimitMinutes) * 60);
  const [result, setResult] = React.useState<QuizResult | null>(null);
  const [attemptId, setAttemptId] = React.useState<string | null>(null);
  const [starting, setStarting] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);

  const isStudy = options.mode === "study";
  const total = session.length;

  // Course Content sidebar (same data the lesson player uses).
  const [modules, setModules] = React.useState<SidebarModule[]>([]);
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await getStudentCourseRaw(quiz.courseId);
      if (cancelled || !res.ok) return;
      const idx = findModuleIndexForQuiz(res.data.modules, quiz.quizId);
      setModules(buildCourseSidebar(res.data.modules, idx));
    })();
    return () => { cancelled = true; };
  }, [quiz.courseId, quiz.quizId]);
  const toggleModule = (id: string) =>
    setModules((prev) => prev.map((m) => (m.id === id ? { ...m, expanded: !m.expanded } : m)));

  const scoreLocally = React.useCallback((): QuizResult => {
    const correct = session.reduce((acc, q, i) => acc + (answers[i] === q.correctIndex ? 1 : 0), 0);
    const pct = total ? Math.round((correct / total) * 100) : 0;
    return { correct, total, pct, passed: pct >= passingPct };
  }, [answers, session, total, passingPct]);

  const finish = React.useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    let final = scoreLocally();
    if (attemptId) {
      const payload = session
        .map((q, i) => ({ q, i }))
        .filter(({ i }) => answers[i] !== undefined)
        .map(({ q, i }) => ({ questionId: q.id, selectedChoiceIds: [q.optionIds[answers[i]]].filter(Boolean) as string[] }));
      await dal.student.saveQuizAnswers(quiz.quizId, attemptId, payload);
      const submitRes = await dal.student.submitQuizAttempt(quiz.quizId, attemptId);
      if (submitRes.ok && typeof submitRes.data.scorePct === "number") {
        const pct = Math.round(submitRes.data.scorePct);
        final = { correct: total ? Math.round((pct / 100) * total) : 0, total, pct, passed: submitRes.data.passed ?? pct >= passingPct };
      }
    }
    setResult(final);
    setPhase("done");
    setSubmitting(false);
    toast.success(t("quizSubmitted", { score: final.correct, total }));
  }, [attemptId, answers, session, quiz.quizId, scoreLocally, submitting, t, total, passingPct]);

  // Quiz-mode countdown (study mode is untimed).
  React.useEffect(() => {
    if (phase !== "running" || isStudy) return;
    if (seconds <= 0) { void finish(); return; }
    const id = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [phase, isStudy, seconds, finish]);

  const beginSession = async (opts: QuizStartOptions) => {
    setStarting(true);
    const built = buildSessionQuestions(quiz.questions, opts);
    const res = await dal.student.startQuizAttempt(quiz.quizId);
    if (res.ok) setAttemptId(res.data._id);
    setOptions(opts);
    setSession(built);
    setAnswers({});
    setFlagged(new Set());
    setCurrent(0);
    setSeconds(Math.max(1, quiz.timeLimitMinutes) * 60);
    setStarting(false);
    setConfigOpen(false);
    setPhase("running");
  };

  const choose = (oi: number) => {
    setAnswers((p) => ({ ...p, [current]: oi }));
    if (!isStudy) toast.success(t("autoSaved"), { duration: 800 });
  };
  const toggleFlag = (i: number) =>
    setFlagged((p) => { const n = new Set(p); n.has(i) ? n.delete(i) : n.add(i); return n; });

  const toggleFullscreen = () => {
    const el = rootRef.current;
    if (!el) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void el.requestFullscreen?.();
  };

  /* ───────────── Orientation ───────────── */
  if (phase === "intro") {
    return (
      <>
        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          <CourseSidebar modules={modules} toggleModule={toggleModule} courseId={quiz.courseId} activeQuizId={quiz.quizId} t={t} />
          <div className="space-y-5">
            {/* Hero */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a3f6e] via-[#1e5a9e] to-[#2b6cb8] p-6 text-white shadow-md sm:p-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:gap-8">
                <div className="flex shrink-0 flex-col items-start gap-4">
                  <span className="grid size-16 place-items-center rounded-2xl border border-white/20 bg-white/15 backdrop-blur-sm">
                    <span className="grid size-10 place-items-center rounded-full border-2 border-white/90"><HelpCircle className="size-6" /></span>
                  </span>
                  <span className="inline-block rounded-md border border-white/10 bg-[#0f2d52]/80 px-3 py-1.5 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-white/95">{quiz.moduleLabel ?? "QUIZ"}</span>
                </div>
                <div className="min-w-0 flex-1 sm:pt-1">
                  <h1 className="font-heading text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{quiz.orientationTitle ?? quiz.title}</h1>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/85 sm:text-base">{quiz.orientationDescription ?? t("quizDefaultDesc")}</p>
                  <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-white/95"><Check className="size-4 shrink-0" strokeWidth={2.5} /><span>{t("quizOfficialExam")}</span></div>
                </div>
              </div>
            </div>
            {/* Timer warning */}
            <div className="flex items-start gap-3 rounded-xl border border-warning/40 bg-warning/10 px-4 py-3.5 text-sm leading-relaxed text-amber-900 dark:text-amber-100">
              <Clock className="mt-0.5 size-5 shrink-0 text-warning" strokeWidth={2} />
              <p>{t("quizTimerWarning", { min: quiz.timeLimitMinutes })}</p>
            </div>
            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard icon={<Clock className="size-5 text-primary" />} tone="primary" label={t("quizStatDuration")} value={`${quiz.timeLimitMinutes} ${t("minutesLabel")}`} />
              <StatCard icon={<List className="size-5 text-primary" />} tone="primary" label={t("quizStatQuestions")} value={`${quiz.totalQuestions} ${t("quizItems")}`} />
              <StatCard icon={<FileCheck className="size-5 text-primary" />} tone="primary" label={t("quizStatPassing")} value={`${passingPct}%`} />
              <StatCard icon={<RefreshCw className="size-5 text-success" />} tone="success" label={t("quizStatAttempts")} value={t("quizAttemptsLeft", { n: attemptsLeft })} subValue={t("quizAttemptsUsed", { used: attemptsUsed, max: maxAttempts })} />
            </div>
            {/* Start */}
            <div className="pb-4 pt-2 text-center">
              {attemptsLeft > 0 ? (
                <Button size="lg" className="gap-2.5 px-10" onClick={() => setConfigOpen(true)} disabled={quiz.questions.length === 0}>
                  {t("quizStartNow")}<ChevronRight className="size-4 rtl:rotate-180" />
                </Button>
              ) : (
                <div className="inline-flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-5 py-4 text-sm text-destructive" role="alert">{t("quizNoAttempts")}</div>
              )}
              <p className="mt-4 text-xs text-muted-foreground">{attemptsLeft > 0 ? t("quizStartHint") : t("quizNoAttemptsHint")}</p>
            </div>
          </div>
        </div>
        <ConfigureModal open={configOpen} onOpenChange={setConfigOpen} quizTitle={quiz.title} totalQuestions={quiz.questions.length} passingPct={passingPct} starting={starting} onStart={beginSession} t={t} />
      </>
    );
  }

  /* ───────────── Results ───────────── */
  if (phase === "done" && result) {
    return (
      <div className="mx-auto max-w-3xl">
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-14 text-center">
            <span className={cn("grid size-16 place-items-center rounded-2xl", result.passed ? "bg-success/12 text-success" : "bg-destructive/12 text-destructive")}><Trophy className="size-8" /></span>
            <div>
              <p className="text-sm text-muted-foreground">{t("yourScore")}</p>
              <p className="font-heading text-4xl font-bold tabular-nums">{result.correct}/{result.total}</p>
              <p className={cn("text-sm font-medium", result.passed ? "text-success" : "text-destructive")}>{result.pct}% · {result.passed ? t("quizPassed") : t("quizFailed")}</p>
            </div>
            <Button asChild variant="outline" className="mt-2 gap-1.5"><Link href={ROUTES.STUDENT.COURSE_OVERVIEW(quiz.courseId)}><ArrowLeft className="size-4 rtl:rotate-180" />{t("quizCourseOverview")}</Link></Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ───────────── Running ───────────── */
  const q = session[current];
  const answered = Object.keys(answers).length;
  const pctDone = total ? Math.round((answered / total) * 100) : 0;
  const orderLabel = options.order === "random" ? t("quizOrderRandom") : t("quizOrderRegular");
  const modeLabel = isStudy ? t("quizModeStudy") : t("quizModeQuiz");
  const isLast = current === total - 1;

  return (
    <div ref={rootRef} className="grid gap-6 bg-background lg:grid-cols-[280px_1fr]">
      <CourseSidebar modules={modules} toggleModule={toggleModule} courseId={quiz.courseId} activeQuizId={quiz.quizId} t={t} />

      <div className="min-w-0 space-y-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-heading text-lg font-bold">{quiz.title}</h1>
            <p className="text-sm text-muted-foreground">{modeLabel} · {orderLabel} · {total} {t("quizItems")}</p>
          </div>
          <div className="flex items-center gap-2">
            {isStudy ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-3 py-1.5 text-sm font-semibold text-success"><BookOpen className="size-4" />{t("quizStudyUntimed")}</span>
            ) : (
              <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold tabular-nums", seconds <= 60 ? "bg-destructive text-white" : "bg-primary text-primary-foreground")}><Clock className="size-4" />{fmtClock(seconds)}</span>
            )}
            <Button variant="outline" size="icon-sm" onClick={() => setConfigOpen(true)} aria-label={t("quizSettings")}><Settings className="size-4" /></Button>
            <Button variant="outline" size="icon-sm" onClick={toggleFullscreen} aria-label={t("quizFullscreen")}><Maximize2 className="size-4" /></Button>
            <Button onClick={finish} disabled={submitting}>{t("quizFinishAttempt")}</Button>
          </div>
        </div>

        {/* Progress */}
        <div>
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{t("questionOf", { current: current + 1, total })}</span>
            <span className="font-semibold text-muted-foreground">{t("quizPctCompleted", { pct: pctDone })}</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pctDone}%` }} /></div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1fr_280px]">
          {/* Question */}
          <Card>
            <CardContent className="space-y-5 py-6">
              <div className="flex items-center justify-between">
                <span className="inline-flex rounded-full bg-primary px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-primary-foreground">{t("quizMultipleChoice")}</span>
                <button type="button" onClick={() => toggleFlag(current)} className={cn("inline-flex items-center gap-1.5 text-sm font-medium transition-colors", flagged.has(current) ? "text-warning" : "text-muted-foreground hover:text-foreground")}>
                  <Flag className={cn("size-4", flagged.has(current) && "fill-warning")} />{t("quizFlagQuestion")}
                </button>
              </div>
              <h2 className="font-heading text-lg font-semibold leading-snug">{t("quizQuestionLabel", { n: current + 1 })}: {q.question}</h2>
              <div className="space-y-2.5">
                {q.options.map((opt, oi) => {
                  const selected = answers[current] === oi;
                  const showFeedback = isStudy && answers[current] !== undefined;
                  const isCorrect = oi === q.correctIndex;
                  const tone = showFeedback
                    ? isCorrect ? "border-success bg-success/5 text-success"
                      : selected ? "border-destructive bg-destructive/5 text-destructive" : "border-border"
                    : selected ? "border-primary bg-primary/5 text-primary" : "border-border hover:bg-muted";
                  return (
                    <button key={oi} type="button" onClick={() => choose(oi)} className={cn("flex w-full items-center gap-3 rounded-xl border p-3.5 text-start text-sm transition-colors", tone)}>
                      <span className={cn("grid size-5 shrink-0 place-items-center rounded-full border-2",
                        showFeedback && isCorrect ? "border-success" : showFeedback && selected ? "border-destructive" : selected ? "border-primary" : "border-muted-foreground/40")}>
                        {(selected || (showFeedback && isCorrect)) && <span className={cn("size-2.5 rounded-full", showFeedback ? (isCorrect ? "bg-success" : "bg-destructive") : "bg-primary")} />}
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>
              {isStudy && answers[current] !== undefined && (
                <div className={cn("rounded-xl border px-4 py-3 text-sm", answers[current] === q.correctIndex ? "border-success/30 bg-success/5 text-success" : "border-border bg-muted/40")}>
                  {answers[current] === q.correctIndex ? t("quizCorrect") : t("quizIncorrect", { answer: q.options[q.correctIndex] })}
                  {q.learningInsight && <p className="mt-1 text-muted-foreground">{q.learningInsight}</p>}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Question grid */}
          <Card className="self-start">
            <CardContent className="space-y-4 py-5">
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">{t("quizQuestionGrid")}</p>
              <div className="grid grid-cols-4 gap-2">
                {session.map((_, i) => {
                  const isCur = i === current;
                  const isAns = answers[i] !== undefined;
                  const isFlag = flagged.has(i);
                  return (
                    <button key={i} type="button" onClick={() => setCurrent(i)}
                      className={cn("relative grid size-11 place-items-center rounded-lg border text-sm font-semibold transition-colors",
                        isCur ? "border-primary ring-2 ring-primary/30" : "border-border",
                        isAns ? "bg-primary text-primary-foreground" : "bg-card text-foreground hover:bg-muted")}>
                      {i + 1}
                      {isFlag && <Flag className="absolute -end-1 -top-1 size-3 fill-warning text-warning" />}
                    </button>
                  );
                })}
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <Legend className="bg-primary" label={t("quizLegendAnswered")} />
                <Legend icon={<Flag className="size-3 fill-warning text-warning" />} label={t("quizLegendFlagged")} />
                <Legend className="bg-muted border border-border" label={t("quizLegendUnattempted")} />
                <Legend className="border-2 border-primary" label={t("quizLegendCurrent")} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer nav */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-4">
          <Button variant="outline" disabled={current === 0} onClick={() => setCurrent((c) => c - 1)} className="gap-1.5"><ArrowLeft className="size-4 rtl:rotate-180" />{t("quizPrevQuestion")}</Button>
          <Button variant="outline" onClick={() => toggleFlag(current)} className={cn("gap-1.5", flagged.has(current) && "border-warning text-warning")}><Flag className="size-4" />{t("quizFlag")}</Button>
          {isLast ? (
            <Button onClick={finish} disabled={submitting} className={cn("gap-1.5", !isStudy && "bg-success text-white hover:bg-success/90")}>
              {submitting ? t("loading") : isStudy ? t("quizFinishSession") : t("submitQuiz")}
            </Button>
          ) : (
            <Button onClick={() => setCurrent((c) => c + 1)} className="gap-1.5">{t("quizNextQuestion")}<ArrowRight className="size-4 rtl:rotate-180" /></Button>
          )}
        </div>
      </div>
    </div>
  );
}

function fmtClock(total: number): string {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

type T = ReturnType<typeof useTranslations>;

/* ───────────── Configure modal ───────────── */
function ConfigureModal({
  open, onOpenChange, quizTitle, totalQuestions, passingPct, starting, onStart, t,
}: {
  open: boolean; onOpenChange: (o: boolean) => void; quizTitle: string; totalQuestions: number;
  passingPct: number; starting: boolean; onStart: (o: QuizStartOptions) => void; t: T;
}) {
  const [order, setOrder] = React.useState<QuestionOrder>("regular");
  const [mode, setMode] = React.useState<QuizSessionMode>("quiz");
  const [count, setCount] = React.useState<QuestionCountPreset>("all");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 sm:max-w-xl" showCloseButton={false}>
        <div className="flex items-start justify-between p-5 pb-0">
          <div>
            <h3 className="font-heading text-lg font-bold">{t("quizConfigTitle")}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t("quizConfigSub", { title: quizTitle })}</p>
          </div>
          <button type="button" onClick={() => onOpenChange(false)} className="text-muted-foreground hover:text-foreground"><X className="size-5" /></button>
        </div>
        <div className="space-y-4 px-5 py-4">
          <OptionGroup heading={t("quizOrderHeading")}>
            <OptionPill selected={order === "regular"} onSelect={() => setOrder("regular")} icon={ListOrdered} label={t("quizOrderRegular")} desc={t("quizOrderRegularDesc")} />
            <OptionPill selected={order === "random"} onSelect={() => setOrder("random")} icon={Shuffle} label={t("quizOrderRandom")} desc={t("quizOrderRandomDesc")} />
          </OptionGroup>
          <OptionGroup heading={t("quizSessionModeHeading")}>
            <OptionPill selected={mode === "quiz"} onSelect={() => setMode("quiz")} icon={ClipboardCheck} label={t("quizModeQuiz")} desc={t("quizModeQuizDesc", { pct: passingPct })} />
            <OptionPill selected={mode === "study"} onSelect={() => setMode("study")} icon={BookOpen} label={t("quizModeStudy")} desc={t("quizModeStudyDesc")} />
          </OptionGroup>
          <OptionGroup heading={t("quizQuestionsHeading")}>
            <OptionPill selected={count === "all"} onSelect={() => setCount("all")} label={t("quizCountAll", { n: totalQuestions })} desc={t("quizCountAllDesc")} />
            <OptionPill selected={count === "quick"} onSelect={() => setCount("quick")} label={t("quizCountQuick", { n: quickCount(totalQuestions) })} desc={t("quizCountQuickDesc")} />
          </OptionGroup>
        </div>
        <div className="flex justify-end gap-2 border-t border-border/70 p-5">
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("quizCancel")}</Button>
          <Button className="gap-1.5" disabled={starting} onClick={() => onStart({ order, mode, countPreset: count })}>{starting ? t("loading") : t("quizStartSession")}<ChevronRight className="size-4 rtl:rotate-180" /></Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function OptionGroup({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[0.7rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">{heading}</p>
      <div className="grid grid-cols-2 gap-3">{children}</div>
    </div>
  );
}

function OptionPill({ selected, onSelect, icon: Icon, label, desc }: { selected: boolean; onSelect: () => void; icon?: React.ElementType; label: string; desc: string }) {
  return (
    <button type="button" role="radio" aria-checked={selected} onClick={onSelect}
      className={cn("flex flex-col items-start gap-1 rounded-xl border-2 p-3 text-start transition-colors", selected ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/40 hover:bg-muted/40")}>
      <span className="flex items-center gap-2 text-sm font-semibold">{Icon && <Icon className="size-4 shrink-0 text-primary" />}{label}</span>
      <span className="text-xs leading-snug text-muted-foreground">{desc}</span>
    </button>
  );
}

/* ───────────── Shared ───────────── */
function Legend({ className, icon, label }: { className?: string; icon?: React.ReactNode; label: string }) {
  return <span className="flex items-center gap-1.5">{icon ?? <span className={cn("size-3 rounded-full", className)} />}{label}</span>;
}

function StatCard({ icon, tone, label, value, subValue }: { icon: React.ReactNode; tone: "primary" | "success"; label: string; value: string; subValue?: string }) {
  return (
    <Card>
      <CardContent className="flex min-h-[140px] flex-col gap-3 p-5">
        <span className={cn("grid size-11 place-items-center rounded-xl", tone === "success" ? "bg-success/12" : "bg-primary/10")}>{icon}</span>
        <div>
          <p className="mb-1.5 text-[0.7rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
          <p className="font-heading text-2xl font-bold leading-tight">{value}</p>
          {subValue && <p className="mt-1 text-xs text-muted-foreground">{subValue}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

function CourseSidebar({ modules, toggleModule, courseId, activeQuizId, t }: { modules: SidebarModule[]; toggleModule: (id: string) => void; courseId: string; activeQuizId: string; t: T }) {
  return (
    <aside className="hidden self-start overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm lg:block">
      <div className="border-b border-border/70 p-5"><h2 className="text-sm font-bold">{t("quizCourseContent")}</h2></div>
      <div className="max-h-[460px] overflow-y-auto py-2">
        {modules.map((mod) => (
          <div key={mod.id} className="border-b border-border/60">
            <button type="button" onClick={() => toggleModule(mod.id)} className="flex w-full items-center justify-between px-5 py-3 text-start text-sm font-semibold hover:bg-muted/40">
              {mod.title}<ChevronRight className={cn("size-4 shrink-0 text-muted-foreground transition-transform", mod.expanded && "rotate-90")} />
            </button>
            {mod.expanded && mod.lessons.map((item) => (
              <SidebarItem key={`${item.kind}-${item.id}`} item={item} courseId={courseId} activeQuizId={activeQuizId} orientationLabel={t("quizOrientationLabel")} />
            ))}
          </div>
        ))}
      </div>
      <div className="border-t border-border/70 p-4">
        <Link href={ROUTES.STUDENT.COURSE_OVERVIEW(courseId)} className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground no-underline hover:bg-muted hover:text-foreground">
          <ArrowLeft className="size-4 rtl:rotate-180" />{t("quizCourseOverview")}
        </Link>
      </div>
    </aside>
  );
}

function SidebarItem({ item, courseId, activeQuizId, orientationLabel }: { item: SidebarLesson; courseId: string; activeQuizId: string; orientationLabel: string }) {
  const isQuiz = item.kind === "quiz";
  const isActive = isQuiz && item.quizId === activeQuizId;
  const href = isQuiz && item.quizId ? ROUTES.STUDENT.COURSE_QUIZ(courseId, item.quizId) : ROUTES.STUDENT.COURSE_LESSON(courseId, item.slug);
  return (
    <Link href={href} className={cn("flex items-center gap-3 border-s-2 px-5 py-3 text-sm no-underline transition-colors hover:bg-muted/50", isActive ? "border-s-primary bg-primary/5 text-primary" : "border-s-transparent text-muted-foreground")}>
      {isQuiz ? <FileQuestion className="size-4 shrink-0 text-primary" /> : item.status === "locked" ? <Lock className="size-4 shrink-0 text-muted-foreground/40" /> : <ChevronRight className="size-4 shrink-0 text-primary rtl:rotate-180" />}
      <div className="min-w-0 flex-1"><p className={cn("truncate font-medium", isActive && "text-primary")}>{item.title}</p>{isActive && <p className="text-[0.7rem] text-muted-foreground">{orientationLabel}</p>}</div>
      <span className="shrink-0 text-xs text-muted-foreground">{item.duration}</span>
    </Link>
  );
}
