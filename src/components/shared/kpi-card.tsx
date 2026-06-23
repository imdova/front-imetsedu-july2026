"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

export type KpiIntent =
  | "primary"
  | "success"
  | "info"
  | "warning"
  | "destructive";

interface KpiCardProps {
  label: string;
  value: React.ReactNode;
  icon: LucideIcon;
  intent?: KpiIntent;
  helperText?: string;
  className?: string;
}

const INTENT: Record<KpiIntent, string> = {
  primary: "bg-primary/12 text-primary ring-primary/15",
  success: "bg-success/12 text-success ring-success/15",
  info: "bg-info/12 text-info ring-info/15",
  warning: "bg-warning/12 text-warning ring-warning/15",
  destructive: "bg-destructive/12 text-destructive ring-destructive/15",
};

/**
 * Compact stat tile used across the Marketing section — a colored icon chip,
 * a big value and an optional helper line. Marketing pages render rows of 3–5.
 */
export function KpiCard({
  label,
  value,
  icon: Icon,
  intent = "primary",
  helperText,
  className,
}: KpiCardProps) {
  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardContent className="flex items-start justify-between gap-3">
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="font-heading text-2xl leading-none font-semibold tabular-nums">
            {value}
          </p>
          {helperText && (
            <p className="text-xs text-muted-foreground">{helperText}</p>
          )}
        </div>
        <div
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-xl ring-1",
            INTENT[intent],
          )}
        >
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}
