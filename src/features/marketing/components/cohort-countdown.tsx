"use client";

import * as React from "react";

/** One tick a second; the server (and the hydration pass) has no clock to show. */
const subscribe = (onTick: () => void) => {
  const id = window.setInterval(onTick, 1000);
  return () => window.clearInterval(id);
};
const nowSeconds = () => Math.floor(Date.now() / 1000);
const serverSnapshot = (): number | null => null;

export interface CohortCountdownLabels {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
  /** Shown instead of the boxes once the start time has passed. */
  started: string;
}

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Live countdown to a real cohort start.
 *
 * The time comes from the visitor's clock, so the server renders "--" boxes and
 * the real digits arrive after hydration (`useSyncExternalStore` with a null
 * server snapshot — no hydration mismatch, and no effect that sets state).
 * The page itself is cached, so a cohort can pass while the HTML is still
 * served; at zero the boxes give way to a plain "starting now" line.
 */
export function CohortCountdown({ target, labels }: { target: string; labels: CohortCountdownLabels }) {
  const now = React.useSyncExternalStore(subscribe, nowSeconds, serverSnapshot);
  const targetSeconds = Math.floor(Date.parse(target) / 1000);

  if (now !== null && Number.isFinite(targetSeconds) && targetSeconds <= now) {
    return <p className="text-sm font-semibold text-[#0a2f7a]">{labels.started}</p>;
  }

  const left = now === null || !Number.isFinite(targetSeconds) ? null : targetSeconds - now;
  const parts: [string, string][] = [
    [left === null ? "--" : pad(Math.floor(left / 86400)), labels.days],
    [left === null ? "--" : pad(Math.floor((left % 86400) / 3600)), labels.hours],
    [left === null ? "--" : pad(Math.floor((left % 3600) / 60)), labels.minutes],
    [left === null ? "--" : pad(left % 60), labels.seconds],
  ];

  return (
    // Digits always read left-to-right, in Arabic too.
    <div dir="ltr" className="flex items-start gap-2" role="timer" aria-label={parts.map(([v, l]) => `${v} ${l}`).join(" ")}>
      {parts.map(([value, label]) => (
        <div key={label} className="flex min-w-[3.25rem] flex-col items-center rounded-xl border border-blue-100 bg-white px-2 py-2 shadow-sm">
          <span className="font-heading text-xl font-extrabold leading-none tabular-nums text-[#0a2f7a]">{value}</span>
          <span className="mt-1 text-[10px] font-semibold text-slate-500">{label}</span>
        </div>
      ))}
    </div>
  );
}
