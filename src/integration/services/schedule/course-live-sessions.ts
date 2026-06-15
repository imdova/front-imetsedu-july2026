import type { ScheduleEvent } from "@integration/lib/validations/schemas/schedule.schema";

export interface LectureSession {
  id: string;
  title: string;
  dateLabel: string;
  timeLabel: string;
  status: "live" | "upcoming" | "past";
  joinUrl?: string;
}

export interface CourseLiveSessions {
  whatsAppGroupName: string;
  whatsAppInviteUrl: string;
  whatsAppMemberCount: number;
  zoomMeetingUrl: string;
  zoomPasscode: string;
  nextLiveLabel: string;
  lectures: LectureSession[];
}

function extractZoomPasscode(url: string): string {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    return parsed.searchParams.get("pwd") ?? "";
  } catch {
    return "";
  }
}

function formatTimeRange(start: Date, end: Date, locale: string): string {
  const opts: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
  };
  return `${start.toLocaleTimeString(locale, opts)} – ${end.toLocaleTimeString(locale, opts)}`;
}

function formatNextLiveLabel(startIso: string, locale: string): string {
  const start = new Date(startIso);
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const day = start.toLocaleDateString(locale, {
    weekday: "long",
  });
  const time = start.toLocaleTimeString(locale, {
    hour: "numeric",
    minute: "2-digit",
  });
  return `Next live: ${day}, ${time} (${tz})`;
}

export function normalizeAssignedGroupIds(groups: unknown[] | undefined): string[] {
  if (!groups?.length) return [];
  return groups
    .map((group) => {
      if (typeof group === "string") return group;
      if (group && typeof group === "object") {
        const row = group as { _id?: string; id?: string };
        return row._id ?? row.id ?? "";
      }
      return "";
    })
    .filter(Boolean);
}

export function filterLiveClassesForCourse(
  events: ScheduleEvent[],
  assignedGroupIds: string[],
): ScheduleEvent[] {
  const live = events.filter((event) => event.kind === "live-class");
  const groupIds = normalizeAssignedGroupIds(assignedGroupIds);
  if (!groupIds.length) return live;
  return live.filter(
    (event) => event.groupId && groupIds.includes(event.groupId),
  );
}

export function buildCourseLiveSessions(options: {
  events: ScheduleEvent[];
  webhookUrl?: string;
  whatsAppGroupName?: string;
  whatsAppMemberCount?: number;
  locale?: string;
}): CourseLiveSessions {
  const locale = options.locale ?? "en-US";
  const now = Date.now();
  const liveClassEvents = options.events.filter(
    (event) => event.kind === "live-class",
  );

  const lectures: LectureSession[] = liveClassEvents
    .map((event) => {
      const start = new Date(event.start);
      const end = new Date(event.end);
      let status: LectureSession["status"] = "past";
      if (now >= start.getTime() && now <= end.getTime()) status = "live";
      else if (now < start.getTime()) status = "upcoming";

      return {
        id: event.id,
        title: event.title,
        dateLabel: start.toLocaleDateString(locale, {
          weekday: "short",
          month: "short",
          day: "numeric",
        }),
        timeLabel: formatTimeRange(start, end, locale),
        status,
        joinUrl: event.joinUrl,
      };
    })
    .sort((a, b) => {
      const eventA = liveClassEvents.find((event) => event.id === a.id);
      const eventB = liveClassEvents.find((event) => event.id === b.id);
      return (eventA?.start ?? "").localeCompare(eventB?.start ?? "");
    });

  const nextLiveEvent =
    liveClassEvents.find((event) => {
      const start = new Date(event.start).getTime();
      const end = new Date(event.end).getTime();
      return now < end;
    }) ?? null;

  const zoomMeetingUrl =
    nextLiveEvent?.joinUrl ??
    liveClassEvents.find((event) => event.joinUrl)?.joinUrl ??
    "";

  return {
    whatsAppGroupName:
      options.whatsAppGroupName?.trim() || "Course WhatsApp group",
    whatsAppInviteUrl: options.webhookUrl?.trim() ?? "",
    whatsAppMemberCount: options.whatsAppMemberCount ?? 0,
    zoomMeetingUrl,
    zoomPasscode: extractZoomPasscode(zoomMeetingUrl),
    nextLiveLabel: nextLiveEvent
      ? formatNextLiveLabel(nextLiveEvent.start, locale)
      : "No upcoming live sessions scheduled",
    lectures,
  };
}

export const emptyCourseLiveSessions: CourseLiveSessions = {
  whatsAppGroupName: "Course WhatsApp group",
  whatsAppInviteUrl: "",
  whatsAppMemberCount: 0,
  zoomMeetingUrl: "",
  zoomPasscode: "",
  nextLiveLabel: "No upcoming live sessions scheduled",
  lectures: [],
};
