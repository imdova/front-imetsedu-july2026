"use client";

import { useTranslations } from "next-intl";

import type { OpenReport, Severity } from "@/lib/db/platform";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const SEVERITY: Record<Severity, string> = {
  LOW: "border-transparent bg-muted text-muted-foreground",
  MEDIUM: "border-transparent bg-warning/15 text-warning",
  HIGH: "border-transparent bg-destructive/12 text-destructive",
};

export function OpenReportsCard({ reports }: { reports: OpenReport[] }) {
  const t = useTranslations("Platform");

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{t("openReportsTitle")}</CardTitle>
        <CardDescription>
          {t("flaggedItems", { count: 14 })}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex h-full flex-col">
        <ul className="divide-y divide-border/60">
          {reports.map((r) => (
            <li
              key={r.id}
              className="flex items-center justify-between gap-3 py-3 first:pt-0"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{r.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {r.reason} · {r.entity} · {r.ago}
                </p>
              </div>
              <Badge className={cn("shrink-0 text-[0.7rem]", SEVERITY[r.severity])}>
                {r.severity}
              </Badge>
            </li>
          ))}
        </ul>
        <Button variant="outline" className="mt-4 w-full">
          {t("openJobs")}
        </Button>
      </CardContent>
    </Card>
  );
}
