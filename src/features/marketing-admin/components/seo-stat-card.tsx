import * as React from "react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Tint = "amber" | "emerald" | "blue" | "rose" | "violet";

const TINT: Record<Tint, string> = {
  amber: "bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
  emerald: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
  blue: "bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",
  rose: "bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400",
  violet: "bg-violet-100 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400",
};

/** Compact metric card — big value with a tinted icon tile in the top corner. */
export function SeoStatCard({
  label,
  value,
  sub,
  icon: Icon,
  tint = "blue",
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  icon: React.ElementType;
  tint?: Tint;
}) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3 p-5">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-2 font-heading text-2xl font-bold tabular-nums">{value}</p>
          {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
        </div>
        <span className={cn("grid size-9 shrink-0 place-items-center rounded-lg", TINT[tint])}>
          <Icon className="size-4.5" />
        </span>
      </CardContent>
    </Card>
  );
}
