"use client";

import { motion } from "motion/react";
import { TrendingUp, TrendingDown } from "lucide-react";

import type { Kpi, Tone } from "@/lib/db/platform";
import { cn } from "@/lib/utils";
import { getIcon } from "@/components/layout/icon-map";

const TONES: Record<Tone, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/12 text-success",
  info: "bg-chart-3/15 text-chart-3",
  warning: "bg-warning/18 text-warning",
  danger: "bg-destructive/12 text-destructive",
};

interface KpiCardProps {
  kpi: Kpi;
  label: string;
  sub?: string;
  vsLabel: string;
  index?: number;
}

/** A single KPI tile — uppercase label, big value, tinted icon, optional trend. */
export function KpiCard({ kpi, label, sub, vsLabel, index = 0 }: KpiCardProps) {
  const Icon = getIcon(kpi.icon);
  const positive = (kpi.delta ?? 0) >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04, ease: "easeOut" }}
      className="rounded-xl border border-border/70 bg-card p-5 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <span
          className={cn(
            "grid size-9 shrink-0 place-items-center rounded-lg",
            TONES[kpi.tone],
          )}
        >
          {/* getIcon is a lookup in a module-level record: an existing component
              with a stable identity, not one created per render, so it cannot
              remount. The rule can't see through the lookup. */}
          {/* eslint-disable-next-line react-hooks/static-components */}
          <Icon className="size-[18px]" />
        </span>
      </div>

      <p className="mt-3 font-heading text-3xl font-semibold tabular-nums">
        {kpi.value}
      </p>

      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}

      {kpi.delta !== undefined && (
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-medium",
              positive
                ? "bg-success/12 text-success"
                : "bg-destructive/12 text-destructive",
            )}
          >
            {positive ? (
              <TrendingUp className="size-3" />
            ) : (
              <TrendingDown className="size-3" />
            )}
            {Math.abs(kpi.delta)}%
          </span>
          <span className="text-muted-foreground">{vsLabel}</span>
        </div>
      )}
    </motion.div>
  );
}
