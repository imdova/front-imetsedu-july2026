"use client";

import * as React from "react";
import { Check, MessageSquare } from "lucide-react";

import { cn } from "@/lib/utils";
import type { PathStep, SalesOrientation, Thread } from "@/features/orientation/lib/sales-orientation";
import { useOrientationT } from "@/features/orientation/lib/i18n";
import { Bubble, type GateProps } from "./lesson-parts";

/* ── See the difference ──────────────────────────────────────────────────── */

function ThreadView({ thread }: { thread: Thread }) {
  /*
   * Messages land one after another. The lesson is that the bad thread *feels*
   * like an interrogation — five questions arriving in a row does that, the
   * same five in a static block does not.
   */
  const [shown, setShown] = React.useState(0);

  React.useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const timers = thread.messages.map((_, i) => setTimeout(() => setShown(i + 1), reduce ? 0 : 260 * i));
    return () => timers.forEach(clearTimeout);
  }, [thread]);

  return (
    <div className="space-y-3">
      <div className="space-y-2 rounded-2xl bg-muted/60 p-3.5">
        {thread.messages.map((m, i) => (
          <div
            key={i}
            className={cn(
              "transition-all duration-300 motion-reduce:transition-none",
              i < shown ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
            )}
          >
            <Bubble side={m.from} label={m.from === "client" ? m.who : undefined}>
              {m.text}
            </Bubble>
          </div>
        ))}
      </div>

      <p
        className={cn(
          "rounded-xl p-3.5 text-sm leading-relaxed transition-opacity duration-500 motion-reduce:transition-none",
          shown >= thread.messages.length ? "opacity-100" : "opacity-0",
          thread.verdict.tone === "good"
            ? "bg-emerald-500/[0.09] ring-1 ring-emerald-500/20"
            : "bg-destructive/[0.07] ring-1 ring-destructive/20",
        )}
      >
        <b className="font-bold">{thread.verdict.lead}</b> {thread.verdict.rest}
      </p>
    </div>
  );
}

export function ContrastLesson({ threads, seen, mark }: { threads: SalesOrientation["threads"] } & GateProps) {
  const { t } = useOrientationT();
  const [tab, setTab] = React.useState<"bad" | "good">("bad");

  // The interrogation opens first, so it counts as seen from the outset.
  React.useEffect(() => {
    mark("bad");
  }, [mark]);

  return (
    <div className="space-y-4">
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <MessageSquare className="size-3.5" />
        {t("chat.whatsapp")}
      </p>

      <div className="inline-flex rounded-full border border-border/70 bg-muted p-1" role="group">
        {(["bad", "good"] as const).map((key) => (
          <button
            key={key}
            type="button"
            aria-pressed={tab === key}
            onClick={() => {
              setTab(key);
              mark(key);
            }}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors",
              tab === key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {seen.has(key) && <Check className="size-3.5 text-emerald-600" aria-hidden="true" />}
            {t(key === "bad" ? "contrast.bad" : "contrast.good")}
          </button>
        ))}
      </div>

      {/* Remounts on tab change so the reveal replays from the top. */}
      <ThreadView key={tab} thread={threads[tab]} />
    </div>
  );
}

/* ── The conversation path ───────────────────────────────────────────────── */

export function PathLesson({ steps, seen, mark }: { steps: PathStep[] } & GateProps) {
  const { t } = useOrientationT();
  const [active, setActive] = React.useState(0);

  React.useEffect(() => {
    mark("step:0");
  }, [mark]);

  return (
    <div className="space-y-3">
      <ol className="grid grid-cols-5 gap-1.5 sm:gap-2">
        {steps.map((s, i) => {
          const isActive = active === i;
          const key = `step:${i}`;
          return (
            <li key={`${i}-${s.title}`} className="min-w-0">
              <button
                type="button"
                aria-pressed={isActive}
                onClick={() => {
                  setActive(i);
                  mark(key);
                }}
                className={cn(
                  "flex h-full w-full flex-col gap-1 rounded-xl border p-2 text-center transition-colors sm:p-3 sm:text-start",
                  isActive
                    ? "border-primary bg-primary/[0.07]"
                    : seen.has(key)
                      ? "border-emerald-500/30 bg-emerald-500/[0.04]"
                      : "border-border/70 hover:border-primary/40",
                )}
              >
                <span className="flex items-center justify-center gap-1 text-[11px] font-semibold text-primary sm:justify-start">
                  {t("path.step", { n: i + 1 })}
                  {seen.has(key) && !isActive && <Check className="size-3 text-emerald-600" aria-hidden="true" />}
                </span>
                <span className="text-xs font-bold leading-snug sm:text-sm">{s.title}</span>
              </button>
            </li>
          );
        })}
      </ol>
      <p className="rounded-xl bg-muted/60 p-4 text-[15px] leading-relaxed" aria-live="polite">
        <b className="font-bold">
          {active + 1}. {steps[active]?.title}
        </b>
        <br />
        {steps[active]?.body}
      </p>
    </div>
  );
}
