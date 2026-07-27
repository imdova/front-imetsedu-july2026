"use client";

import * as React from "react";
import { CheckCircle2, XCircle, Trophy, Award, RotateCcw, Clock, ListChecks, AlertTriangle, Lock, ChevronRight } from "lucide-react";

import type { QuizQuestion } from "@/features/free-courses/lib/free-quiz-data";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const tr = (locale: string, en: string, ar: string) => (locale === "ar" ? ar : en);
const PASS = 0.6;

/**
 * Timed knowledge check: answer all questions within `minutes`, submit, then get
 * per-question feedback + a score. Auto-submits when the timer runs out.
 */
export function FreeLectureQuiz({
  locale, quiz, onPassed, minutes = 15,
}: {
  locale: string; quiz: QuizQuestion[]; onPassed?: () => void; minutes?: number;
}) {
  const total = quiz.length;
  const [answers, setAnswers] = React.useState<Record<number, number>>({});
  const [submitted, setSubmitted] = React.useState(false);
  const [remaining, setRemaining] = React.useState(minutes * 60);
  const firedRef = React.useRef(false);

  const t = (o: { en: string; ar: string }) => (locale === "ar" ? o.ar : o.en);
  const score = quiz.reduce((s, q, i) => s + (answers[i] === q.correct ? 1 : 0), 0);
  const answeredCount = Object.keys(answers).length;

  // Countdown (one tick per second) — stops when submitted.
  React.useEffect(() => {
    if (submitted || remaining <= 0) return;
    const id = setTimeout(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearTimeout(id);
  }, [remaining, submitted]);

  // Auto-submit on time-up.
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- time-up finalizes the quiz
    if (remaining === 0 && !submitted) setSubmitted(true);
  }, [remaining, submitted]);

  // Fire onPassed once when finished with a passing score.
  React.useEffect(() => {
    if (submitted && !firedRef.current) {
      firedRef.current = true;
      if (score / total >= PASS) onPassed?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitted]);

  const pick = (qi: number, oi: number) => { if (!submitted) setAnswers((a) => ({ ...a, [qi]: oi })); };
  const restart = () => { setAnswers({}); setSubmitted(false); setRemaining(minutes * 60); firedRef.current = false; };

  const mm = Math.floor(remaining / 60);
  const ss = remaining % 60;
  const pct = Math.round((score / total) * 100);
  const passed = score / total >= PASS;

  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
      {/* Header: timer or result */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-3">
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
          <ListChecks className="size-4 text-primary" /> {tr(locale, `${answeredCount}/${total} answered`, `${answeredCount}/${total} تمّت الإجابة`)}
        </span>
        {submitted ? (
          <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold", passed ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700")}>
            {passed ? <Trophy className="size-4" /> : <Award className="size-4" />} {tr(locale, `Score ${score}/${total} · ${pct}%`, `النتيجة ${score}/${total} · ${pct}%`)}
          </span>
        ) : (
          <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-bold tabular-nums", remaining <= 60 ? "bg-rose-50 text-rose-600" : "bg-primary/10 text-primary")}>
            <Clock className="size-4" /> {mm}:{String(ss).padStart(2, "0")}
          </span>
        )}
      </div>

      {/* Result banner */}
      {submitted && (
        <div className={cn("px-5 py-4 text-center", passed ? "bg-emerald-500/[0.06]" : "bg-amber-500/[0.06]")}>
          <h3 className="font-heading text-lg font-extrabold">
            {passed ? tr(locale, "Great job! 🎉", "أحسنت! 🎉") : tr(locale, "Good effort — review the feedback below", "مجهود كويس — راجع الملاحظات تحت")}
          </h3>
          <div className="mx-auto mt-2 h-2 max-w-xs overflow-hidden rounded-full bg-muted">
            <div className={cn("h-full rounded-full transition-all", passed ? "bg-emerald-500" : "bg-amber-500")} style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}

      {/* Locked upsell — the rest of the assessments live in the diploma. */}
      {submitted && (
        <div className="mx-5 mb-4 rounded-xl border border-primary/30 bg-primary/[0.06] p-4 text-center">
          <p className="inline-flex items-center gap-1.5 text-sm font-bold"><Lock className="size-4 text-primary" /> {tr(locale, "Unlock the full assessment bank", "افتح بنك الأسئلة الكامل")}</p>
          <p className="mt-1 text-xs text-muted-foreground">{tr(locale, "Mock exams, timed finals and hundreds of practice questions — inside the diploma.", "امتحانات تجريبية ونهائية ومئات الأسئلة التدريبية — جوه الدبلومة.")}</p>
          <a href="#enroll-offer" className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition hover:bg-primary/90">
            {tr(locale, "Join the diploma", "انضم للدبلومة")} <ChevronRight className="size-3.5 rtl:rotate-180" />
          </a>
        </div>
      )}

      {/* Questions */}
      <div className="space-y-4 p-5">
        {quiz.map((q, qi) => {
          const picked = answers[qi];
          return (
            <div key={qi} className="rounded-xl border border-border/60 p-4">
              <p className="text-sm font-bold">{qi + 1}. {t(q.q)}</p>
              <div className="mt-3 grid gap-2">
                {q.options.map((o, oi) => {
                  const isPicked = picked === oi;
                  const isCorrect = oi === q.correct;
                  return (
                    <button
                      key={oi}
                      onClick={() => pick(qi, oi)}
                      disabled={submitted}
                      className={cn(
                        "flex items-center justify-between gap-3 rounded-lg border px-3.5 py-2.5 text-start text-sm transition",
                        !submitted && (isPicked ? "border-primary bg-primary/5 font-semibold" : "border-border/70 hover:border-primary/50 hover:bg-muted/50"),
                        submitted && isCorrect && "border-emerald-400 bg-emerald-50 text-emerald-800 font-semibold",
                        submitted && isPicked && !isCorrect && "border-rose-400 bg-rose-50 text-rose-800",
                        submitted && !isCorrect && !isPicked && "border-border/50 opacity-70",
                      )}
                    >
                      {t(o)}
                      {submitted && isCorrect && <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />}
                      {submitted && isPicked && !isCorrect && <XCircle className="size-4 shrink-0 text-rose-600" />}
                    </button>
                  );
                })}
              </div>
              {submitted && (
                <p className={cn("mt-2 text-xs font-semibold", picked === q.correct ? "text-emerald-600" : "text-rose-600")}>
                  {picked === undefined
                    ? tr(locale, `Not answered · Correct: ${t(q.options[q.correct])}`, `لم تُجب · الصحيح: ${t(q.options[q.correct])}`)
                    : picked === q.correct
                      ? tr(locale, "Correct ✅", "إجابة صحيحة ✅")
                      : tr(locale, `Incorrect · Correct: ${t(q.options[q.correct])}`, `خطأ · الصحيح: ${t(q.options[q.correct])}`)}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer action */}
      <div className="border-t border-border/60 p-4">
        {submitted ? (
          <Button variant="outline" className="w-full gap-1.5" onClick={restart}>
            <RotateCcw className="size-4" /> {tr(locale, "Retake quiz", "أعد الاختبار")}
          </Button>
        ) : (
          <div className="space-y-2">
            {answeredCount < total && (
              <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
                <AlertTriangle className="size-3.5 text-amber-500" /> {tr(locale, `${total - answeredCount} unanswered`, `${total - answeredCount} بدون إجابة`)}
              </p>
            )}
            <Button className="w-full gap-1.5" onClick={() => setSubmitted(true)} disabled={answeredCount === 0}>
              <CheckCircle2 className="size-4" /> {tr(locale, "Submit answers", "أرسل الإجابات")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
