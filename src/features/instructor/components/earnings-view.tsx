"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Wallet, Clock, TrendingUp, Banknote } from "lucide-react";

import type { EarningsSummary, PayoutRow, PayoutStatus } from "@/lib/db/instructor";
import { cn, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const STATUS_STYLE: Record<PayoutStatus, string> = {
  paid: "bg-success/15 text-success",
  pending: "bg-warning/18 text-warning",
  processing: "bg-chart-3/15 text-chart-3",
};

const STATUS_KEY: Record<PayoutStatus, string> = {
  paid: "statusPaid",
  pending: "statusPending",
  processing: "statusProcessing",
};

export function EarningsView({
  summary,
  payouts,
}: {
  summary: EarningsSummary;
  payouts: PayoutRow[];
}) {
  const t = useTranslations("Instructor");

  const tiles = [
    { label: t("available"), value: summary.available, icon: Wallet, tone: "bg-success/12 text-success" },
    { label: t("pending"), value: summary.pending, icon: Clock, tone: "bg-warning/18 text-warning" },
    { label: t("thisMonth"), value: summary.thisMonth, icon: TrendingUp, tone: "bg-primary/12 text-primary" },
    { label: t("lifetime"), value: summary.lifetime, icon: Banknote, tone: "bg-chart-3/15 text-chart-3" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map((tile) => (
          <Card key={tile.label}>
            <CardContent className="space-y-3">
              <span className={cn("grid size-9 place-items-center rounded-lg", tile.tone)}>
                <tile.icon className="size-[18px]" />
              </span>
              <p className="text-sm text-muted-foreground">{tile.label}</p>
              <p className="font-heading text-2xl font-semibold tabular-nums">
                {formatCurrency(tile.value, "EGP")}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <Button className="gap-1.5" onClick={() => toast.success(t("withdraw"))}>
          <Wallet className="size-4" />
          {t("withdraw")}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("payoutHistory")}</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/70 text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-6 py-2.5 text-start font-semibold">{t("colPeriod")}</th>
                  <th className="px-6 py-2.5 text-start font-semibold">{t("colMethod")}</th>
                  <th className="px-6 py-2.5 text-start font-semibold">{t("colDate")}</th>
                  <th className="px-6 py-2.5 text-start font-semibold">{t("colStatus")}</th>
                  <th className="px-6 py-2.5 text-end font-semibold">{t("colAmount")}</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((p) => (
                  <tr key={p.id} className="border-b border-border/50 last:border-0">
                    <td className="px-6 py-3 font-medium">{p.period}</td>
                    <td className="px-6 py-3 text-muted-foreground">{p.method}</td>
                    <td className="px-6 py-3 text-muted-foreground tabular-nums">{p.date}</td>
                    <td className="px-6 py-3">
                      <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", STATUS_STYLE[p.status])}>
                        {t(STATUS_KEY[p.status])}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-end font-medium tabular-nums">{formatCurrency(p.amount, "EGP")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
