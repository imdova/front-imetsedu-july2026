"use client";

import * as React from "react";
import { Check, ChevronDown, RotateCcw, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Rule, Scenario } from "@/features/orientation/lib/sales-orientation";
import { num, useOrientationT } from "@/features/orientation/lib/i18n";
import { track } from "@/features/orientation/lib/track";
import { Bubble, CopyButton, type GateProps } from "./lesson-parts";

/**
 * The rules, practice, phrasing, closing and pre-send lessons. Each records a
 * gate key the moment the learner actually does the thing — opens a rule,
 * answers a situation, flips a card — so progress tracks work, not presence.
 */

/* ── the four rules ──────────────────────────────────────────────────────── */

export function RulesModule({ rules, seen, mark }: { rules: Rule[] } & GateProps) {
  const { t } = useOrientationT();
  const [open, setOpen] = React.useState<string | null>(rules[0]?.id ?? null);

  // The first rule starts open, so it counts as seen from the outset.
  const first = rules[0]?.id;
  React.useEffect(() => {
    if (first) mark(first);
  }, [first, mark]);

  return (
    <div className="space-y-2.5">
      {rules.map((rule) => {
        const isOpen = open === rule.id;
        const panelId = `rule-${rule.id}`;
        return (
          <div
            key={rule.id}
            className={cn("overflow-hidden rounded-2xl border bg-card transition-colors", isOpen ? "border-primary/40" : "border-border/70")}
          >
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => {
                setOpen(isOpen ? null : rule.id);
                mark(rule.id);
              }}
              className="flex w-full items-center gap-3 p-4 text-start transition-colors hover:bg-muted/40"
            >
              <span
                className={cn(
                  "shrink-0 rounded-lg px-2 py-1 font-heading text-xs font-extrabold",
                  seen.has(rule.id) ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "bg-primary/10 text-primary",
                )}
              >
                {rule.id}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold leading-snug">{rule.title}</span>
                <span className="block text-xs text-muted-foreground">{rule.formula}</span>
              </span>
              <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
            </button>

            {isOpen && (
              <div id={panelId} className="space-y-4 border-t border-border/60 p-4">
                <p className="text-sm leading-relaxed">{rule.intro}</p>

                {rule.chips.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {rule.chips.map((c) => (
                      <Badge key={c} variant="outline" className="font-normal">
                        {c}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="grid gap-3 md:grid-cols-2">
                  {(["bad", "good"] as const).map((tone) => (
                    <div key={tone} className="space-y-1.5 rounded-2xl bg-muted/60 p-3.5">
                      <p
                        className={cn(
                          "mb-1 flex items-center gap-1.5 text-xs font-bold",
                          tone === "bad" ? "text-destructive" : "text-emerald-700 dark:text-emerald-400",
                        )}
                      >
                        {tone === "bad" ? <X className="size-3.5" /> : <Check className="size-3.5" />}
                        {t(tone === "bad" ? "rules.mistake" : "rules.fix")}
                      </p>
                      {rule[tone].map((line, i) => (
                        <Bubble key={i} side={line.side} label={line.side === "client" ? t("chat.client") : undefined}>
                          {line.text}
                        </Bubble>
                      ))}
                    </div>
                  ))}
                </div>

                <div className="rounded-xl border border-dashed border-primary/60 p-3.5">
                  <p className="font-heading text-base font-bold text-primary">{rule.formula}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{rule.note}</p>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── practice ────────────────────────────────────────────────────────────── */

/** A small seeded PRNG, so an attempt's option order is stable across renders (and server/client). */
function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let x = a;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffledOrder(length: number, seed: number) {
  const rand = seeded(seed);
  const order = Array.from({ length }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

export function PracticeModule({ scenarios, mark }: { scenarios: Scenario[] } & GateProps) {
  const { t } = useOrientationT();
  const [index, setIndex] = React.useState(0);
  const [picked, setPicked] = React.useState<Record<number, number>>({});
  const [attempt, setAttempt] = React.useState(1);

  const answered = Object.keys(picked).length;
  const correct = Object.entries(picked).filter(([qi, oi]) => scenarios[Number(qi)]?.options[oi]?.correct).length;
  const s = scenarios[index];
  if (!s) return null;
  const choice = picked[index];
  const done = choice !== undefined;
  // Option order is shuffled per attempt; the best reply isn't always in the same slot.
  const order = shuffledOrder(s.options.length, attempt * 7919 + index * 104729);

  const answer = (oi: number) => {
    if (done) return;
    setPicked((p) => ({ ...p, [index]: oi }));
    mark(`s:${index}`);
    track("orientation_practice_answered", { scenario: index + 1, correct: !!s.options[oi]?.correct });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <div className="flex flex-wrap gap-1.5" aria-hidden="true">
          {scenarios.map((sc, i) => {
            const p = picked[i];
            return (
              <span
                key={i}
                className={cn(
                  "h-1.5 w-6 rounded-full",
                  i === index
                    ? "bg-primary"
                    : p === undefined
                      ? "bg-border"
                      : sc.options[p]?.correct
                        ? "bg-emerald-500"
                        : "bg-destructive",
                )}
              />
            );
          })}
        </div>
        <span className="text-xs text-muted-foreground tabular-nums">
          {t("practice.situation", { i: index + 1, n: scenarios.length })} · {t("practice.correctCount", { x: correct, y: answered })}
        </span>
        {answered === scenarios.length && (
          <Button
            variant="ghost"
            size="sm"
            className="ms-auto gap-1.5"
            onClick={() => {
              setPicked({});
              setIndex(0);
              setAttempt((a) => a + 1);
            }}
          >
            <RotateCcw className="size-3.5" />
            {t("practice.retry")}
          </Button>
        )}
      </div>

      <div className="rounded-2xl bg-muted/60 p-3.5">
        <Bubble side="client" label={t("chat.client")}>
          {s.message}
        </Bubble>
      </div>

      <div className="space-y-2">
        {order.map((oi, position) => {
          const o = s.options[oi];
          const isChoice = choice === oi;
          // After answering, the correct option is always revealed — otherwise a wrong pick teaches only that it was wrong.
          const reveal = done && (isChoice || o.correct);
          return (
            <button
              key={`${attempt}-${oi}`}
              type="button"
              disabled={done}
              onClick={() => answer(oi)}
              className={cn(
                "grid w-full grid-cols-[1.75rem_1fr] items-start gap-2.5 rounded-xl border p-3 text-start text-sm leading-relaxed transition-colors",
                !done && "hover:border-primary/50 hover:bg-muted/40",
                reveal && o.correct && "border-emerald-500/60 bg-emerald-500/[0.08]",
                reveal && !o.correct && "border-destructive/60 bg-destructive/[0.07]",
                !reveal && "border-border/70",
                done && !reveal && "opacity-55",
              )}
            >
              <span
                className={cn(
                  "grid size-6 place-items-center rounded-md text-xs font-bold",
                  reveal && o.correct && "bg-emerald-500 text-white",
                  reveal && !o.correct && "bg-destructive text-white",
                  !reveal && "bg-muted text-muted-foreground",
                )}
              >
                {reveal ? o.correct ? <Check className="size-3.5" /> : <X className="size-3.5" /> : position + 1}
              </span>
              <span>
                {o.text}
                {reveal && <span className="mt-1.5 block text-[13px] text-muted-foreground">{o.feedback}</span>}
              </span>
            </button>
          );
        })}
      </div>

      {done && (
        <p className="flex flex-wrap items-center gap-2 text-sm" role="status">
          {/* The rule tag would give the answer away, so it only appears with the feedback. */}
          <Badge variant="secondary" className="font-mono text-[11px]">
            {s.tag}
          </Badge>
          <span className={s.options[choice]?.correct ? "font-semibold text-emerald-700 dark:text-emerald-400" : "font-semibold text-destructive"}>
            {s.options[choice]?.correct ? t("practice.correct") : t("practice.notQuite")}
          </span>
        </p>
      )}

      <div className="flex items-center justify-between gap-2">
        <Button variant="outline" size="sm" disabled={index === 0} onClick={() => setIndex((i) => i - 1)}>
          {t("nav.prev")}
        </Button>
        <Button
          variant={done ? "default" : "outline"}
          size="sm"
          disabled={index >= scenarios.length - 1}
          onClick={() => setIndex((i) => i + 1)}
        >
          {t("practice.nextSituation")}
        </Button>
      </div>
    </div>
  );
}

/* ── safer phrasing ──────────────────────────────────────────────────────── */

export function PhraseBankModule({ phrases, seen, mark }: { phrases: { risky: string; safe: string }[] } & GateProps) {
  const { t } = useOrientationT();
  const [flipped, setFlipped] = React.useState<Set<number>>(new Set());

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {phrases.map((p, i) => {
        const isSafe = flipped.has(i);
        return (
          <button
            key={i}
            type="button"
            aria-pressed={isSafe}
            onClick={() => {
              setFlipped((prev) => {
                const next = new Set(prev);
                if (next.has(i)) next.delete(i);
                else next.add(i);
                return next;
              });
              mark(`p:${i}`);
            }}
            className={cn(
              "flex min-h-[9rem] flex-col gap-2 rounded-2xl p-4 text-start transition-colors",
              isSafe ? "bg-emerald-500/[0.09] ring-1 ring-emerald-500/25" : "bg-destructive/[0.06] ring-1 ring-destructive/20",
            )}
          >
            <span
              className={cn(
                "inline-flex items-center gap-1.5 text-xs font-bold",
                isSafe ? "text-emerald-700 dark:text-emerald-400" : "text-destructive",
              )}
            >
              {isSafe ? <Check className="size-3.5" /> : <X className="size-3.5" />}
              {t(isSafe ? "phrases.instead" : "phrases.never")}
              {seen.has(`p:${i}`) && <Check className="size-3 text-emerald-600" aria-hidden="true" />}
            </span>
            <span className="flex-1 text-sm font-medium leading-relaxed">«{isSafe ? p.safe : p.risky}»</span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <RotateCcw className="size-3" />
              {t("phrases.tap")}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ── close with a next step ──────────────────────────────────────────────── */

export function ClosingModule({ closings, seen, mark }: { closings: { situation: string; text: string }[] } & GateProps) {
  const { t } = useOrientationT();
  const [active, setActive] = React.useState<number | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {closings.map((c, i) => (
          <button
            key={`${i}-${c.situation}`}
            type="button"
            aria-pressed={active === i}
            onClick={() => {
              setActive(i);
              mark(`c:${i}`);
            }}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-start text-sm transition-colors",
              active === i
                ? "border-primary bg-primary/[0.07] font-semibold text-primary"
                : "border-border/70 hover:border-primary/40",
            )}
          >
            {seen.has(`c:${i}`) && <span className="size-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden="true" />}
            {c.situation}
          </button>
        ))}
      </div>

      {active === null ? (
        <p className="rounded-2xl border border-border/70 p-4 text-sm text-muted-foreground">{t("closing.pick")}</p>
      ) : (
        <div className="space-y-3 rounded-2xl bg-primary/[0.06] p-4" aria-live="polite">
          <p className="text-xs font-bold text-muted-foreground">{closings[active].situation}</p>
          <p className="text-[15px] leading-relaxed">«{closings[active].text}»</p>
          <CopyButton text={closings[active].text} />
        </div>
      )}
    </div>
  );
}

/* ── tick-off checklists (before you send, first-week setup) ─────────────── */

export function TickList({
  items,
  prefix,
  seen,
  mark,
  renderExtra,
}: {
  items: { title: string; detail: string }[];
  /** Gate-key prefix, so two lists never share keys. */
  prefix: string;
  renderExtra?: (index: number) => React.ReactNode;
} & GateProps) {
  // Starts from the saved gate, so ticks survive a reload; unticking is visual only.
  const [ticked, setTicked] = React.useState<Set<number>>(
    () => new Set(items.map((_, i) => i).filter((i) => seen.has(`${prefix}:${i}`))),
  );

  return (
    <div className="space-y-2">
      {items.map((item, i) => {
        const on = ticked.has(i);
        return (
          <div
            key={i}
            className={cn(
              "flex items-start gap-3 rounded-xl border p-3.5 transition-colors",
              on ? "border-transparent bg-emerald-500/[0.08]" : "border-border/70",
            )}
          >
            <button
              type="button"
              role="checkbox"
              aria-checked={on}
              onClick={() => {
                setTicked((prev) => {
                  const next = new Set(prev);
                  if (next.has(i)) next.delete(i);
                  else next.add(i);
                  return next;
                });
                if (!on) mark(`${prefix}:${i}`);
              }}
              className="flex min-w-0 flex-1 items-start gap-3 text-start"
            >
              <span
                className={cn(
                  "mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border transition-colors",
                  on ? "border-emerald-500 bg-emerald-500 text-white" : "border-border bg-card",
                )}
              >
                {on && <Check className="size-3.5" />}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium">{item.title}</span>
                {item.detail && <span className="mt-0.5 block text-[13px] leading-relaxed text-muted-foreground">{item.detail}</span>}
              </span>
            </button>
            {renderExtra?.(i)}
          </div>
        );
      })}
      <p className="sr-only" aria-live="polite">
        {num(ticked.size)} / {num(items.length)}
      </p>
    </div>
  );
}

export function ChecklistModule({ items, seen, mark }: { items: { question: string; hint: string }[] } & GateProps) {
  return <TickList items={items.map((x) => ({ title: x.question, detail: x.hint }))} prefix="c" seen={seen} mark={mark} />;
}
