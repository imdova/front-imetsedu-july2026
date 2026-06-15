import type { ScheduleEvent } from "@integration/lib/validations/schemas/schedule.schema";
import type {
  DeadlineScheduleEvent,
  LiveClassScheduleEvent,
  QuizScheduleEvent,
  StudentScheduleApiResponse,
} from "./types";

const WEEKDAYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

function parseTimeParts(time?: string): { hour: number; minute: number } | null {
  if (!time?.trim()) return null;
  const match = /^(\d{1,2}):(\d{2})/.exec(time.trim());
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
  return { hour, minute };
}

/** Resolve lecture day text to a calendar date (next matching weekday or parsed date). */
export function resolveLectureDate(lectureDay: string | undefined, reference = new Date()): Date {
  const trimmed = lectureDay?.trim();
  if (!trimmed) {
    const d = new Date(reference);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  const parsed = Date.parse(trimmed);
  if (!Number.isNaN(parsed)) {
    const d = new Date(parsed);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  const lower = trimmed.toLowerCase().replace(/s$/g, "").trim();
  const targetIdx = WEEKDAYS.findIndex(
    (day) => lower === day || lower.startsWith(day.slice(0, 3)) || lower.includes(day),
  );
  if (targetIdx === -1) {
    const d = new Date(reference);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  const d = new Date(reference);
  const current = d.getDay();
  let diff = targetIdx - current;
  if (diff <= 0) diff += 7;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function combineDateAndTime(base: Date, time?: string, endOfDay = false): string {
  const parts = parseTimeParts(time);
  const d = new Date(base);
  if (parts) {
    d.setHours(parts.hour, parts.minute, 0, 0);
  } else if (endOfDay) {
    d.setHours(23, 59, 59, 999);
  } else {
    d.setHours(0, 0, 0, 0);
  }
  return d.toISOString();
}

function endOfUtcDay(iso: string): string {
  const d = new Date(iso);
  d.setUTCHours(23, 59, 59, 999);
  return d.toISOString();
}

function mapLiveClass(raw: LiveClassScheduleEvent): ScheduleEvent {
  const base = resolveLectureDate(raw.lectureDay);
  const start = combineDateAndTime(base, raw.startTime ?? "00:00");
  const end = combineDateAndTime(
    base,
    raw.endTime ?? raw.startTime ?? "23:59",
    !raw.endTime && !raw.startTime,
  );

  return {
    id: `${raw.groupId}-live-${raw.lectureDay ?? "day"}-${raw.startTime ?? "start"}`,
    title: raw.groupTitle,
    kind: "live-class",
    start,
    end,
    joinUrl: raw.zoomLink?.trim() || undefined,
    courseCode: raw.groupTitle,
    location: raw.zoomLink ? "Zoom" : undefined,
    groupId: raw.groupId,
  };
}

function mapDeadline(raw: DeadlineScheduleEvent): ScheduleEvent {
  const start = raw.dueDate;
  const end = endOfUtcDay(raw.dueDate);

  return {
    id: `${raw.group?._id ?? "deadline"}-${raw.dueDate}-${raw.title}`,
    title: raw.title,
    kind: "deadline",
    start,
    end,
    courseCode: raw.group?.title,
  };
}

function mapQuiz(raw: QuizScheduleEvent): ScheduleEvent {
  const title =
    raw.title?.trim() ||
    (raw.group?.title ? `${raw.group.title} — Quiz` : "Quiz");
  const startIso = raw.startDate ?? raw.dueDate ?? new Date().toISOString();
  const endIso =
    raw.endDate ?? (raw.dueDate ? endOfUtcDay(raw.dueDate) : startIso);

  return {
    id: `${raw.group?._id ?? raw.groupId ?? "quiz"}-${startIso}-${title}`,
    title,
    kind: "exam",
    start: startIso,
    end: endIso,
    courseCode: raw.group?.title ?? raw.groupTitle,
  };
}

export function normalizeStudentSchedule(
  payload: StudentScheduleApiResponse,
): ScheduleEvent[] {
  const events: ScheduleEvent[] = [];

  for (const item of payload.scheduleEvents ?? []) {
    if (item?.type === "live_class") events.push(mapLiveClass(item));
  }
  for (const item of payload.deadlineEvents ?? []) {
    if (item?.type === "deadline") events.push(mapDeadline(item));
  }
  for (const item of payload.quizEvents ?? []) {
    if (item?.type === "quiz") events.push(mapQuiz(item));
  }

  return events.sort((a, b) => a.start.localeCompare(b.start));
}

export function unwrapSchedulePayload(
  data: StudentScheduleApiResponse | { data?: StudentScheduleApiResponse },
): StudentScheduleApiResponse | null {
  if (!data || typeof data !== "object") return null;
  if ("scheduleEvents" in data || "deadlineEvents" in data || "quizEvents" in data) {
    return data as StudentScheduleApiResponse;
  }
  const nested = (data as { data?: StudentScheduleApiResponse }).data;
  if (nested && typeof nested === "object") return nested;
  return null;
}
