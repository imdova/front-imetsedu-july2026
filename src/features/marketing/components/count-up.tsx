"use client";

import * as React from "react";

/**
 * Animates a stat value from 0 → target when it scrolls into view. Preserves any
 * non-numeric prefix/suffix ("+", "%", " weeks", thousands commas), e.g.
 * "+3,200" counts up to "+3,200" and "10 weeks" to "10 weeks".
 */
export function CountUp({ value, className }: { value: string; className?: string }) {
  const m = value.match(/^(\D*)([\d.,]+)(.*)$/);
  const prefix = m?.[1] ?? "";
  const numStr = m?.[2] ?? "";
  const suffix = m?.[3] ?? "";
  const target = parseFloat(numStr.replace(/,/g, ""));
  const decimals = numStr.includes(".") ? (numStr.split(".")[1]?.length ?? 0) : 0;
  const grouped = numStr.includes(",");

  const ref = React.useRef<HTMLSpanElement>(null);
  const [n, setN] = React.useState(0);
  const done = React.useRef(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el || Number.isNaN(target)) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || done.current) return;
        done.current = true;
        const duration = 1400;
        const start = performance.now();
        const step = (t: number) => {
          const p = Math.min(1, (t - start) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          setN(target * eased);
          if (p < 1) requestAnimationFrame(step);
          else setN(target);
        };
        requestAnimationFrame(step);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [target]);

  const fmt = (x: number) => {
    const rounded = decimals ? x.toFixed(decimals) : String(Math.round(x));
    return grouped ? Number(rounded).toLocaleString("en-US") : rounded;
  };

  return (
    <span ref={ref} className={className}>
      {Number.isNaN(target) ? value : `${prefix}${fmt(n)}${suffix}`}
    </span>
  );
}
