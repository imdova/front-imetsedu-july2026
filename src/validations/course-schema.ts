import { z } from "zod";

/**
 * Zod schema for the admin "Add New Course" form. Field set + validation rules
 * are taken from the BA field inventory (IMETS_NewCourse_Form_Inputs) and the
 * shape is kept compatible with the backend `CourseFormData` contract.
 *
 * Note: we deliberately avoid `.default()` here. Defaults make a field optional
 * on the schema *input* while required on the *output*, which breaks
 * react-hook-form's resolver generic. The form supplies every field via
 * `makeDefaultCourseValues()` instead, so input === output and typing stays sound.
 */

const urlOrEmpty = z.string().trim();

const youtubeOrEmpty = z.string().trim();

/** One currency block (price / sale price / discount). */
const pricingDetailSchema = z.object({
  price: z.coerce.number().min(0),
  salePrice: z.coerce.number().min(0),
  discount: z.coerce.number().min(0).max(100),
});

export const textReviewSchema = z.object({
  reviewerName: z.string().trim(),
  title: z.string().trim(),
  reviewerImage: z.string().trim(),
  rating: z.coerce.number().min(0).max(5),
  comment: z.string().trim(),
});

export const videoReviewSchema = z.object({
  url: z.string().trim(),
});

export const imageReviewSchema = z.object({
  url: z.string().trim(),
});

/** A single lesson inside a module. */
export const lessonSchema = z.object({
  id: z.string(),
  lesson_type: z.enum(["video", "quiz", "pdf", "text"]),
  titleEn: z.string().trim(),
  titleAr: z.string().trim(),
  order: z.number().int().nonnegative(),
  videoUrl: z.string().trim().optional(),
  isFreePreview: z.boolean(),
  duration: z.string().trim().optional(),
});

/** A curriculum module containing ordered lessons. */
export const moduleSchema = z.object({
  id: z.string(),
  titleEn: z.string().trim(),
  titleAr: z.string().trim(),
  order: z.number().int().nonnegative(),
  lessons: z.array(lessonSchema),
});

/** One "Why Professionals Choose <course>" reason card on the public page. */
export const whyChooseItemSchema = z.object({
  titleEn: z.string().trim(),
  titleAr: z.string().trim(),
  bodyEn: z.string().trim(),
  bodyAr: z.string().trim(),
});

/** One question/answer pair in the public page's FAQ accordion. */
export const courseFaqSchema = z.object({
  questionEn: z.string().trim(),
  questionAr: z.string().trim(),
  answerEn: z.string().trim(),
  answerAr: z.string().trim(),
});

/** One rung of the public page's "Career Outcomes" ladder. Array order IS the
 *  progression (entry level first), so no explicit rank is stored. */
export const careerRoleSchema = z.object({
  titleEn: z.string().trim(),
  titleAr: z.string().trim(),
});

/** Closing CTA on the public course page. All blank ⇒ the shared line. */
export const courseFinalCtaSchema = z.object({
  headingEn: z.string().trim(),
  headingAr: z.string().trim(),
  bodyEn: z.string().trim(),
  bodyAr: z.string().trim(),
});

export const courseFormSchema = z.object({
  /* --- Identification --- */
  titleEn: z.string().trim(),
  titleAr: z.string().trim(),
  slug: z.string().trim(),

  /* --- Classification --- */
  category: z.string(),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),
  programType: z.string(),
  attendanceMode: z.enum(["online-zoom", "offline"]),

  /* --- Hero (optional; blank falls back to the course title) --- */
  headlineEn: z.string().trim(),
  headlineAr: z.string().trim(),
  subHeadlineEn: z.string().trim(),
  subHeadlineAr: z.string().trim(),

  /* --- Content --- */
  descriptionEn: z.string().trim(),
  descriptionAr: z.string().trim(),

  /* --- Media --- */
  previewVideoUrl: youtubeOrEmpty,
  image: z.string().trim(),
  courseOverviewFile: z.string().trim(),

  /* --- Pricing --- */
  pricing: z.object({
    egp: pricingDetailSchema,
    sar: pricingDetailSchema,
    usd: pricingDetailSchema,
  }),

  /* --- Sidebar stats & meta --- */
  students: z.coerce.number().int().min(0),
  lectures: z.coerce.number().int().min(0),
  duration: z.string().trim(),
  language: z.array(z.enum(["English", "Arabic", "French", "Spanish"])),

  /* --- Relations --- */
  instructorIds: z.array(z.string()),
  tags: z.array(z.string()),

  /* --- Status & visibility --- */
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  isBestseller: z.boolean(),
  isTopRated: z.boolean(),

  /* --- Webhook --- */
  webhookUrl: urlOrEmpty,

  /* --- SEO --- */
  seo: z.object({
    metaTitleEn: z.string().trim(),
    metaTitleAr: z.string().trim(),
    metaDescriptionEn: z.string().trim(),
    metaDescriptionAr: z.string().trim(),
    metaKeywordsEn: z.array(z.string()),
    metaKeywordsAr: z.array(z.string()),
  }),

  /* --- Step 2: Structure --- */
  whatYouWillLearnEn: z.array(z.string().trim()),
  whatYouWillLearnAr: z.array(z.string().trim()),
  whoCanAttendEn: z.string().trim(),
  whoCanAttendAr: z.string().trim(),
  /** Both empty ⇒ the public page renders its shared defaults instead. */
  whyChoose: z.array(whyChooseItemSchema),
  faqs: z.array(courseFaqSchema),
  /** Empty ⇒ the public page renders its bundled per-course ladder. */
  careerRoles: z.array(careerRoleSchema),
  /** All-blank ⇒ the bundled/shared closing line. */
  finalCta: courseFinalCtaSchema,
  /** Curated "Continue Your Professional Journey" links, by slug.
   *  Empty ⇒ the page falls back to same-category courses. */
  relatedCourseSlugs: z.array(z.string()),
  modules: z.array(moduleSchema),

  /* --- Step 3: Media & Reviews (optional) --- */
  gallery: z.array(z.string()),
  videosReviews: z.array(videoReviewSchema),
  imagesReviews: z.array(imageReviewSchema),
  textReviews: z.array(textReviewSchema),

  /* --- Publish state --- */
  status: z.enum(["draft", "published"]),
});

export type CourseFormValues = z.infer<typeof courseFormSchema>;
export type WhyChooseItemValues = z.infer<typeof whyChooseItemSchema>;
export type CourseFaqValues = z.infer<typeof courseFaqSchema>;
export type CareerRoleValues = z.infer<typeof careerRoleSchema>;
export type CourseFinalCtaValues = z.infer<typeof courseFinalCtaSchema>;
export type LessonValues = z.infer<typeof lessonSchema>;
export type ModuleValues = z.infer<typeof moduleSchema>;
export type TextReviewValues = z.infer<typeof textReviewSchema>;
export type VideoReviewValues = z.infer<typeof videoReviewSchema>;
export type ImageReviewValues = z.infer<typeof imageReviewSchema>;

/** Field groups per wizard step — used to validate a step before advancing. */
export const STEP_FIELDS: Record<number, (keyof CourseFormValues)[]> = {
  0: [
    "titleEn",
    "titleAr",
    "slug",
    "category",
    "difficulty",
    "programType",
    "attendanceMode",
    "descriptionEn",
    "image",
    "pricing",
    "duration",
    "language",
  ],
  1: ["whatYouWillLearnEn", "modules"],
  2: [],
};
