export interface LessonResource {
  id: string; // Required for local state management
  nameAr: string;
  nameEn: string;
  url: string;
  type: string;
}

export interface CourseLesson {
  id: string;
  lesson_type: "video" | "quiz" | "pdf" | "text";
  titleAr: string;
  titleEn: string;
  order: number;
  videoUrl?: string;
  fileName?: string; // Added for local UI tracking
  quizId?: string;
  isFreePreview: boolean;
  duration?: string;
  resources?: LessonResource[];
}

export interface CourseModule {
  id: string; // Keep as required for local state management
  titleAr: string;
  titleEn: string;
  order: number;
  lessons: CourseLesson[];
}

export interface TextReview {
  reviewerName: string;
  title: string;
  reviewerImage: string;
  rating: number;
  comment: string;
}

export interface VideoReview {
  url: string;
}

export interface ImageReview {
  url: string;
}

/** One "Why Professionals Choose <course>" reason card on the public page. */
export interface WhyChooseItem {
  titleAr: string;
  titleEn: string;
  bodyAr: string;
  bodyEn: string;
}

/** One question/answer pair in the public page's FAQ accordion. */
export interface CourseFaq {
  questionAr: string;
  questionEn: string;
  answerAr: string;
  answerEn: string;
}

/** One rung of the public page's "Career Outcomes" ladder. Array order IS the
 *  progression (entry level first). */
export interface CareerRole {
  titleAr: string;
  titleEn: string;
}

export interface PricingDetails {
  price: number;
  salePrice: number;
  discount: number;
}

export interface CourseFormData {
  titleAr: string;
  titleEn: string;
  slug: string;
  category: string;
  /** Backend column kept for other consumers; the admin course form no longer
   *  collects or sends it. */
  subcategory?: string;
  descriptionAr: string;
  descriptionEn: string;
  headlineAr?: string;
  headlineEn?: string;
  subHeadlineAr?: string;
  subHeadlineEn?: string;
  whoCanAttendAr: string;
  whoCanAttendEn: string;
  whatYouWillLearnAr: string[];
  whatYouWillLearnEn: string[];
  whatYouWillLearnArText?: string;
  whatYouWillLearnEnText?: string;
  whyChoose: WhyChooseItem[];
  faqs: CourseFaq[];
  careerRoles: CareerRole[];
  /** Curated related-course slugs; empty ⇒ same-category fallback. */
  relatedCourseSlugs: string[];
  pricing: {
    egp: PricingDetails;
    sar: PricingDetails;
    usd: PricingDetails;
  };
  // Pricing helpers for UI
  priceEGP?: number;
  salePriceEGP?: number;
  discountPercentageEGP?: number;
  priceSAR?: number;
  salePriceSAR?: number;
  discountPercentageSAR?: number;
  priceUSD?: number;
  salePriceUSD?: number;
  discountPercentageUSD?: number;

  image: string;
  thumbnailPreview?: string; // UI helper
  gallery: string[];
  students: number;
  lectures: number;
  duration: string;
  tags: string[];
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  seo: {
    metaTitleAr: string;
    metaTitleEn: string;
    metaDescriptionAr: string;
    metaDescriptionEn: string;
    metaKeywordsAr: string[];
    metaKeywordsEn: string[];
  };
  instructorIds: string[];
  variables: Record<string, string | string[]>;
  courseVariables?: Record<string, string | string[]>; // UI helper
  modules: CourseModule[];
  textReviews: TextReview[];
  videosReviews: VideoReview[];
  imagesReviews: ImageReview[];
  previewVideoUrl?: string;
  courseOverview: string;
  courseOverviewFile?: string; // UI helper – stores the uploaded PDF URL
  webhookUrl?: string;
  status: "draft" | "published";
  isActive: boolean;
  isFeatured: boolean;
  isBestseller: boolean;
  isTopRated: boolean;
}
