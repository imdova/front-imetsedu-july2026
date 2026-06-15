"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";

import type { InstallmentLine } from "@/lib/db/student";
import { cn, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const STATUS: Record<string, { key: string; style: string }> = {
  PAID: { key: "instPaid", style: "bg-success/15 text-success" },
  DUE: { key: "instDue", style: "bg-warning/18 text-warning" },
  SCHEDULED: { key: "instScheduled", style: "bg-muted text-muted-foreground" },
};

export function InstallmentsView({ items }: { items: InstallmentLine[] }) {
  const t = useTranslations("Student");
  const tf = useTranslations("Finance");
  const paid = items.filter((i) => i.status === "PAID").reduce((s, i) => s + i.amount, 0);
  const total = items.reduce((s, i) => s + i.amount, 0);

  return (
    <div className="space-y-5">
      <Card>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{tf("kpiCollected")}</span>
            <span className="font-medium tabular-nums">{formatCurrency(paid, "EGP")} / {formatCurrency(total, "EGP")}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-muted"><div className="h-full bg-success" style={{ width: `${Math.round((paid / total) * 100)}%` }} /></div>
        </CardContent>
      </Card>

      <div className="space-y-2.5">
        {items.map((i) => (
          <div key={i.index} className="flex items-center gap-4 rounded-xl border border-border/70 bg-card p-4 shadow-sm">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 font-semibold text-primary tabular-nums">{i.index}</span>
            <div className="min-w-0 flex-1">
              <p className="font-medium tabular-nums">{formatCurrency(i.amount, i.currency)}</p>
              <p className="text-xs text-muted-foreground">{i.dueDate}</p>
            </div>
            <Badge className={cn("border-transparent", STATUS[i.status].style)}>{t(STATUS[i.status].key)}</Badge>
            {i.status === "DUE" && <Button size="sm" onClick={() => toast.success(t("payNow"))}>{t("payNow")}</Button>}
          </div>
        ))}
      </div>
    </div>
  );
}
