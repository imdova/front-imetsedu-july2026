/**
 * Areas an instructor applicant can say they teach, on top of the school's
 * course categories.
 *
 * The "Become an instructor" form builds its list from the live catalogue, so
 * it can only offer what IMETS already teaches — which is the right default for
 * a course taxonomy and the wrong one for recruiting, where the point is to
 * find people for subjects not yet on the catalogue. These sit alongside the
 * categories rather than inside them, so adding one here does not create a
 * course category, change the public catalogue, or appear in course filters.
 */
export interface TeachingArea {
  /** Stored value — English, matching how `course.category` is keyed. */
  value: string;
  en: string;
  ar: string;
}

export const EXTRA_TEACHING_AREAS: TeachingArea[] = [
  { value: "Supply Chain", en: "Supply Chain", ar: "سلاسل الإمداد" },
  { value: "Marketing", en: "Marketing", ar: "التسويق" },
  { value: "Operations", en: "Operations", ar: "العمليات" },
  { value: "Finance", en: "Finance", ar: "المالية" },
  {
    value: "AI and Digital Transformation",
    en: "AI and Digital Transformation",
    ar: "الذكاء الاصطناعي والتحول الرقمي",
  },
];
