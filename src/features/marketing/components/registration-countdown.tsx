"use client";

import * as React from "react";
import { Clock } from "lucide-react";

/**
 * Evergreen registration countdown. On first visit it anchors a deadline
 * (default 24h) in localStorage so it keeps ticking across refreshes, and
 * re-arms when it hits zero. Renders nothing on the server to avoid a hydration
 * mismatch (the value depends on the client clock).
 */
export function RegistrationCountdown({ hours = 24, storageKey = "imets_reg_deadline_cphq", label = "ينتهي التسجيل خلال:" }: { hours?: number; storageKey?: string; label?: string }) {
  const [remaining, setRemaining] = React.useState<number | null>(null);

  React.useEffect(() => {
    const arm = () => Date.now() + hours * 3600 * 1000;
    let deadline = Number(localStorage.getItem(storageKey));
    if (!deadline || deadline < Date.now()) { deadline = arm(); localStorage.setItem(storageKey, String(deadline)); }
    const tick = () => {
      let r = deadline - Date.now();
      if (r <= 0) { deadline = arm(); localStorage.setItem(storageKey, String(deadline)); r = deadline - Date.now(); }
      setRemaining(r);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [hours, storageKey]);

  if (remaining == null) return null;
  const total = Math.floor(remaining / 1000);
  const hh = Math.floor(total / 3600);
  const mm = Math.floor((total % 3600) / 60);
  const ss = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="inline-flex flex-col gap-2 rounded-2xl border border-[#f4c430]/50 bg-[#f4c430]/10 px-4 py-3">
      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8a6d00]">
        <Clock className="size-3.5" /> {label}
      </span>
      <span dir="ltr" className="flex items-end gap-1.5">
        <Unit value={pad(hh)} label="Hrs" />
        <Sep />
        <Unit value={pad(mm)} label="Min" />
        <Sep />
        <Unit value={pad(ss)} label="Sec" />
      </span>
    </div>
  );
}

function Unit({ value, label }: { value: string; label: string }) {
  return (
    <span className="flex flex-col items-center">
      <span className="grid min-w-[42px] place-items-center rounded-lg bg-white px-2 py-1.5 font-mono text-xl font-extrabold tabular-nums text-primary shadow-sm ring-1 ring-black/5">
        {value}
      </span>
      <span className="mt-1 text-[9px] font-semibold uppercase tracking-wider text-[#8a6d00]/80">{label}</span>
    </span>
  );
}
function Sep() {
  return <span className="pb-5 font-mono text-lg font-extrabold text-[#8a6d00]/50">:</span>;
}
