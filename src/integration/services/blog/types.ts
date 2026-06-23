import type {
  BlogPost, BlogCategory, BlogSubcategory, BlogAuthor, BlogTemplate, BlogCategoryLanding,
} from "@/types/blog";

/** Backend documents are id'd by `_id`; the DAL maps these to the UI `id` shape. */
export type Raw<T> = Omit<T, "id"> & { _id: string };

export type BlogPostDto = Raw<BlogPost>;
export type BlogCategoryDto = Raw<BlogCategory>;
export type BlogSubcategoryDto = Raw<BlogSubcategory>;
export type BlogAuthorDto = Raw<BlogAuthor>;
export type BlogTemplateDto = Raw<BlogTemplate>;
export type BlogCategoryLandingDto = { category: BlogCategoryDto; data: BlogPostDto[]; meta: BlogCategoryLanding["meta"] };

export interface PaginatedDto<T> { data: T[]; meta: { total: number; page: number; limit: number; totalPages: number } }
