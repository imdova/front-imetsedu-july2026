"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";

import type { SalesData } from "@/types";
import { formatCompact, formatCurrency } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Props {
  data: SalesData[];
}

/** Dependency-free animated bar chart of monthly sales + enrolled students. */
export function SalesOverview({ data }: Props) {
  const t = useTranslations("Dashboard");
  const maxSales = Math.max(...data.map((d) => d.sales), 1);
  const totalSales = data.reduce((acc, d) => acc + d.sales, 0);
  const totalStudents = data.reduce((acc, d) => acc + d.students, 0);

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{t("salesOverview")}</CardTitle>
            <CardDescription>{t("lastSixMonths")}</CardDescription>
          </div>
          <div className="text-end">
            <p className="text-2xl font-semibold tabular-nums">
              {formatCurrency(totalSales, "EGP")}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("studentsEnrolled", { count: formatCompact(totalStudents) })}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex h-56 items-end justify-between gap-3">
          {data.map((d, i) => {
            const height = Math.round((d.sales / maxSales) * 100);
            return (
              <div
                key={d.date}
                className="group flex flex-1 flex-col items-center gap-2"
              >
                <div className="relative flex w-full flex-1 items-end">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{
                      duration: 0.5,
                      delay: i * 0.07,
                      ease: "easeOut",
                    }}
                    className="w-full rounded-t-md bg-gradient-to-t from-primary/70 to-primary"
                  >
                    <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 rounded-md bg-foreground px-2 py-1 text-[11px] font-medium text-background opacity-0 transition-opacity group-hover:opacity-100">
                      {formatCurrency(d.sales, "EGP")}
                    </span>
                  </motion.div>
                </div>
                <span className="text-xs text-muted-foreground">{d.date}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
