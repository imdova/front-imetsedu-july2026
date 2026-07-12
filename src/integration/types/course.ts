import { CourseModule } from "./courseForm";

export interface Review {
  id?: string;
  reviewerNameAr: string;
  reviewerNameEn: string;
  reviewerImage?: string;
  rating: number;
  commentAr: string;
  commentEn: string;
  reviewType: "text" | "image" | "video";
  media?: string[];
  date?: string;
}

export interface Course {
  id: string;
  _id?: string;
  slug: string;
  title: string;
  titleAr?: string;
  titleEn?: string;
  instructor?: string;
  instructorId?: string;
  instructorIds?: string[];
  instructorImage?: string;
  description: string;
  descriptionAr?: string;
  descriptionEn?: string;
  headlineAr?: string;
  headlineEn?: string;
  subHeadlineAr?: string;
  subHeadlineEn?: string;
  shortDescription?: string;
  whoCanAttendAr?: string;
  whoCanAttendEn?: string;
  whatYouWillLearnAr?: string[];
  whatYouWillLearnEn?: string[];
  pricing?: {
    egp: { price: number; salePrice: number; discount: number };
    sar: { price: number; salePrice: number; discount: number };
    usd: { price: number; salePrice: number; discount: number };
  };
  price?: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  studentCount: number;
  students?: number;
  image: string;
  category: any;
  subcategory?: any;
  subCategory?: any;
  level: "Beginner" | "Intermediate" | "Advanced";
  difficulty?: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  language: string | string[];
  lastUpdated: string;
  createdAt?: string;
  curriculum?: CourseModule[];
  modules?: CourseModule[];
  reviews?: Review[];
  textReviews?: import("./courseForm").TextReview[];
  videosReviews?: import("./courseForm").VideoReview[];
  imagesReviews?: import("./courseForm").ImageReview[];
  whatYouWillLearn?: string[];
  requirements?: string[];
  /** Popular section display */
  isBestSeller?: boolean;
  isFeatured?: boolean;
  isBestseller?: boolean;
  isTopRated?: boolean;
  priceEGP?: number;
  originalPriceEGP?: number;
  salePriceEGP?: number;
  lectureCount?: number;
  lectures?: number;
  lectureFrequency?: string;
  deliveryMode?: string;
  popularFilter?: string;
  popularFilterTags?: string[];
  tags?: string[];
  status?: "draft" | "published";
  isActive?: boolean;
  gallery?: string[];
  enrollment?: number;
  purchases?: number;
  revenue?: number;
  previewVideoUrl?: string;
  variables?: any;
  seo?: {
    metaTitleAr?: string;
    metaTitleEn?: string;
    metaDescriptionAr?: string;
    metaDescriptionEn?: string;
    metaKeywordsAr?: string[];
    metaKeywordsEn?: string[];
  };
}

export interface SubCategory {
  id: string;
  _id?: string;
  slug?: string;
  name: string;
  nameAr?: string;
  nameEn?: string;
  courseCount: number;
  icon: string;
  parentCategory?: any;
}

export interface Category {
  id: string;
  _id?: string;
  slug?: string;
  name: string;
  nameAr?: string;
  nameEn?: string;
  icon: string;
  courseCount: number;
  subCategories?: SubCategory[];
}
