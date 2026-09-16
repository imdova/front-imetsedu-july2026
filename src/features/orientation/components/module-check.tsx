"use client";

import * as React from "react";
import { Ban, Check, ChevronDown, Flame, Lightbulb, Loader2, Play, RotateCcw, ShieldCheck, Sparkles, Star, Timer, Trophy, X, Zap } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { OrientationModuleCheckRecord } from "@/lib/dal/orientation";
import type { ModuleCheck, ModuleCheckQuestion } from "@/features/orientation/lib/sales-orientation";
import { num, useOrientationT, type Translate } from "@/features/orientation/lib/i18n";
import { BASE_XP, QUESTION_SECONDS, SPEED_XP, maxXp, starsFor, streakBonus } from "@/features/orientation/lib/gamification";
import { Bubble } from "./lesson-parts";

/**
 * Module check — the end-of-module challenge.
 *
 * Built for new sales hires rather than students: every question is a real
 * client situation (pick the best reply, or decide whether a message is safe to
 * send), answered against a short clock like a live chat. Right answers earn
 * XP, with a speed bonus and a streak bonus; every answer shows a coach tip.
 * A run ends with 0–3 stars; passing completes the module. Replays are free
 * and the best run is kept, so practising never costs a rep anything.
 */


/** Seeded shuffle, so option order is stable within a run but changes between runs. */
function shuffled(length: number, seed: number) {
  let a = seed >>> 0;
  const rand = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let x = Math.imul(a ^ (a >>> 15), a | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
  const order = Array.from({ length }, (_, i) => i);
  for (let i = length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

interface Answer {
  picked: number;
  correct: boolean;
  xp: number;
}

export function ModuleCheckLesson({
  moduleNumber,
  check,
  best,
  onFinish,
}: {
  moduleNumber: number;
  check: ModuleCheck;
  best: OrientationModuleCheckRecord | undefined;
  onFinish: (run: { score: number; total: number; xp: number; stars: number }) => Promise<{ ok: boolean; firstPass: boolean; newBest: boolean }>;
}) {
  const { t } = useOrientationT();
  const questions = check.questions;
  const total = questions.length;

  const [phase, setPhase] = React.useState<"intro" | "play" | "result">("intro");
  const [run, setRun] = React.useState(0);
  const [index, setIndex] = React.useState(0);
  const [answers, setAnswers] = React.useState<Answer[]>([]);
  const [left, setLeft] = React.useState(QUESTION_SECONDS);
  const [saving, setSaving] = React.useState(false);
  const [outcome, setOutcome] = React.useState<{ firstPass: boolean; newBest: boolean } | null>(null);
  const [review, setReview] = React.useState(false);

  const answered = answers.length > index;
  const q = questions[index];
  const xp = answers.reduce((s, a) => s + a.xp, 0);
  const streak = (() => {
    let s = 0;
    for (let i = answers.length - 1; i >= 0 && answers[i].correct; i--) s++;
    return s;
  })();
  const bestStreak = answers.reduce(
    (acc, a) => {
      const cur = a.correct ? acc.cur + 1 : 0;
      return { cur, max: Math.max(acc.max, cur) };
    },
    { cur: 0, max: 0 },
  ).max;

  // The clock runs only while the current question is unanswered.
  React.useEffect(() => {
    if (phase !== "play" || answered) return;
    const id = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [phase, answered, index]);

  const start = () => {
    setRun((r) => r + 1);
    setIndex(0);
    setAnswers([]);
    setLeft(QUESTION_SECONDS);
    setOutcome(null);
    setReview(false);
    setPhase("play");
  };

  const answer = (picked: number) => {
    if (answered || !q) return;
    const correct = picked === q.correct;
    const gain = correct ? BASE_XP + Math.round((SPEED_XP * left) / QUESTION_SECONDS) + streakBonus(streak) : 0;
    setAnswers((a) => [...a, { picked, correct, xp: gain }]);
  };

  const finish = async () => {
    const score = answers.filter((a) => a.correct).length;
    const stars = starsFor(score, total, check.passPercent);
    setPhase("result");
    setSaving(true);
    const res = await onFinish({ score, total, xp, stars });
    setSaving(false);
    setOutcome({ firstPass: res.firstPass, newBest: res.newBest });
  };

  const next = () => {
    if (!answered) return;
    if (index + 1 < total) {
      setIndex((i) => i + 1);
      setLeft(QUESTION_SECONDS);
    } else {
      void finish();
    }
  };

  // Keyboard: 1–4 answer, Enter moves on.
  const keyHandler = React.useRef<(e: KeyboardEvent) => void>(() => {});
  React.useEffect(() => {
    keyHandler.current = (e: KeyboardEvent) => {
      if (phase !== "play" || e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      if (e.key === "Enter" && answered) {
        e.preventDefault();
        next();
        return;
      }
      const n = Number(e.key);
      if (!answered && q && n >= 1) {
        const order = q.kind === "choice" ? shuffled(q.options.length, run * 7919 + index * 104729) : [0, 1];
        if (n <= order.length) answer(order[n - 1]);
      }
    };
  });
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => keyHandler.current(e);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (total === 0) {
    return <p className="rounded-xl bg-muted/60 p-4 text-center text-sm text-muted-foreground">{t("check.empty")}</p>;
  }

  /* ── intro ── */
  if (phase === "intro") {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/[0.1] via-card to-amber-500/[0.08] p-5 ring-1 ring-primary/15 sm:p-7">
        <div className="flex flex-wrap items-start gap-4">
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
            <Trophy className="size-7" />
          </span>
          <div className="min-w-0 flex-1 space-y-1">
            <h3 className="font-heading text-xl font-extrabold">{t("check.title", { n: moduleNumber })}</h3>
            <p className="max-w-[60ch] text-sm leading-relaxed text-muted-foreground">{t("check.intro")}</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2 text-sm">
          <Pill icon={<Play className="size-3.5" />}>{t("check.questions", { n: num(total) })}</Pill>
          <Pill icon={<Zap className="size-3.5 text-amber-500" />}>{t("check.upTo", { xp: num(maxXp(total)) })}</Pill>
          <Pill icon={<Check className="size-3.5 text-emerald-600" />}>{t("check.pass", { p: check.passPercent })}</Pill>
          <Pill icon={<Timer className="size-3.5" />}>{t("check.speedHint", { s: QUESTION_SECONDS })}</Pill>
        </div>

        {best && best.attempts > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl bg-card/80 px-3.5 py-2.5 text-sm ring-1 ring-border/60">
            <span className="font-semibold">{t("check.best")}</span>
            <Stars value={best.stars} size="sm" />
            <span className="tabular-nums text-muted-foreground">{t("check.score", { x: num(best.best), y: num(best.total) })}</span>
            <span className="inline-flex items-center gap-1 font-semibold tabular-nums text-amber-600">
              <Zap className="size-3.5" />
              {t("journey.xp", { xp: num(best.xp) })}
            </span>
            <span className="text-xs text-muted-foreground">{t("check.attempts", { n: num(best.attempts) })}</span>
          </div>
        )}

        <Button size="lg" className="mt-5 gap-2" onClick={start}>
          {best && best.attempts > 0 ? <RotateCcw className="size-4" /> : <Play className="size-4" />}
          {best && best.attempts > 0 ? t("check.again") : t("check.start")}
        </Button>
      </div>
    );
  }

  /* ── result ── */
  if (phase === "result") {
    const score = answers.filter((a) => a.correct).length;
    const stars = starsFor(score, total, check.passPercent);
    const passed = stars > 0;
    return (
      <div className="space-y-4">
        <div
          className={cn(
            "relative overflow-hidden rounded-2xl p-6 text-center ring-1 sm:p-8",
            passed ? "bg-gradient-to-b from-amber-500/[0.12] to-card ring-amber-500/25" : "bg-muted/50 ring-border/60",
          )}
          role="status"
        >
          {passed && <Confetti key={run} />}
          <Stars value={stars} size="lg" animate />
          <h3 className="mt-3 font-heading text-2xl font-extrabold">{t(`check.r${stars}` as "check.r0")}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {passed ? t("check.passedMsg", { n: moduleNumber }) : t("check.failedMsg", { p: check.passPercent })}
          </p>

          <dl className="mx-auto mt-5 grid max-w-md grid-cols-3 gap-2">
            <Stat label={t("check.correctLabel")} value={`${num(score)}/${num(total)}`} />
            <Stat label={t("check.earned")} value={num(xp)} accent />
            <Stat label={t("check.bestStreak")} value={num(bestStreak)} />
          </dl>

          <div className="mt-3 h-6">
            {saving ? (
              <Loader2 className="mx-auto size-4 animate-spin text-muted-foreground" />
            ) : outcome?.newBest ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-400">
                <Sparkles className="size-3.5" />
                {t("check.newBest")}
              </span>
            ) : null}
          </div>

          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Button className="gap-1.5" variant={passed ? "outline" : "default"} onClick={start}>
              <RotateCcw className="size-4" />
              {t("check.again")}
            </Button>
            <Button variant="ghost" className="gap-1.5" aria-expanded={review} onClick={() => setReview((v) => !v)}>
              <ChevronDown className={cn("size-4 transition-transform", review && "rotate-180")} />
              {review ? t("check.hideReview") : t("check.review")}
            </Button>
          </div>
        </div>

        {review && (
          <ol className="space-y-2">
            {questions.map((question, i) => {
              const a = answers[i];
              return (
                <li key={i} className={cn("rounded-xl border p-3.5 text-sm", a?.correct ? "border-emerald-500/30" : "border-destructive/30")}>
                  <p className="flex items-start gap-2 font-semibold">
                    {a?.correct ? <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" /> : <X className="mt-0.5 size-4 shrink-0 text-destructive" />}
                    <span>{questionText(question, t)}</span>
                  </p>
                  <p className="mt-1.5 ps-6 text-muted-foreground">
                    {t("check.answer")} <b className="font-semibold text-foreground">{answerText(question, question.correct, t)}</b>
                  </p>
                  {question.explain && <p className="mt-1 ps-6 text-[13px] leading-relaxed">{question.explain}</p>}
                </li>
              );
            })}
          </ol>
        )}
      </div>
    );
  }

  /* ── play ── */
  if (!q) return null;
  const current = answers[index];
  const order = q.kind === "choice" ? shuffled(q.options.length, run * 7919 + index * 104729) : [0, 1];
  const low = left <= 5 && !answered;

  return (
    <div className="space-y-4">
      {/* HUD */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-1 gap-1" aria-label={t("check.question", { i: index + 1, n: total })}>
          {questions.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-2 flex-1 rounded-full transition-colors",
                i < answers.length ? (answers[i].correct ? "bg-emerald-500" : "bg-destructive") : i === index ? "bg-primary" : "bg-muted",
              )}
            />
          ))}
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold tabular-nums transition-colors",
            low ? "bg-destructive/10 text-destructive" : "bg-muted text-foreground",
          )}
          aria-live="off"
        >
          <Timer className="size-3.5" />
          {t("check.timer", { s: left })}
        </span>
        {streak >= 2 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/15 px-2.5 py-1 text-xs font-bold text-orange-600 motion-safe:animate-pulse">
            <Flame className="size-3.5" />
            {t("check.streak", { n: streak })}
          </span>
        )}
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-bold tabular-nums text-amber-700 dark:text-amber-400">
          <Zap className="size-3.5" />
          {t("journey.xp", { xp: num(xp) })}
        </span>
      </div>

      <p className="text-xs font-semibold text-muted-foreground">{t("check.question", { i: index + 1, n: total })}</p>

      {/* Question */}
      <div key={`${run}-${index}`} className="space-y-3 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2">
        {(q.client || q.kind === "safe") && (
          <div className="space-y-2 rounded-2xl bg-muted/60 p-3.5">
            {q.client && (
              <Bubble side="client" label={t("chat.client")}>
                {q.client}
              </Bubble>
            )}
            {q.kind === "safe" && (
              <Bubble side="rep" label={t("check.yourMessage")}>
                {q.message}
              </Bubble>
            )}
          </div>
        )}
        <h3 className="font-heading text-lg font-bold leading-snug">{q.kind === "safe" ? q.prompt || t("check.safePrompt") : q.prompt}</h3>

        {q.kind === "safe" ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              { value: 0, label: t("check.safe"), icon: ShieldCheck },
              { value: 1, label: t("check.unsafe"), icon: Ban },
            ].map((o, position) => {
              const state = answerState(answered, current?.picked, q.correct, o.value);
              return (
                <button
                  key={o.value}
                  type="button"
                  disabled={answered}
                  onClick={() => answer(o.value)}
                  className={cn(optionClass(state, answered), "flex items-center justify-center gap-2 py-4 text-base font-bold")}
                >
                  <o.icon className={cn("size-5", o.value === 0 ? "text-emerald-600" : "text-destructive", state !== "idle" && state !== "dim" && "text-current")} />
                  {o.label}
                  <kbd className="ms-1 hidden rounded border border-border px-1.5 text-[10px] font-medium text-muted-foreground sm:inline">{position + 1}</kbd>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="grid gap-2">
            {order.map((oi, position) => {
              const state = answerState(answered, current?.picked, q.correct, oi);
              return (
                <button
                  key={oi}
                  type="button"
                  disabled={answered}
                  onClick={() => answer(oi)}
                  className={cn(optionClass(state, answered), "grid grid-cols-[1.75rem_1fr] items-start gap-2.5 p-3.5 text-start text-sm leading-relaxed")}
                >
                  <span
                    className={cn(
                      "grid size-7 place-items-center rounded-lg text-xs font-bold",
                      state === "right" ? "bg-emerald-500 text-white" : state === "wrong" ? "bg-destructive text-white" : "bg-muted",
                    )}
                  >
                    {state === "right" ? <Check className="size-4" /> : state === "wrong" ? <X className="size-4" /> : position + 1}
                  </span>
                  <span>{q.options[oi]}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Feedback */}
      {answered && current && (
        <div
          role="status"
          className={cn(
            "space-y-2 rounded-2xl p-4 motion-safe:animate-in motion-safe:zoom-in-95",
            current.correct ? "bg-emerald-500/[0.1]" : "bg-destructive/[0.07]",
          )}
        >
          <p className={cn("flex items-center gap-2 font-heading text-base font-extrabold", current.correct ? "text-emerald-700 dark:text-emerald-400" : "text-destructive")}>
            {current.correct ? <Sparkles className="size-5" /> : <X className="size-5" />}
            {current.correct ? t("check.correct", { xp: num(current.xp) }) : t("check.wrong")}
          </p>
          {!current.correct && (
            <p className="text-sm">
              {t("check.answer")} <b className="font-semibold">{answerText(q, q.correct, t)}</b>
            </p>
          )}
          {q.explain && (
            <p className="flex items-start gap-2 text-sm leading-relaxed">
              <Lightbulb className="mt-0.5 size-4 shrink-0 text-amber-500" />
              <span>
                <b className="font-semibold">{t("check.coach")}: </b>
                {q.explain}
              </span>
            </p>
          )}
          <div className="flex items-center justify-between gap-2 pt-1">
            <span className="hidden text-[11px] text-muted-foreground min-[761px]:inline">{t("check.keys")}</span>
            <Button className="ms-auto gap-1.5" onClick={next} autoFocus>
              {index + 1 < total ? t("check.next") : t("check.finish")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

type OptionState = "idle" | "right" | "wrong" | "dim";

function answerState(answered: boolean, picked: number | undefined, correct: number, value: number): OptionState {
  if (!answered) return "idle";
  if (value === correct) return "right";
  if (value === picked) return "wrong";
  return "dim";
}

function optionClass(state: OptionState, answered: boolean) {
  return cn(
    "w-full rounded-xl border transition-all",
    state === "idle" && "border-border/70 hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-sm motion-reduce:hover:translate-y-0",
    state === "right" && "border-emerald-500 bg-emerald-500/[0.1]",
    state === "wrong" && "border-destructive bg-destructive/[0.08]",
    state === "dim" && "border-border/60 opacity-50",
    answered && "cursor-default",
  );
}

function questionText(q: ModuleCheckQuestion, t: Translate) {
  return q.kind === "safe" ? `«${q.message}» — ${q.prompt || t("check.safePrompt")}` : q.prompt;
}

function answerText(q: ModuleCheckQuestion, value: number, t: Translate) {
  return q.kind === "safe" ? (value === 0 ? t("check.safe") : t("check.unsafe")) : q.options[value];
}

function Pill({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-card/90 px-3 py-1 text-xs font-medium ring-1 ring-border/60">
      {icon}
      {children}
    </span>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-xl bg-card/90 p-2.5 ring-1 ring-border/60">
      <dt className="text-[11px] text-muted-foreground">{label}</dt>
      <dd className={cn("font-heading text-xl font-extrabold tabular-nums", accent && "text-amber-600")}>{value}</dd>
    </div>
  );
}

export function Stars({ value, size = "sm", animate }: { value: number; size?: "sm" | "lg"; animate?: boolean }) {
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={`${value}/3`}>
      {[1, 2, 3].map((i) => (
        <Star
          key={i}
          className={cn(
            size === "lg" ? "size-10" : "size-4",
            i <= value ? "fill-[#D89B32] text-[#D89B32]" : "fill-muted text-muted-foreground/40",
            animate && i <= value && "motion-safe:animate-in motion-safe:zoom-in-50 motion-safe:fill-mode-both",
          )}
          style={animate ? { animationDelay: `${i * 180}ms`, animationDuration: "400ms" } : undefined}
        />
      ))}
    </span>
  );
}

/** A short burst of confetti, skipped when the viewer prefers reduced motion. */
function Confetti() {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const root = ref.current;
    if (!root || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const colors = ["#D89B32", "#10b981", "#6366f1", "#f43f5e", "#0ea5e9", "#f59e0b"];
    const pieces = Array.from({ length: 36 }, (_, i) => {
      const el = document.createElement("span");
      const size = 6 + Math.random() * 6;
      Object.assign(el.style, {
        position: "absolute",
        top: "-12px",
        left: `${Math.random() * 100}%`,
        width: `${size}px`,
        height: `${size * 0.45}px`,
        background: colors[i % colors.length],
        borderRadius: "2px",
      });
      root.appendChild(el);
      el.animate(
        [
          { transform: "translate3d(0,0,0) rotate(0deg)", opacity: 1 },
          { transform: `translate3d(${(Math.random() - 0.5) * 160}px, ${260 + Math.random() * 120}px, 0) rotate(${Math.random() * 720}deg)`, opacity: 0 },
        ],
        { duration: 1400 + Math.random() * 900, delay: Math.random() * 250, easing: "cubic-bezier(.2,.6,.4,1)", fill: "forwards" },
      );
      return el;
    });
    const cleanup = setTimeout(() => pieces.forEach((p) => p.remove()), 2800);
    return () => {
      clearTimeout(cleanup);
      pieces.forEach((p) => p.remove());
    };
  }, []);
  return <div ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden" />;
}
