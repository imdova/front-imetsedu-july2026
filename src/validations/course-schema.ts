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

const urlOrEmpty = z
  .string()
  .trim()
  .refine((v) => v === "" || /^https?:\/\/.+/.test(v), {
    message: "Enter a valid URL",
  });

const youtubeOrEmpty = z
  .string()
  .trim()
  .refine(
    (v) =>
      v === "" ||
      /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/.test(v),
    { message: "Enter a valid YouTube URL" },
  );

/** One currency block (price / sale price / discount). */
const pricingDetailSchema = z
  .object({
    price: z.coerce.number().min(0, "Must be ≥ 0"),
    salePrice: z.coerce.number().min(0, "Must be ≥ 0"),
    discount: z.coerce.number().min(0).max(100, "0–100 only"),
  })
  .refine((d) => d.salePrice === 0 || d.salePrice <= d.price, {
    message: "Sale price must be ≤ price",
    path: ["salePrice"],
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
  titleEn: z.string().trim().min(1, "Lesson title is required"),
  titleAr: z.string().trim(),
  order: z.number().int().nonnegative(),
  videoUrl: z.string().trim().optional(),
  isFreePreview: z.boolean(),
  duration: z.string().trim().optional(),
});

/** A curriculum module containing ordered lessons. */
export const moduleSchema = z.object({
  id: z.string(),
  titleEn: z.string().trim().min(1, "Module title is required"),
  titleAr: z.string().trim(),
  order: z.number().int().nonnegative(),
  lessons: z.array(lessonSchema),
});

export const courseFormSchema = z.object({
  /* --- Identification --- */
  titleEn: z.string().trim().min(3, "Course title is required"),
  titleAr: z.string().trim().min(3, "العنوان مطلوب"),
  slug: z
    .string()
    .trim()
    .min(3, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase, hyphenated, no spaces"),

  /* --- Classification --- */
  category: z.string().min(1, "Select a category"),
  subcategory: z.string().min(1, "Select a subcategory"),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),
  programType: z.string().min(1, "Select a program type"),
  attendanceMode: z.enum(["online-zoom", "offline"]),

  /* --- Content --- */
  descriptionEn: z.string().trim().min(20, "Add a detailed description"),
  descriptionAr: z.string().trim(),

  /* --- Media --- */
  previewVideoUrl: youtubeOrEmpty,
  image: z.string().trim().min(1, "A cover image is required"),
  courseOverviewFile: z.string().trim(),

  /* --- Pricing (EGP required, SAR/USD optional) --- */
  pricing: z.object({
    egp: pricingDetailSchema,
    sar: pricingDetailSchema,
    usd: pricingDetailSchema,
  }),

  /* --- Sidebar stats & meta --- */
  students: z.coerce.number().int().min(0),
  lectures: z.coerce.number().int().min(0),
  duration: z.string().trim().min(1, "Duration is required"),
  language: z
    .array(z.enum(["English", "Arabic", "French", "Spanish"]))
    .min(1, "Pick at least one language"),

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
    metaTitleEn: z.string().trim().max(60, "≤ 60 characters recommended"),
    metaTitleAr: z.string().trim(),
    metaDescriptionEn: z
      .string()
      .trim()
      .max(160, "≤ 160 characters recommended"),
    metaDescriptionAr: z.string().trim(),
    metaKeywordsEn: z.array(z.string()),
    metaKeywordsAr: z.array(z.string()),
  }),

  /* --- Step 2: Structure --- */
  whatYouWillLearnEn: z
    .array(z.string().trim().min(1))
    .min(1, "Add at least one learning outcome"),
  whatYouWillLearnAr: z.array(z.string().trim()),
  whoCanAttendEn: z.string().trim(),
  whoCanAttendAr: z.string().trim(),
  modules: z.array(moduleSchema).min(1, "Add at least one module"),

  /* --- Step 3: Media & Reviews (optional) --- */
  gallery: z.array(z.string()),
  videosReviews: z.array(videoReviewSchema),
  imagesReviews: z.array(imageReviewSchema),
  textReviews: z.array(textReviewSchema),

  /* --- Publish state --- */
  status: z.enum(["draft", "published"]),
});

export type CourseFormValues = z.infer<typeof courseFormSchema>;
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
    "subcategory",
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
