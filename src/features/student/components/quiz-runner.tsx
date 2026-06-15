"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Clock, ListChecks, ArrowLeft, ArrowRight, Trophy } from "lucide-react";
import { toast } from "sonner";

import type { Quiz } from "@/lib/db/student";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// Demo answer key (the real one lives server-side).
const KEY = [0, 1, 0, 0, 1];

export function QuizRunner({ quiz }: { quiz: Quiz }) {
  const t = useTranslations("Student");
  const [phase, setPhase] = React.useState<"intro" | "running" | "done">("intro");
  const [current, setCurrent] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<number, number>>({});
  const [seconds, setSeconds] = React.useState(quiz.durationMin * 60);
  const [score, setScore] = React.useState(0);

  const submit = React.useCallback(() => {
    const s = quiz.questions.reduce((acc, _q, i) => acc + (answers[i] === KEY[i] ? 1 : 0), 0);
    setScore(s);
    setPhase("done");
    toast.success(t("quizSubmitted", { score: s, total: quiz.questions.length }));
  }, [answers, quiz.questions, t]);

  // Countdown + auto-submit on expiry (BR-QZ-2).
  React.useEffect(() => {
    if (phase !== "running") return;
    if (seconds <= 0) { submit(); return; }
    const id = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [phase, seconds, submit]);

  const choose = (qi: number, oi: number) => {
    setAnswers((p) => ({ ...p, [qi]: oi }));
    toast.success(t("autoSaved"), { duration: 900 });
  };

  if (phase === "intro") {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-14 text-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
            <ListChecks className="size-7" />
          </span>
          <div>
            <h1 className="font-heading text-xl font-bold">{quiz.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {quiz.questions.length} {t("questionsLabel")} · {quiz.durationMin} {t("minutesLabel")}
            </p>
          </div>
          <Button size="lg" onClick={() => setPhase("running")}>{t("startQuiz")}</Button>
        </CardContent>
      </Card>
    );
  }

  if (phase === "done") {
    const pct = Math.round((score / quiz.questions.length) * 100);
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-14 text-center">
          <span className="grid size-16 place-items-center rounded-2xl bg-success/12 text-success">
            <Trophy className="size-8" />
          </span>
          <div>
            <p className="text-sm text-muted-foreground">{t("yourScore")}</p>
            <p className="font-heading text-4xl font-bold tabular-nums">{score}/{quiz.questions.length}</p>
            <p className="text-sm font-medium text-success">{pct}%</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const q = quiz.questions[current];
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  const low = seconds <= 30;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">
          {t("questionOf", { current: current + 1, total: quiz.questions.length })}
        </p>
        <span className={cn("inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-sm font-semibold tabular-nums",
          low ? "bg-destructive/12 text-destructive" : "bg-muted text-foreground")}>
          <Clock className="size-4" /> {t("timeLeft")} {mm}:{ss}
        </span>
      </div>

      <div className="flex gap-1.5">
        {quiz.questions.map((_, i) => (
          <span key={i} className={cn("h-1.5 flex-1 rounded-full",
            i === current ? "bg-primary" : answers[i] !== undefined ? "bg-success" : "bg-muted")} />
        ))}
      </div>

      <Card>
        <CardContent className="space-y-4 py-6">
          <h2 className="font-heading text-lg font-semibold">{q.text}</h2>
          <div className="space-y-2.5">
            {q.options.map((opt, oi) => {
              const selected = answers[current] === oi;
              return (
                <button key={oi} type="button" onClick={() => choose(current, oi)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border p-3.5 text-start text-sm transition-colors",
                    selected ? "border-primary bg-primary/5 text-primary" : "border-border hover:bg-muted",
                  )}>
                  <span className={cn("grid size-6 shrink-0 place-items-center rounded-full border text-xs font-semibold",
                    selected ? "border-primary bg-primary text-primary-foreground" : "border-border")}>
                    {String.fromCharCode(65 + oi)}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button variant="outline" disabled={current === 0} onClick={() => setCurrent((c) => c - 1)} className="gap-1.5">
          <ArrowLeft className="size-4 rtl:rotate-180" /> {/* prev */}
        </Button>
        {current === quiz.questions.length - 1 ? (
          <Button onClick={submit}>{t("submitQuiz")}</Button>
        ) : (
          <Button onClick={() => setCurrent((c) => c + 1)} className="gap-1.5">
            <ArrowRight className="size-4 rtl:rotate-180" />
          </Button>
        )}
      </div>
    </div>
  );
}
