/**
 * Domain contracts for the Sub-categories service.
 */

export interface SubCategoryFAQ {
  questionAr: string;
  questionEn: string;
  answerAr: string;
  answerEn: string;
}

export interface SubCategorySEO {
  metaTitleAr?: string;
  metaTitleEn?: string;
  metaDescriptionAr?: string;
  metaDescriptionEn?: string;
  metaKeywordsAr?: string[];
  metaKeywordsEn?: string[];
}

export interface CreateSubCategoryInput {
  nameAr: string;
  nameEn: string;
  slug: string;
  priority?: number;
  parentCategory: string; // Category ID
  icon?: string;
  image?: string;
  headlineAr?: string;
  headlineEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  seo?: SubCategorySEO;
  faqs?: SubCategoryFAQ[];
  isActive?: boolean;
}

export type UpdateSubCategoryInput = Partial<CreateSubCategoryInput>;

export interface SubCategory extends CreateSubCategoryInput {
  id: string;
  coursesCount?: number;
  createdAt?: string;
  updatedAt?: string;
}
