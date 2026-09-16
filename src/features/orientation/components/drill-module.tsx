"use client";

import * as React from "react";
import { Check, RefreshCw } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Objection } from "@/features/orientation/lib/sales-orientation";
import { num, useOrientationT } from "@/features/orientation/lib/i18n";
import { track } from "@/features/orientation/lib/track";
import type { GateProps } from "./lesson-parts";

/**
 * Rapid objection drill.
 *
 * A random objection appears and a 45-second countdown starts. The rep answers
 * out loud, reveals the model reply, then says honestly whether they applied
 * all four steps. Reading the bank teaches recognition; this is the part that
 * rehearses answering under time pressure. The clock turns red under ten
 * seconds but never cuts the rep off — a considered answer beats a fast one.
 */

const SECONDS = 45;

export function DrillModule({ objections, seen, mark }: { objections: Objection[] } & GateProps) {
  const { t } = useOrientationT();
  const [current, setCurrent] = React.useState<number | null>(null);
  const [left, setLeft] = React.useState(SECONDS);
  const [running, setRunning] = React.useState(false);
  const [revealed, setRevealed] = React.useState(false);
  const [rated, setRated] = React.useState(false);
  const [rounds, setRounds] = React.useState(0);
  const [applied, setApplied] = React.useState(0);

  React.useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [running]);

  const next = () => {
    // Never the same objection twice running, so the drill can't be gamed.
    let i = Math.floor(Math.random() * objections.length);
    if (objections.length > 1) while (i === current) i = Math.floor(Math.random() * objections.length);
    setCurrent(i);
    setLeft(SECONDS);
    setRunning(true);
    setRevealed(false);
    setRated(false);
  };

  const rate = (didApply: boolean) => {
    if (rated) return;
    setRated(true);
    setRounds((n) => n + 1);
    if (didApply) setApplied((n) => n + 1);
    // Keys count rounds across visits; `seen` already holds earlier ones.
    const done = [...seen].filter((k) => k.startsWith("r:")).length;
    mark(`r:${done + 1}`);
    track("orientation_drill_round", { applied: didApply });
  };

  const o = current === null ? null : objections[current];

  return (
    <div className="grid justify-items-center gap-4 rounded-2xl border border-border/70 p-5 text-center">
      <p
        className={cn("font-heading text-5xl font-extrabold tabular-nums", left <= 10 && running && "text-destructive")}
        aria-live="off"
        dir="ltr"
      >
        00:{String(left).padStart(2, "0")}
      </p>
      <p className="text-sm text-muted-foreground tabular-nums">
        {t("drill.rounds")}: {num(rounds)} · {t("drill.applied")}: {num(applied)}
      </p>

      {o ? (
        <p className="max-w-[40ch] font-heading text-xl font-bold leading-snug">«{o.objection}»</p>
      ) : (
        <p className="text-sm text-muted-foreground">{t("drill.start")}</p>
      )}

      {o && revealed && (
        <div className="grid w-full max-w-[60ch] gap-3 text-start">
          <p className="rounded-xl bg-emerald-500/[0.09] p-3.5 text-sm leading-relaxed">{o.right}</p>
          {!rated && (
            <>
              <p className="text-center text-sm font-semibold">{t("drill.question")}</p>
              <div className="flex flex-wrap justify-center gap-2">
                <Button size="sm" className="gap-1.5" onClick={() => rate(true)}>
                  <Check className="size-3.5" />
                  {t("drill.yes")}
                </Button>
                <Button size="sm" variant="outline" onClick={() => rate(false)}>
                  {t("drill.notYet")}
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-2">
        {(!o || rated) && (
          <Button onClick={next} className="gap-1.5">
            <RefreshCw className="size-4" />
            {t("drill.new")}
          </Button>
        )}
        {o && !revealed && (
          <Button
            variant="outline"
            onClick={() => {
              setRunning(false);
              setRevealed(true);
            }}
          >
            {t("drill.reveal")}
          </Button>
        )}
      </div>
    </div>
  );
}
