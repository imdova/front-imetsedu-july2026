import { z } from "zod";

export const scheduleEventKindSchema = z.enum([
  "live-class",
  "deadline",
  "exam",
  "office-hours",
  "workshop",
]);
export type ScheduleEventKind = z.infer<typeof scheduleEventKindSchema>;

export const scheduleEventSchema = z.object({
  id: z.string(),
  title: z.string(),
  kind: scheduleEventKindSchema,
  /** ISO datetime, in UTC. Render with student's TZ in the UI. */
  start: z.string(),
  end: z.string(),
  location: z.string().optional(),
  joinUrl: z.string().optional(),
  courseCode: z.string().optional(),
  instructor: z.string().optional(),
  groupId: z.string().optional(),
});
export type ScheduleEvent = z.infer<typeof scheduleEventSchema>;
