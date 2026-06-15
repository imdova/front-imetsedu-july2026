"use client";

import { useTranslations } from "next-intl";
import { Radio, Presentation, Video, type LucideIcon } from "lucide-react";

import type { InstructorEvent, InstructorEventType, InstructorEventStatus } from "@/lib/db/instructor";
import { cn } from "@/lib/utils";

const TYPE_ICON: Record<InstructorEventType, LucideIcon> = {
  live: Radio,
  webinar: Video,
  workshop: Presentation,
};

const TYPE_KEY: Record<InstructorEventType, string> = {
  live: "typeLive",
  webinar: "typeWebinar",
  workshop: "typeWorkshop",
};

const STATUS_STYLE: Record<InstructorEventStatus, string> = {
  upcoming: "bg-primary/12 text-primary",
  live: "bg-destructive/12 text-destructive",
  ended: "bg-muted text-muted-foreground",
};

const STATUS_KEY: Record<InstructorEventStatus, string> = {
  upcoming: "statusUpcoming",
  live: "statusLive",
  ended: "statusEnded",
};

export function EventsList({ items, compact = false }: { items: InstructorEvent[]; compact?: boolean }) {
  const t = useTranslations("Instructor");

  return (
    <div className="space-y-2.5">
      {items.map((e) => {
        const Icon = TYPE_ICON[e.type];
        return (
          <div
            key={e.id}
            className="flex items-center gap-3 rounded-xl border border-border/70 bg-card p-3.5 shadow-sm"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-[18px]" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{e.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {e.date} · {e.time}
                {!compact && ` · ${t(TYPE_KEY[e.type])}`}
              </p>
            </div>
            {!compact && (
              <span className="hidden text-xs text-muted-foreground tabular-nums sm:block">
                {e.registered}/{e.capacity} {t("registered")}
              </span>
            )}
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-medium",
                STATUS_STYLE[e.status],
              )}
            >
              {t(STATUS_KEY[e.status])}
            </span>
          </div>
        );
      })}
    </div>
  );
}
