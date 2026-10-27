import type { CourseRow, InstructorLookup } from "@/types";
import { computeFacets, type FilterableCourse } from "./catalog-filters";
import { courseSearchText, type SearchableCourse } from "./smart-course-search";

/**
 * The slim shapes a course crosses the server → client boundary in.
 *
 * A `CourseRow` is the whole record: description, curriculum, FAQs, reviews,
 * intakes. A listing card renders a dozen fields of it, but because the card is
 * a client component (the price swaps by visitor country) every field of every
 * course handed to it was serialised into the page — about 20 KB a card, which
 * is how /courses reached 1 MB. These types name exactly what is rendered, and
 * the builders below are the only place a full record is read for a listing.
 */

/** Everything `CourseCard` renders. */
export interface CourseCardData {
  id: string;
  slug: string;
  titleEn: string;
  thumbnailUrl: string;
  priceEGP: number;
  salePriceEGP: number;
  priceSAR?: number;
  salePriceSAR?: number;
  priceUSD?: number;
  salePriceUSD?: number;
  lectures: number;
  students: number;
  isBestseller: boolean;
  isTopRated: boolean;
  rating: number;
  reviewCount?: number;
  /** The "Led by" line, resolved on the server so the instructor list stays there. */
  faculty: { name: string; title?: string; image?: string } | null;
}

/** A card plus what the catalog's filters, tabs and search need. */
export interface CatalogCourse extends CourseCardData, FilterableCourse, SearchableCourse {}

function resolveFaculty(
  course: Pick<CourseRow, "instructorProfile" | "instructorNames">,
  instructors: Pick<InstructorLookup, "label" | "title" | "avatarUrl">[],
): CourseCardData["faculty"] {
  const profile = course.instructorProfile;
  if (profile?.name) {
    return { name: profile.name, title: profile.title, image: profile.image };
  }
  const named = course.instructorNames?.[0];
  if (!named) return null;
  const hit = instructors.find((i) => i.label.trim().toLowerCase() === named.trim().toLowerCase());
  return { name: named, title: hit?.title, image: hit?.avatarUrl };
}

export function toCourseCardData(
  c: CourseRow,
  instructors: Pick<InstructorLookup, "label" | "title" | "avatarUrl">[] = [],
): CourseCardData {
  return {
    id: c.id,
    slug: c.slug,
    titleEn: c.titleEn,
    thumbnailUrl: c.thumbnailUrl,
    priceEGP: c.priceEGP,
    salePriceEGP: c.salePriceEGP,
    priceSAR: c.priceSAR,
    salePriceSAR: c.salePriceSAR,
    priceUSD: c.priceUSD,
    salePriceUSD: c.salePriceUSD,
    lectures: c.lectures,
    students: c.students,
    isBestseller: c.isBestseller,
    isTopRated: c.isTopRated,
    rating: c.rating,
    reviewCount: c.reviewCount,
    faculty: resolveFaculty(c, instructors),
  };
}

const plain = (html?: string, max = 240) => {
  const text = (html ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return text.length > max ? text.slice(0, max).trimEnd() : text;
};

export function toCatalogCourse(
  c: CourseRow,
  instructors: Pick<InstructorLookup, "label" | "title" | "avatarUrl">[] = [],
): CatalogCourse {
  return {
    ...toCourseCardData(c, instructors),
    category: c.category,
    categoryAr: c.categoryAr,
    difficulty: c.difficulty,
    // The facet functions read the description; running them here keeps it on
    // the server and sends only their answers.
    facets: computeFacets(c),
    searchText: courseSearchText(c),
    headlineEn: c.headlineEn,
    // Only the career-match hit reads this, and only the start of it matters.
    whoCanAttendEn: plain(c.whoCanAttendEn) || undefined,
    instructorNames: c.instructorNames ?? [],
    tagLabels: c.tagLabels ?? [],
  };
}
