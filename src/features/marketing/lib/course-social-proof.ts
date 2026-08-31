import type { CourseRow } from "@/types";

/**
 * Social proof for a course, straight from the record — never invented.
 *
 * This used to synthesise a 4.9 rating and a seeded 420–800 "review count" from
 * a hash of the course id so cards would look good before any real reviews
 * existed. Those numbers were shown to the public as if students had left them.
 * They are gone: a course with no consented reviews reports zero, and every
 * caller hides its rating block rather than printing a number nobody earned.
 *
 * `hasReviews` is the flag callers should branch on.
 */
export function courseSocialProof(course: Pick<CourseRow, "id" | "slug" | "rating" | "reviewCount">) {
  const reviews = Math.max(0, course.reviewCount ?? 0);
  const rating = reviews > 0 && course.rating > 0
    ? Math.min(5, Math.round(course.rating * 10) / 10)
    : 0;

  return { rating, reviews, hasReviews: reviews > 0 && rating > 0 };
}
