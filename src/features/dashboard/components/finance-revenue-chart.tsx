"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ArrowUpRight, ArrowDownRight, TrendingUp, Loader2 } from "lucide-react";

import { dal } from "@/lib/dal";
import type { RevenueTrend } from "@/lib/dal/platform";
import { cn } from "@/lib/utils";

const DAYS = [7, 30, 90];

/** Build a continuous daily series (fills missing days with 0) from the sparse API points. */
function fillSeries(trend: RevenueTrend): { date: Date; revenue: number }[] {
  const map = new Map(trend.points.map((p) => [p.date, p.revenue]));
  const out: { date: Date; revenue: number }[] = [];
  const now = new Date();
  const todayUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  for (let i = trend.days - 1; i >= 0; i--) {
    const t = todayUTC - i * 86400000;
    const d = new Date(t);
    const key = d.toISOString().slice(0, 10);
    out.push({ date: d, revenue: map.get(key) ?? 0 });
  }
  return out;
}

const fmtMoney = (n: number, currency: string) => {
  const sym = currency === "USD" ? "$" : "";
  const suffix = currency === "USD" ? "" : ` ${currency}`;
  return `${sym}${Math.round(n).toLocaleString()}${suffix}`;
};
const fmtCompact = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`;
  return `${Math.round(n)}`;
};
const fmtDay = (d: Date) => d.toLocaleDateString(undefined, { month: "short", day: "numeric" });

// SVG geometry
const W = 820;
const H = 230;
const PAD = { top: 24, right: 16, bottom: 26, left: 16 };

export function FinanceRevenueChart({
  initial,
  initialDays = 30,
}: {
  initial: RevenueTrend | null;
  initialDays?: number;
}) {
  const t = useTranslations("Platform");
  const [days, setDays] = React.useState(initialDays);
  const [trend, setTrend] = React.useState<RevenueTrend | null>(initial);
  const [loading, setLoading] = React.useState(false);
  const skipInitial = React.useRef(true);
  const [hover, setHover] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (skipInitial.current) { skipInitial.current = false; return; }
    let cancelled = false;
    setLoading(true);
    dal.platform.fetchRevenueTrend(days).then((res) => {
      if (cancelled) return;
      if (res.ok) setTrend(res.data);
      else toast.error(res.error);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [days]);

  const currency = trend?.currency ?? "USD";
  const series = React.useMemo(() => (trend ? fillSeries(trend) : []), [trend]);
  const values = series.map((s) => s.revenue);
  const total = values.reduce((a, b) => a + b, 0);
  const peak = values.length ? Math.max(...values) : 0;
  const avg = values.length ? total / values.length : 0;
  const activeDays = values.filter((v) => v > 0).length;

  // momentum: 2nd half vs 1st half
  const half = Math.floor(values.length / 2);
  const firstHalf = values.slice(0, half).reduce((a, b) => a + b, 0);
  const secondHalf = values.slice(half).reduce((a, b) => a + b, 0);
  const delta = firstHalf > 0 ? Math.round(((secondHalf - firstHalf) / firstHalf) * 100) : null;
  const up = (delta ?? 0) >= 0;

  // geometry
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const n = series.length;
  const maxY = Math.max(peak, 1);
  const x = (i: number) => PAD.left + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW);
  const y = (v: number) => PAD.top + innerH - (v / maxY) * innerH;

  const linePath = series.map((s, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(s.revenue).toFixed(1)}`).join(" ");
  const areaPath = n ? `${linePath} L ${x(n - 1).toFixed(1)} ${PAD.top + innerH} L ${x(0).toFixed(1)} ${PAD.top + innerH} Z` : "";

  const activeIdx = hover ?? (n - 1);
  const node = n ? { x: x(activeIdx), y: y(series[activeIdx].revenue), v: series[activeIdx].revenue, d: series[activeIdx].date } : null;

  // x-axis labels — ~5 evenly spaced
  const labelIdxs = n ? Array.from(new Set([0, Math.floor(n * 0.25), Math.floor(n * 0.5), Math.floor(n * 0.75), n - 1])) : [];

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!n) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const i = Math.round(((px - PAD.left) / innerW) * (n - 1));
    setHover(Math.max(0, Math.min(n - 1, i)));
  };

  const hasData = total > 0;

  return (
    <div className="relative h-full overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(120%_120%_at_100%_0%,#1e3a5f_0%,#0f2038_45%,#0a1628_100%)] p-5 text-white shadow-lg sm:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-white/50">{t("finRevenue")}</p>
          <div className="mt-1 flex items-baseline gap-2.5">
            <span className="text-3xl font-bold tracking-tight tabular-nums">{fmtMoney(total, currency)}</span>
            {delta !== null && (
              <span className={cn("inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold", up ? "bg-emerald-400/15 text-emerald-300" : "bg-rose-400/15 text-rose-300")}>
                {up ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
                {Math.abs(delta)}%
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-white/45">{fmtMoney(avg, currency)} {t("finPerDay")} · {currency} · {t("finCaption")}</p>
        </div>
        <div className="inline-flex items-center gap-1 rounded-xl bg-white/10 p-1">
          {loading && <Loader2 className="ms-1 size-3.5 animate-spin text-white/60" />}
          {DAYS.map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={cn("rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors", days === d ? "bg-white/90 text-slate-900" : "text-white/60 hover:text-white")}
            >
              {d}D
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="relative mt-3">
        {!hasData ? (
          <div className="flex h-[190px] flex-col items-center justify-center gap-2 text-center text-white/50">
            <TrendingUp className="size-7 opacity-40" />
            <p className="text-sm">{t("finEmpty")}</p>
          </div>
        ) : (
          <svg viewBox={`0 0 ${W} ${H}`} className="h-[190px] w-full" preserveAspectRatio="none" onMouseMove={onMove} onMouseLeave={() => setHover(null)} role="img" aria-label={t("finRevenue")}>
            <defs>
              <linearGradient id="finFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0" />
              </linearGradient>
              <filter id="finGlow" x="-20%" y="-40%" width="140%" height="180%">
                <feGaussianBlur stdDeviation="4" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            <path d={areaPath} fill="url(#finFill)" />
            <path d={linePath} fill="none" stroke="#5eead4" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" filter="url(#finGlow)" />

            {/* x labels */}
            {labelIdxs.map((i) => (
              <text key={i} x={x(i)} y={H - 6} textAnchor={i === 0 ? "start" : i === n - 1 ? "end" : "middle"} className="fill-white/40 text-[11px]">
                {fmtDay(series[i].date)}
              </text>
            ))}

            {/* active marker */}
            {node && (
              <g>
                <line x1={node.x} x2={node.x} y1={node.y} y2={PAD.top + innerH} stroke="#5eead4" strokeOpacity="0.35" strokeDasharray="3 3" />
                <circle cx={node.x} cy={node.y} r={7} fill="#2dd4bf" fillOpacity="0.25" />
                <circle cx={node.x} cy={node.y} r={4} fill="#0a1628" stroke="#5eead4" strokeWidth={2.5} />
                <g transform={`translate(${Math.max(PAD.left + 44, Math.min(W - PAD.right - 44, node.x))}, ${Math.max(16, node.y - 14)})`}>
                  <rect x={-42} y={-15} width={84} height={22} rx={6} fill="#0a1628" stroke="#ffffff" strokeOpacity="0.12" />
                  <text x={0} y={0} textAnchor="middle" className="fill-white text-[11px] font-semibold tabular-nums">{fmtMoney(node.v, currency)}</text>
                </g>
              </g>
            )}
          </svg>
        )}
      </div>

      {/* Stats strip */}
      <div className="mt-4 grid grid-cols-2 gap-y-3 border-t border-white/10 pt-4 sm:grid-cols-4">
        <Stat label={t("finTotal")} value={fmtMoney(total, currency)} />
        <Stat label={t("finPeak")} value={fmtMoney(peak, currency)} />
        <Stat label={t("finAvg")} value={`${currency === "USD" ? "$" : ""}${fmtCompact(avg)}${currency === "USD" ? "" : ` ${currency}`}`} />
        <Stat label={t("finActive")} value={`${activeDays} / ${n}`} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="truncate text-[11px] uppercase tracking-wide text-white/40">{label}</p>
      <p className="mt-0.5 truncate text-sm font-semibold tabular-nums text-white/90">{value}</p>
    </div>
  );
}
