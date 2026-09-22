"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Small hand-rolled SVG charts for the admin insight pages. The app has no
 * charting library, so these follow the pattern used by the dashboard's own
 * charts — plain SVG, CSS variables for colour, and no runtime dependency.
 */

export interface TrendPoint {
  date: string;
  [key: string]: string | number;
}

export interface TrendSeries {
  key: string;
  label: string;
  /** Any CSS colour, e.g. "var(--primary)". */
  color: string;
  /** Show as a filled area (the first series usually). */
  area?: boolean;
  /** Format for the tooltip and axis, e.g. currency. */
  format?: (v: number) => string;
}

const PAD = { top: 12, right: 8, bottom: 20, left: 8 };
const W = 720;
const H = 200;

const niceMax = (v: number) => {
  if (v <= 5) return 5;
  const pow = 10 ** Math.floor(Math.log10(v));
  return Math.ceil(v / pow) * pow;
};

const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

/** A line/area chart over a daily series, with a hover readout. */
export function TrendChart({
  data,
  series,
  height = H,
  className,
  emptyLabel = "No activity in this period",
}: {
  data: TrendPoint[];
  series: TrendSeries[];
  height?: number;
  className?: string;
  emptyLabel?: string;
}) {
  const [hover, setHover] = React.useState<number | null>(null);
  const svgRef = React.useRef<SVGSVGElement>(null);

  const max = React.useMemo(() => {
    const values = data.flatMap((d) => series.map((s) => Number(d[s.key]) || 0));
    return niceMax(Math.max(1, ...values));
  }, [data, series]);

  const hasData = data.some((d) => series.some((s) => Number(d[s.key]) > 0));
  const innerW = W - PAD.left - PAD.right;
  const innerH = height - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (data.length <= 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
  const y = (v: number) => PAD.top + innerH - (Math.min(v, max) / max) * innerH;

  const path = (key: string, close: boolean) => {
    const points = data.map((d, i) => `${x(i)},${y(Number(d[key]) || 0)}`);
    if (!points.length) return "";
    const line = `M${points.join(" L")}`;
    return close ? `${line} L${x(data.length - 1)},${PAD.top + innerH} L${x(0)},${PAD.top + innerH} Z` : line;
  };

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect || data.length === 0) return;
    const ratio = (e.clientX - rect.left) / rect.width;
    const i = Math.round(ratio * (W - 1) - PAD.left) / innerW;
    setHover(Math.max(0, Math.min(data.length - 1, Math.round(i * (data.length - 1)))));
  };

  const active = hover !== null ? data[hover] : null;

  return (
    <div className={cn("relative", className)}>
      <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
        {series.map((s) => (
          <span key={s.key} className="inline-flex items-center gap-1.5 text-muted-foreground">
            <span className="size-2 rounded-full" style={{ background: s.color }} />
            {s.label}
            {active && (
              <b className="font-semibold text-foreground tabular-nums">
                {s.format ? s.format(Number(active[s.key]) || 0) : Number(active[s.key]) || 0}
              </b>
            )}
          </span>
        ))}
        <span className="ms-auto text-muted-foreground tabular-nums">{active ? shortDate(String(active.date)) : `max ${max}`}</span>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${height}`}
        className="w-full touch-none"
        style={{ height }}
        role="img"
        aria-label={series.map((s) => s.label).join(", ")}
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
      >
        {[0, 0.5, 1].map((t) => (
          <line
            key={t}
            x1={PAD.left}
            x2={W - PAD.right}
            y1={PAD.top + innerH * t}
            y2={PAD.top + innerH * t}
            stroke="var(--border)"
            strokeDasharray={t === 1 ? undefined : "3 4"}
          />
        ))}

        {series.map((s) => (
          <g key={s.key}>
            {s.area && <path d={path(s.key, true)} fill={s.color} opacity={0.12} />}
            <path d={path(s.key, false)} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          </g>
        ))}

        {active && hover !== null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={PAD.top + innerH} stroke="var(--border)" />
            {series.map((s) => (
              <circle key={s.key} cx={x(hover)} cy={y(Number(active[s.key]) || 0)} r={3.5} fill={s.color} stroke="var(--card)" strokeWidth={1.5} />
            ))}
          </g>
        )}

        {data.length > 1 && (
          <>
            <text x={PAD.left} y={height - 4} fontSize={11} fill="var(--muted-foreground)">
              {shortDate(String(data[0].date))}
            </text>
            <text x={W - PAD.right} y={height - 4} fontSize={11} textAnchor="end" fill="var(--muted-foreground)">
              {shortDate(String(data[data.length - 1].date))}
            </text>
          </>
        )}
      </svg>

      {!hasData && (
        <p className="pointer-events-none absolute inset-0 grid place-items-center text-sm text-muted-foreground">{emptyLabel}</p>
      )}
    </div>
  );
}

/** A ranked horizontal bar list — stages, sources, actions. */
export function BarList({
  items,
  color = "var(--primary)",
  max: maxProp,
  format,
  emptyLabel = "Nothing yet",
  className,
}: {
  items: { name: string; value: number }[];
  color?: string;
  max?: number;
  format?: (v: number) => string;
  emptyLabel?: string;
  className?: string;
}) {
  if (items.length === 0) return <p className={cn("text-sm text-muted-foreground", className)}>{emptyLabel}</p>;
  const max = maxProp ?? Math.max(...items.map((i) => i.value), 1);
  return (
    <ul className={cn("space-y-2.5", className)}>
      {items.map((item) => (
        <li key={item.name}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate capitalize">{item.name.replace(/_/g, " ")}</span>
            <span className="shrink-0 font-semibold tabular-nums">{format ? format(item.value) : item.value}</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full" style={{ width: `${(item.value / max) * 100}%`, background: color }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** A donut showing one share, e.g. conversion rate. */
export function DonutStat({
  percent,
  label,
  sublabel,
  color = "var(--primary)",
  size = 132,
}: {
  percent: number;
  label: string;
  sublabel?: string;
  color?: string;
  size?: number;
}) {
  const clamped = Math.max(0, Math.min(100, percent));
  const r = size / 2 - 10;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-2">
      <svg viewBox={`0 0 ${size} ${size}`} style={{ width: size, height: size }} role="img" aria-label={`${label}: ${clamped}%`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--muted)" strokeWidth={10} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={`${(clamped / 100) * c} ${c}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text x="50%" y="48%" textAnchor="middle" fontSize={22} fontWeight={700} fill="currentColor" className="tabular-nums">
          {clamped}%
        </text>
        <text x="50%" y="64%" textAnchor="middle" fontSize={11} fill="var(--muted-foreground)">
          {label}
        </text>
      </svg>
      {sublabel && <p className="text-xs text-muted-foreground">{sublabel}</p>}
    </div>
  );
}
