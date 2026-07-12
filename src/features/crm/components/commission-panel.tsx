"use client";

import { Coins } from "lucide-react";
import { useTranslations } from "next-intl";

export function CommissionPanel() {
  const t = useTranslations("Crm");

  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border/70 bg-card py-16 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
        <Coins className="size-7" />
      </span>
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">{t("commissionEmptyTitle")}</h3>
        <p className="mx-auto max-w-md text-sm text-muted-foreground">{t("commissionEmptyDesc")}</p>
      </div>
    </div>
  );
}
