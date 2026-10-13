"use client";

import * as React from "react";

/** Live countdown to a target datetime. Client island used by the block
 *  renderer (which is otherwise a server component). Renders a stable
 *  placeholder until mounted to avoid hydration mismatch. */
function remaining(target: number) {
  const diff = Math.max(0, target - Date.now());
  const s = Math.floor(diff / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    done: diff === 0,
  };
}

export function CountdownBlock({ date, label }: { date?: string; label?: string }) {
  const target = date ? new Date(date).getTime() : NaN;
  const valid = Number.isFinite(target);
  const [t, setT] = React.useState<ReturnType<typeof remaining> | null>(null);

  React.useEffect(() => {
    if (!valid) return;
    setT(remaining(target));
    const id = setInterval(() => setT(remaining(target)), 1000);
    return () => clearInterval(id);
  }, [target, valid]);

  const units: { value: number; label: string }[] = [
    { value: t?.days ?? 0, label: "Days" },
    { value: t?.hours ?? 0, label: "Hours" },
    { value: t?.minutes ?? 0, label: "Minutes" },
    { value: t?.seconds ?? 0, label: "Seconds" },
  ];

  return (
    <div className="rounded-3xl bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-6 text-center ring-1 ring-primary/10 sm:p-8">
      {label && (
        <p className="mb-4 font-heading text-lg font-semibold text-foreground">{label}</p>
      )}
      <div className="mx-auto grid max-w-md grid-cols-4 gap-2 sm:gap-3">
        {units.map((u) => (
          <div
            key={u.label}
            className="rounded-2xl border border-border/60 bg-card/70 p-3 shadow-sm sm:p-4"
          >
            <div className="font-heading text-2xl font-bold tabular-nums text-primary sm:text-3xl">
              {t ? String(u.value).padStart(2, "0") : "--"}
            </div>
            <div className="mt-1 text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">
              {u.label}
            </div>
          </div>
        ))}
      </div>
      {t?.done && (
        <p className="mt-4 text-sm font-medium text-primary">This countdown has ended.</p>
      )}
      {!valid && (
        <p className="mt-4 text-sm text-muted-foreground">Set a target date for this countdown.</p>
      )}
    </div>
  );
}
