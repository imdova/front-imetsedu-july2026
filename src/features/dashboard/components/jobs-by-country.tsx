"use client";

import { useTranslations } from "next-intl";
import { motion } from "motion/react";

import type { CountryBar } from "@/lib/db/platform";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Blue shade ramp (replaces the reference's green) for visual rhythm.
const SHADES = [
  "oklch(0.62 0.18 264)",
  "oklch(0.55 0.21 264)",
  "oklch(0.48 0.2 264)",
  "oklch(0.4 0.17 264)",
  "oklch(0.34 0.13 264)",
  "oklch(0.68 0.15 264)",
  "oklch(0.58 0.2 264)",
  "oklch(0.5 0.2 264)",
];

export function JobsByCountry({ data }: { data: CountryBar[] }) {
  const t = useTranslations("Platform");
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("countryTitle")}</CardTitle>
        <CardDescription>{t("countrySub")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex h-64 items-end justify-between gap-3 pt-4">
          {data.map((d, i) => (
            <div
              key={d.code}
              className="group flex h-full flex-1 flex-col items-center justify-end gap-2"
            >
              <span className="text-xs font-medium tabular-nums text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                {d.value}
              </span>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${Math.round((d.value / max) * 100)}%` }}
                transition={{ duration: 0.5, delay: i * 0.05, ease: "easeOut" }}
                className="w-full rounded-t-md"
                style={{ backgroundColor: SHADES[i % SHADES.length] }}
              />
              <span className="text-xs font-medium text-muted-foreground">
                {d.code}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
