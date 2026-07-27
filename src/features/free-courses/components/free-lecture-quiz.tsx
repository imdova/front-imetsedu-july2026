"use client";

import * as React from "react";
import { CheckCircle2, XCircle, Trophy, RotateCcw, ArrowLeft, Award, HelpCircle } from "lucide-react";

import type { QuizQuestion } from "@/features/free-courses/lib/free-quiz-data";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const tr = (locale: string, en: string, ar: string) => (locale === "ar" ? ar : en);
const PASS = 0.6;

export function FreeLectureQuiz({
  locale, quiz, onPassed,
}: {
  locale: string; quiz: QuizQuestion[]; onPassed?: () => void;
}) {
  const [index, setIndex] = React.useState(0);
  const [picked, setPicked] = React.useState<number | null>(null);
  const [score, setScore] = React.useState(0);
  const [done, setDone] = React.useState(false);

  const total = quiz.length;
  const q = quiz[index];
  const t = (o: { en: string; ar: string }) => (locale === "ar" ? o.ar : o.en);

  const choose = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === q.correct) setScore((s) => s + 1);
  };
  const next = () => {
    if (index < total - 1) { setIndex((i) => i + 1); setPicked(null); }
    else { setDone(true); if (score / total >= PASS) onPassed?.(); } // score already includes this answer
  };
  const restart = () => { setIndex(0); setPicked(null); setScore(0); setDone(false); };

  if (done) {
    const pct = Math.round((score / total) * 100);
    const passed = score / total >= PASS;
    return (
      <div className="overflow-hidden rounded-2xl border border-border/70 bg-card text-center shadow-sm">
        <div className={cn("px-6 py-8", passed ? "bg-gradient-to-b from-emerald-500/10 to-transparent" : "bg-gradient-to-b from-amber-500/10 to-transparent")}>
          <span className={cn("mx-auto mb-3 grid size-16 place-items-center rounded-2xl", passed ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600")}>
            {passed ? <Trophy className="size-9" /> : <Award className="size-9" />}
          </span>
          <h3 className="font-heading text-2xl font-extrabold">
            {passed ? tr(locale, "Great job! 🎉", "أحسنت! 🎉") : tr(locale, "Good effort!", "مجهود كويس!")}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {tr(locale, `You scored ${score} / ${total} (${pct}%)`, `نتيجتك ${score} / ${total} (${pct}%)`)}
          </p>
          <div className="mx-auto mt-4 h-2 max-w-xs overflow-hidden rounded-full bg-muted">
            <div className={cn("h-full rounded-full transition-all", passed ? "bg-emerald-500" : "bg-amber-500")} style={{ width: `${pct}%` }} />
          </div>
          <p className="mx-auto mt-4 max-w-sm text-sm">
            {passed
              ? tr(locale, "You're ready to go deeper — join the next live cohort below.", "إنت جاهز تتعمّق أكتر — انضم للدفعة المباشرة القادمة تحت.")
              : tr(locale, "Re-watch the lectures and try again — you've got this!", "راجع المحاضرات وحاول تاني — إنت قدّها!")}
          </p>
          <Button variant="outline" size="sm" className="mt-4 gap-1.5" onClick={restart}>
            <RotateCcw className="size-4" /> {tr(locale, "Retake quiz", "أعد الاختبار")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
      {/* progress */}
      <div className="border-b border-border/60 px-5 py-3">
        <div className="mb-2 flex items-center justify-between text-xs font-medium text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><HelpCircle className="size-3.5 text-primary" /> {tr(locale, `Question ${index + 1} of ${total}`, `سؤال ${index + 1} من ${total}`)}</span>
          <span className="tabular-nums">{tr(locale, `Score ${score}`, `النتيجة ${score}`)}</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${((index + (picked !== null ? 1 : 0)) / total) * 100}%` }} />
        </div>
      </div>

      <div className="p-5">
        <p className="text-base font-bold">{t(q.q)}</p>
        <div className="mt-4 grid gap-2.5">
          {q.options.map((o, i) => {
            const isCorrect = i === q.correct;
            const isPicked = i === picked;
            const reveal = picked !== null;
            return (
              <button
                key={i}
                onClick={() => choose(i)}
                disabled={reveal}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-start text-sm font-medium transition",
                  !reveal && "border-border/70 hover:border-primary hover:bg-primary/5",
                  reveal && isCorrect && "border-emerald-400 bg-emerald-50 text-emerald-800",
                  reveal && isPicked && !isCorrect && "border-rose-400 bg-rose-50 text-rose-800",
                  reveal && !isCorrect && !isPicked && "border-border/50 opacity-60",
                )}
              >
                {t(o)}
                {reveal && isCorrect && <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />}
                {reveal && isPicked && !isCorrect && <XCircle className="size-5 shrink-0 text-rose-600" />}
              </button>
            );
          })}
        </div>

        {picked !== null && (
          <div className="mt-4 flex items-center justify-between">
            <span className={cn("text-sm font-semibold", picked === q.correct ? "text-emerald-600" : "text-rose-600")}>
              {picked === q.correct ? tr(locale, "Correct! ✅", "إجابة صحيحة! ✅") : tr(locale, "Not quite.", "مش مظبوطة.")}
            </span>
            <Button size="sm" className="gap-1.5" onClick={next}>
              {index < total - 1 ? tr(locale, "Next", "التالي") : tr(locale, "See result", "شوف النتيجة")}
              <ArrowLeft className="size-4 rtl:rotate-180" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
