"use client";

import { useTranslations } from "next-intl";
import { Video, FileWarning, GraduationCap, Coffee, Wrench, Clock } from "lucide-react";

import type { ScheduleEvent, EventKind } from "@/lib/db/student";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const KIND: Record<EventKind, { icon: React.ElementType; style: string; labelKey: string }> = {
  "live-class": { icon: Video, style: "bg-primary/12 text-primary", labelKey: "kindLiveClass" },
  deadline: { icon: FileWarning, style: "bg-destructive/12 text-destructive", labelKey: "kindDeadline" },
  exam: { icon: GraduationCap, style: "bg-warning/18 text-warning", labelKey: "kindExam" },
  "office-hours": { icon: Coffee, style: "bg-chart-3/15 text-chart-3", labelKey: "kindOfficeHours" },
  workshop: { icon: Wrench, style: "bg-success/15 text-success", labelKey: "kindWorkshop" },
};

export function ScheduleView({ events }: { events: ScheduleEvent[] }) {
  const t = useTranslations("Student");
  const days = Array.from(new Set(events.map((e) => e.day)));

  return (
    <div className="space-y-6">
      {days.map((day) => (
        <div key={day}>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{day}</h2>
          <ul className="space-y-2.5">
            {events.filter((e) => e.day === day).map((e) => {
              const cfg = KIND[e.kind];
              return (
                <li key={e.id} className="flex items-center gap-4 rounded-xl border border-border/70 bg-card p-4 shadow-sm">
                  <span className={cn("grid size-10 shrink-0 place-items-center rounded-lg", cfg.style)}>
                    <cfg.icon className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{e.title}</p>
                      <Badge variant="secondary" className="text-[0.7rem]">{e.courseCode}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      <Clock className="me-1 inline size-3.5" />
                      {e.time}{e.instructor ? ` · ${e.instructor}` : ""}
                    </p>
                  </div>
                  {e.joinUrl && (
                    <Button size="sm" variant="outline">{t("join")}</Button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
