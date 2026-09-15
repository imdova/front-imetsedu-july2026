import { dal } from "@/lib/dal";
import {
  DEFAULT_SALES_ORIENTATION,
  type ProgrammeNumbers,
  type ProgrammeRef,
} from "@/features/orientation/lib/sales-orientation";

/**
 * The programme-numbers lesson quotes fees, lecture counts and learner totals.
 * They are resolved from the live course records rather than copied into the
 * training content, so changing a price in Admin → Courses updates what reps
 * are taught to quote. A programme whose course is missing or unpublished is
 * dropped rather than shown with a stale or empty price.
 *
 * `refs` is the (possibly edited) programme list; server-side only.
 */
export async function loadOrientationProgrammes(
  refs: ProgrammeRef[] = DEFAULT_SALES_ORIENTATION.programmes,
): Promise<ProgrammeNumbers[]> {
  const res = await dal.courses.fetchCourses();
  const courses = res.ok ? res.data : [];
  return refs
    .map((ref) => {
      const c = courses.find((x) => x.slug === ref.slug);
      if (!c || c.status !== "published" || c.priceEGP <= 0) return null;
      return {
        ...ref,
        lectures: c.lectures,
        price: c.priceEGP,
        sale: c.salePriceEGP > 0 ? c.salePriceEGP : c.priceEGP,
        students: c.students,
      };
    })
    .filter((p): p is ProgrammeNumbers => p !== null);
}
