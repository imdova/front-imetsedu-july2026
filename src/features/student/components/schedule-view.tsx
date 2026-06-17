"use client";

import { useTranslations } from "next-intl";
import { Video, FileWarning, GraduationCap, Coffee, Wrench, Clock, Download } from "lucide-react";

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

/* ── ICS export ───────────────────────────────────────────────── */
function ymd(d: Date): string {
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}
function esc(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/[,;]/g, (m) => `\\${m}`).replace(/\n/g, "\\n");
}
function buildICS(events: ScheduleEvent[], t: (k: string) => string): string {
  const now = new Date();
  const stamp = `${ymd(now)}T000000Z`;
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//IMETS//Student Schedule//EN", "CALSCALE:GREGORIAN"];
  events.forEach((e) => {
    const parsed = new Date(e.day);
    const start = Number.isNaN(parsed.getTime()) ? now : parsed;
    const desc = [t(KIND[e.kind].labelKey), e.courseCode, e.time, e.instructor].filter(Boolean).join(" · ");
    lines.push(
      "BEGIN:VEVENT",
      `UID:${e.id}@imets`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${ymd(start)}`,
      `SUMMARY:${esc(e.title)}`,
      `DESCRIPTION:${esc(desc)}`,
      ...(e.joinUrl ? [`URL:${e.joinUrl}`] : []),
      "END:VEVENT",
    );
  });
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

export function ScheduleView({ events }: { events: ScheduleEvent[] }) {
  const t = useTranslations("Student");
  const days = Array.from(new Set(events.map((e) => e.day)));
  const timeZone = typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "UTC";
  const todayStr = new Date().toDateString();
  const isToday = (day: string) => {
    const d = new Date(day);
    return !Number.isNaN(d.getTime()) && d.toDateString() === todayStr;
  };

  const exportIcs = () => {
    const blob = new Blob([buildICS(events, t as unknown as (k: string) => string)], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "imets-schedule.ics";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Toolbar: timezone + export */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {t("scheduleTimezone")}: <span className="font-mono text-foreground">{timeZone}</span>
        </p>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={exportIcs} disabled={events.length === 0}>
          <Download className="size-4" /> {t("scheduleExportIcs")}
        </Button>
      </div>

      {events.length === 0 ? (
        <div className="grid place-items-center rounded-2xl border border-dashed border-border/70 bg-card py-16 text-center text-sm text-muted-foreground">
          {t("scheduleEmpty")}
        </div>
      ) : (
        days.map((day) => (
          <div key={day}>
            <h2 className={cn("mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide", isToday(day) ? "text-primary" : "text-muted-foreground")}>
              {isToday(day) && <span className="size-2 rounded-full bg-primary" />}
              {day}
              {isToday(day) && <span className="text-primary">({t("scheduleToday")})</span>}
            </h2>
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
                        <span className="text-[0.7rem] font-bold uppercase tracking-wide text-muted-foreground">{t(cfg.labelKey)}</span>
                        <Badge variant="secondary" className="text-[0.7rem]">{e.courseCode}</Badge>
                      </div>
                      <p className="font-medium">{e.title}</p>
                      <p className="text-sm text-muted-foreground">
                        <Clock className="me-1 inline size-3.5" />
                        {e.time}{e.instructor ? ` · ${e.instructor}` : ""}
                      </p>
                    </div>
                    {e.joinUrl && (
                      <Button asChild size="sm" variant="outline">
                        <a href={e.joinUrl} target="_blank" rel="noreferrer">{t("join")}</a>
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}
