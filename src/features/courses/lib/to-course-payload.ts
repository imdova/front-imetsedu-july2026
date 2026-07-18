import type { CourseFormValues } from "@/validations/course-schema";
import type { CourseFormData } from "@/types";

/**
 * Maps the form's view-model (`CourseFormValues`) onto the backend contract
 * (`CourseFormData`). Form-only fields with no contract slot (programType,
 * attendanceMode, language, webhook) are preserved under `variables` so nothing
 * is lost before the API exists. This is the single place to adjust if the
 * backend payload shape changes.
 */
export function toCoursePayload(v: CourseFormValues): CourseFormData {
  return {
    titleAr: v.titleAr,
    titleEn: v.titleEn,
    slug: v.slug,
    category: v.category,
    descriptionAr: v.descriptionAr,
    descriptionEn: v.descriptionEn,
    headlineAr: v.headlineAr,
    headlineEn: v.headlineEn,
    subHeadlineAr: v.subHeadlineAr,
    subHeadlineEn: v.subHeadlineEn,
    whoCanAttendAr: v.whoCanAttendAr,
    whoCanAttendEn: v.whoCanAttendEn,
    whatYouWillLearnAr: v.whatYouWillLearnAr,
    whatYouWillLearnEn: v.whatYouWillLearnEn,
    whyChoose: v.whyChoose,
    faqs: v.faqs,
    careerRoles: v.careerRoles,
    relatedCourseSlugs: v.relatedCourseSlugs,
    finalCta: v.finalCta,
    quote: v.quote,
    headings: v.headings,
    pricing: v.pricing,
    image: v.image,
    gallery: v.gallery,
    students: v.students,
    lectures: v.lectures,
    duration: v.duration,
    tags: v.tags,
    difficulty: v.difficulty,
    seo: v.seo,
    instructorIds: v.instructorIds,
    variables: {
      programType: v.programType,
      attendanceMode: v.attendanceMode,
      language: v.language,
      webhookUrl: v.webhookUrl ?? "",
    },
    modules: v.modules,
    textReviews: v.textReviews,
    videosReviews: v.videosReviews,
    imagesReviews: v.imagesReviews,
    previewVideoUrl: v.previewVideoUrl,
    courseOverview: v.courseOverviewFile ?? "",
    webhookUrl: v.webhookUrl,
    status: v.status,
    isActive: v.isActive,
    isFeatured: v.isFeatured,
    isBestseller: v.isBestseller,
    isTopRated: v.isTopRated,
  };
}
