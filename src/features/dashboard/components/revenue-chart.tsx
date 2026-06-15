"use client";

import { useTranslations } from "next-intl";
import { TrendingUp } from "lucide-react";

import type { RevenuePoint } from "@/lib/db/platform";
import { formatCompact } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Props {
  data: RevenuePoint[];
}

const W = 820;
const H = 320;
const PAD = { top: 16, right: 14, bottom: 30, left: 52 };
const MAX_Y = 220000;
const Y_TICKS = [0, 55000, 110000, 165000, 220000];

/** Lightweight SVG area chart: MRR area+line over flat application/hire lines. */
export function RevenueChart({ data }: Props) {
  const t = useTranslations("Platform");
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const n = data.length;

  const x = (i: number) => PAD.left + (i / (n - 1)) * innerW;
  const y = (v: number) =>
    PAD.top + innerH - (Math.min(v, MAX_Y) / MAX_Y) * innerH;

  const line = (key: keyof RevenuePoint) =>
    data
      .map((d, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(d[key] as number)}`)
      .join(" ");

  const mrrArea =
    `${line("mrr")} L ${x(n - 1)} ${PAD.top + innerH} L ${x(0)} ${PAD.top + innerH} Z`;

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>{t("chartTitle")}</CardTitle>
            <CardDescription>{t("chartSub")}</CardDescription>
          </div>
          <Badge className="gap-1 border-transparent bg-success/12 text-success">
            <TrendingUp className="size-3.5" />
            {t("chartYoy")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-[300px] w-full"
          preserveAspectRatio="none"
          role="img"
          aria-label={t("chartTitle")}
        >
          <defs>
            <linearGradient id="mrrFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.22" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* horizontal gridlines + y labels */}
          {Y_TICKS.map((tick) => (
            <g key={tick}>
              <line
                x1={PAD.left}
                x2={W - PAD.right}
                y1={y(tick)}
                y2={y(tick)}
                stroke="var(--border)"
                strokeDasharray="4 4"
              />
              <text
                x={PAD.left - 8}
                y={y(tick) + 4}
                textAnchor="end"
                className="fill-muted-foreground text-[11px] tabular-nums"
              >
                {tick === 0 ? "0" : formatCompact(tick).replace("K", "000")}
              </text>
            </g>
          ))}

          {/* x labels */}
          {data.map((d, i) => (
            <text
              key={d.month}
              x={x(i)}
              y={H - 8}
              textAnchor="middle"
              className="fill-muted-foreground text-[11px]"
            >
              {d.month}
            </text>
          ))}

          {/* MRR area + line (primary) */}
          <path d={mrrArea} fill="url(#mrrFill)" />
          <path
            d={line("mrr")}
            fill="none"
            stroke="var(--primary)"
            strokeWidth={2.5}
            strokeLinejoin="round"
          />
          {/* applications (success) + hires (chart-4) — flat near baseline */}
          <path
            d={line("applications")}
            fill="none"
            stroke="var(--success)"
            strokeWidth={2}
          />
          <path
            d={line("hires")}
            fill="none"
            stroke="var(--chart-4)"
            strokeWidth={2}
          />
        </svg>

        {/* legend */}
        <div className="mt-2 flex flex-wrap items-center justify-center gap-5 text-xs text-muted-foreground">
          <Legend color="var(--success)" label={t("legendApplications")} />
          <Legend color="var(--chart-4)" label={t("legendHires")} />
          <Legend color="var(--primary)" label={t("legendMrr")} />
        </div>
      </CardContent>
    </Card>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-block size-2.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}
