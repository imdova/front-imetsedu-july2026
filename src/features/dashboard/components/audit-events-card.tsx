"use client";

import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";

import type { AuditEvent } from "@/lib/db/platform";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function AuditEventsCard({ events }: { events: AuditEvent[] }) {
  const t = useTranslations("Platform");

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{t("auditTitle")}</CardTitle>
        <CardDescription>{t("lastEntries", { count: 5 })}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3.5">
          {events.map((e) => (
            <li key={e.id} className="flex items-start gap-3">
              <code className="mt-0.5 shrink-0 rounded-md bg-muted px-2 py-1 font-mono text-[0.7rem] text-muted-foreground">
                {e.type}
              </code>
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-1 text-sm">
                  <span className="font-medium">{e.actor}</span>
                  <ArrowRight className="size-3 text-muted-foreground rtl:rotate-180" />
                  <span className="font-medium">{e.target}</span>
                </p>
                <p className="text-xs text-muted-foreground">{e.ago}</p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
