"use client";

import * as React from "react";
import { Check, Loader2, RotateCcw, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { QuizContent } from "@/features/orientation/lib/sales-orientation";
import type { QuizResult } from "@/features/orientation/hooks/use-orientation-progress";
import { num, useOrientationT } from "@/features/orientation/lib/i18n";
import { Lead } from "./lesson-parts";

/**
 * Knowledge check. Five questions from the lessons; reaching the pass mark
 * completes the lesson and — the first time — notifies the team lead that the
 * rep is ready for sign-off. Wrong answers show red, the right ones green, and
 * the rep can retake it.
 */
export function QuizLesson({
  quiz,
  best,
  passedBefore,
  onSubmit,
}: {
  quiz: QuizContent;
  best: { score: number | null; total: number | null };
  passedBefore: boolean;
  onSubmit: (score: number, total: number, passMark: number) => Promise<QuizResult>;
}) {
  const { t } = useOrientationT();
  const [answers, setAnswers] = React.useState<Record<number, number>>({});
  const [result, setResult] = React.useState<{ score: number; notified: boolean } | null>(null);
  const [saving, setSaving] = React.useState(false);

  const total = quiz.questions.length;
  const all = Object.keys(answers).length === total;

  const submit = async () => {
    const score = quiz.questions.filter((q, i) => answers[i] === q.correct).length;
    setSaving(true);
    const res = await onSubmit(score, total, quiz.passMark);
    setSaving(false);
    setResult({ score, notified: res.firstPass });
  };

  const passed = !!result && result.score >= quiz.passMark;

  return (
    <div className="space-y-5">
      {quiz.intro && <Lead>{quiz.intro}</Lead>}
      {best.score !== null && best.total && !result && (
        <p className="text-xs text-muted-foreground">{t("quiz.best", { x: num(best.score), y: num(best.total) })}</p>
      )}

      {quiz.questions.map((q, qi) => (
        <fieldset key={qi} className="space-y-2">
          <legend className="mb-2 text-sm font-bold leading-snug">
            {qi + 1}. {q.question}
          </legend>
          {q.options.map((o, oi) => {
            const chosen = answers[qi] === oi;
            const right = !!result && oi === q.correct;
            const wrong = !!result && chosen && oi !== q.correct;
            return (
              <button
                key={oi}
                type="button"
                aria-pressed={chosen}
                disabled={!!result}
                onClick={() => setAnswers((a) => ({ ...a, [qi]: oi }))}
                className={cn(
                  "grid w-full grid-cols-[1.75rem_1fr] items-center gap-2.5 rounded-xl border p-3 text-start text-sm leading-relaxed transition-colors",
                  !result && chosen && "border-primary bg-primary/[0.07]",
                  !result && !chosen && "border-border/70 hover:border-primary/50",
                  right && "border-emerald-500/60 bg-emerald-500/[0.08]",
                  wrong && "border-destructive/60 bg-destructive/[0.07]",
                  result && !right && !wrong && "border-border/70 opacity-60",
                )}
              >
                <span
                  className={cn(
                    "grid size-6 place-items-center rounded-md text-xs font-bold",
                    right ? "bg-emerald-500 text-white" : wrong ? "bg-destructive text-white" : chosen ? "bg-primary text-primary-foreground" : "bg-muted",
                  )}
                >
                  {right ? <Check className="size-3.5" /> : wrong ? <X className="size-3.5" /> : String.fromCharCode(65 + oi)}
                </span>
                <span>{o}</span>
              </button>
            );
          })}
        </fieldset>
      ))}

      {result ? (
        <div
          role="status"
          className={cn(
            "flex flex-wrap items-center gap-3 rounded-2xl p-4",
            passed ? "bg-emerald-500/[0.1]" : "bg-destructive/[0.07]",
          )}
        >
          <b className="font-heading text-2xl tabular-nums">
            {num(result.score)}/{num(total)}
          </b>
          <span className="min-w-0 flex-1 text-sm">
            {passed ? (result.notified || !passedBefore ? t("quiz.passed") : t("quiz.passedBefore")) : t("quiz.failed")}
          </span>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => {
              setResult(null);
              setAnswers({});
            }}
          >
            <RotateCcw className="size-3.5" />
            {t("quiz.retry")}
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={submit} disabled={!all || saving} className="gap-1.5">
            {saving && <Loader2 className="size-4 animate-spin" />}
            {t("quiz.submit")}
          </Button>
          {!all && <span className="text-xs text-muted-foreground">{t("quiz.answerAll", { n: total })}</span>}
        </div>
      )}
    </div>
  );
}
