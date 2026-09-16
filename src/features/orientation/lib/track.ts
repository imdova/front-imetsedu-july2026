import { gaEvent } from "@/lib/analytics";

/**
 * Sales Orientation analytics events, sent through the platform's existing GA4
 * wrapper (a no-op wherever the tag isn't loaded). No vendor SDK is added.
 */
export type OrientationEvent =
  | "orientation_lesson_started"
  | "orientation_gate_progress"
  | "orientation_lesson_completed"
  | "orientation_practice_answered"
  | "orientation_drill_round"
  | "orientation_quiz_submitted"
  | "orientation_task_sent"
  | "orientation_reference_search"
  | "orientation_reference_copy"
  | "orientation_signed_off";

export function track(event: OrientationEvent, params?: Record<string, string | number | boolean>) {
  gaEvent(event, params);
}
