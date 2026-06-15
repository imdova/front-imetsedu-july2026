"use client";

import { useTranslations } from "next-intl";
import { motion } from "motion/react";

import type { CategoryBar } from "@/lib/db/platform";
import { formatCompact } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function SpecialtyBars({ data }: { data: CategoryBar[] }) {
  const t = useTranslations("Platform");
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("specialtyTitle")}</CardTitle>
        <CardDescription>{t("specialtySub")}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4 pt-2">
          {data.map((d, i) => (
            <li key={d.label} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{d.label}</span>
                <span className="tabular-nums text-muted-foreground">
                  {formatCompact(d.value)}
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.round((d.value / max) * 100)}%` }}
                  transition={{ duration: 0.55, delay: i * 0.06, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-primary to-[oklch(0.62_0.19_286)]"
                />
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
