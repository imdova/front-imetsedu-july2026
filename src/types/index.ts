/**
 * App-wide type barrel.
 *
 * Domain contracts are re-exported from the vendored integration package so the
 * UI speaks the exact same shapes as the real NestJS backend. App-only view
 * types (lookups, option sets) live here. The UI imports types from `@/types`
 * — never from `@integration/*` directly — keeping the backend seam in one place.
 */

export type {
  Course,
  Category,
  SubCategory,
  Review,
} from "@integration/types/course";

export type {
  CourseFormData,
  CourseModule,
  CourseLesson,
  LessonResource,
  PricingDetails,
  TextReview,
  VideoReview,
  ImageReview,
} from "@integration/types/courseForm";

export type {
  AdminStats,
  SalesData,
  TopCourse,
  TopInstructor,
} from "@integration/types/admin";

/* -------------------------------------------------------------------------- */
/*  App-level view types                                                       */
/* -------------------------------------------------------------------------- */

export type Difficulty = "Beginner" | "Intermediate" | "Advanced";
export type AttendanceMode = "online-zoom" | "offline";
export type CourseStatus = "draft" | "published";
export type CurrencyCode = "EGP" | "SAR" | "USD";
export type LanguageOption = "English" | "Arabic" | "French" | "Spanish";
export type LessonType = "video" | "quiz" | "pdf" | "text";

/** Lightweight lookup entity returned by the DAL for select/search fields. */
export interface LookupItem {
  id: string;
  label: string;
  labelAr?: string;
}

/** A category lookup that carries its dependent subcategories. */
export interface CategoryLookup extends LookupItem {
  subcategories: LookupItem[];
}

/** Instructor lookup for the many-to-many relations field. */
export interface InstructorLookup extends LookupItem {
  avatarUrl?: string;
  title?: string;
}

/** A course row as rendered in the admin courses DataTable. */
export interface CourseRow {
  id: string;
  slug: string;
  titleEn: string;
  titleAr: string;
  category: string;
  difficulty: Difficulty;
  priceEGP: number;
  salePriceEGP: number;
  students: number;
  lectures: number;
  rating: number;
  status: CourseStatus;
  isFeatured: boolean;
  isBestseller: boolean;
  isTopRated: boolean;
  thumbnailUrl: string;
  updatedAt: string;
  /** Long-form content for the public course page (HTML rich text or plain). */
  descriptionEn?: string;
  descriptionAr?: string;
  whoCanAttendEn?: string;
  whoCanAttendAr?: string;
  /** Curriculum modules with their lessons (for the collapsible curriculum). */
  modules?: CurriculumModule[];
}

export interface CurriculumLesson {
  titleEn: string;
  titleAr: string;
  duration?: string;
  isFreePreview?: boolean;
}

export interface CurriculumModule {
  titleEn: string;
  titleAr: string;
  lessons: CurriculumLesson[];
}

/** Generic async result mirroring the integration layer's `Result<T>`. */
export type { Result } from "@integration/lib/api-client";
