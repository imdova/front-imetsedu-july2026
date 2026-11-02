import type { CourseRow } from "@/types";

export interface NextCohort {
  slug: string;
  title: string;
  /** ISO start date, straight from the course's intake. */
  startDate: string;
  /** Seats the team published for this intake; 0 means "not published", never "none". */
  seats: number;
}

/**
 * The earliest cohort that is still to come, across the published courses.
 *
 * Only real intakes count — a course's `intakes[]` as entered in the admin —
 * and only `open` ones: a closed or full cohort is not something to "reserve a
 * seat" in. Returns null when nothing is scheduled, which the section shows as
 * "dates announced soon" instead of inventing a date to count down to.
 *
 * Lives outside the component because it reads the clock.
 */
export function nextCohort(courses: CourseRow[], locale: string, now: number = Date.now()): NextCohort | null {
  let best: { at: number; cohort: NextCohort } | null = null;
  for (const c of courses) {
    for (const i of c.intakes ?? []) {
      if (i.status && i.status !== "open") continue;
      const at = Date.parse(i.startDate);
      if (!Number.isFinite(at) || at <= now) continue;
      if (!best || at < best.at) {
        best = {
          at,
          cohort: {
            slug: c.slug,
            title: (locale === "ar" ? c.titleAr : c.titleEn) || c.titleEn || c.titleAr,
            startDate: i.startDate,
            seats: i.seatsAvailable && i.seatsAvailable > 0 ? i.seatsAvailable : 0,
          },
        };
      }
    }
  }
  return best?.cohort ?? null;
}
