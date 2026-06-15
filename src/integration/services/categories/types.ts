/**
 * Domain contracts for the Categories service.
 * Mirrors the bilingual shape returned by the public API.
 */

export interface CategoryFAQ {
  questionAr: string;
  questionEn: string;
  answerAr: string;
  answerEn: string;
}

export interface CategorySEO {
  metaTitleAr?: string;
  metaTitleEn?: string;
  metaDescriptionAr?: string;
  metaDescriptionEn?: string;
  metaKeywordsAr?: string[];
  metaKeywordsEn?: string[];
}

export interface CreateCategoryInput {
  nameAr: string;
  nameEn: string;
  slug: string;
  icon?: string;
  image?: string;
  headlineAr?: string;
  headlineEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  seo?: CategorySEO;
  faqs?: CategoryFAQ[];
  rank?: number;
  isActive?: boolean;
}

export type UpdateCategoryInput = Partial<CreateCategoryInput>;

export interface Category extends CreateCategoryInput {
  id: string;
  coursesCount?: number;
  createdAt?: string;
  updatedAt?: string;
}
