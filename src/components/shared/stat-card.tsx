"use client";

import * as React from "react";
import { motion } from "motion/react";
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: string;
  delta?: number; // percentage change, signed
  deltaLabel?: string; // e.g. "vs last month" (localized by the caller)
  icon: LucideIcon;
  index?: number; // for staggered entrance
}

/** Headline metric card with a staggered entrance, hover lift and trend chip. */
export function StatCard({
  label,
  value,
  delta,
  deltaLabel,
  icon: Icon,
  index = 0,
}: StatCardProps) {
  const positive = (delta ?? 0) >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: "easeOut" }}
    >
      <Card className="card-interactive relative overflow-hidden">
        {/* faint brand wash in the corner */}
        <div
          aria-hidden
          className="pointer-events-none absolute -end-8 -top-10 size-28 rounded-full bg-primary/8 blur-2xl"
        />
        <CardContent className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="font-heading text-[1.7rem] leading-none font-semibold tabular-nums">
              {value}
            </p>
            {delta !== undefined && (
              <span className="inline-flex items-center gap-1 text-xs font-medium">
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5",
                    positive
                      ? "bg-success/12 text-success"
                      : "bg-destructive/12 text-destructive",
                  )}
                >
                  {positive ? (
                    <ArrowUpRight className="size-3" />
                  ) : (
                    <ArrowDownRight className="size-3" />
                  )}
                  {Math.abs(delta)}%
                </span>
                {deltaLabel && (
                  <span className="text-muted-foreground">{deltaLabel}</span>
                )}
              </span>
            )}
          </div>
          <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary ring-1 ring-primary/10">
            <Icon className="size-5" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
