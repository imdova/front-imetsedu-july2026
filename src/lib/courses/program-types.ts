/**
 * Derives the course form's "Program type" select options from the live CRM
 * "course variables" (a generic named-list store on the backend). Falls back to
 * an empty list when no matching variable exists, so the form can keep its
 * static defaults.
 */
import type { CourseVariable } from "@/lib/db/course-taxonomy";

export function programTypeOptions(
  vars: CourseVariable[],
): { value: string; label: string }[] {
  const v = vars.find(
    (x) => /program\s*type/i.test(x.nameEn) || /برنامج/.test(x.nameAr),
  );
  if (!v) return [];
  return v.options
    .map((o) => ({ value: o.en || o.ar, label: o.en || o.ar }))
    .filter((o) => o.value);
}
