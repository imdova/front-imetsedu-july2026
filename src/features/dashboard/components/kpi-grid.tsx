"use client";

import { useTranslations } from "next-intl";

import type { Kpi } from "@/lib/db/platform";
import { KpiCard } from "./kpi-card";

/** Client wrapper that resolves i18n strings and renders the KPI tiles. */
export function KpiGrid({ kpis }: { kpis: Kpi[] }) {
  const t = useTranslations("Platform");
  // Labels come from dynamic keys stored in the data, so use a string-keyed view.
  const tr = t as unknown as (key: string) => string;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi, i) => (
        <KpiCard
          key={kpi.key}
          kpi={kpi}
          label={tr(kpi.labelKey)}
          sub={kpi.subKey ? tr(kpi.subKey) : undefined}
          vsLabel={t("vsLastPeriod")}
          index={i}
        />
      ))}
    </div>
  );
}
