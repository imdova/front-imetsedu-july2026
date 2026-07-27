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
    <div className="inline-flex items-center gap-3 rounded-xl border border-[#f4c430]/40 bg-[#f4c430]/10 px-4 py-2.5">
      <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#8a6d00]">
        <Clock className="size-4" /> {label}
      </span>
      <span dir="ltr" className="flex items-center gap-1 font-mono text-2xl font-extrabold tabular-nums text-[#0a1424]">
        <Box>{pad(hh)}</Box><Colon /><Box>{pad(mm)}</Box><Colon /><Box>{pad(ss)}</Box>
      </span>
    </div>
  );
}

function Box({ children }: { children: React.ReactNode }) {
  return <span className="rounded-md bg-[#0a1424] px-2.5 py-1 text-white">{children}</span>;
}
function Colon() {
  return <span className="text-[#0a1424]">:</span>;
}
