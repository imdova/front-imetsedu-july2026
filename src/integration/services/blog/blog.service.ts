import { api, type Result } from "@integration/services/http/client";
import {
  API_BLOG, apiBlogBySlug, API_BLOG_CATEGORIES_PUBLIC, API_BLOG_TOPICS, apiBlogCategoryLanding,
  API_ADMIN_BLOG, apiAdminBlog, apiAdminBlogAction, apiAdminBlogFeatured,
  API_ADMIN_BLOG_CATEGORIES, apiAdminBlogCategory,
  API_ADMIN_BLOG_SUBCATEGORIES, apiAdminBlogSubcategory,
  API_ADMIN_BLOG_AUTHORS, apiAdminBlogAuthor,
  API_ADMIN_BLOG_TEMPLATES, apiAdminBlogTemplate,
} from "@integration/constants/api/blog";
import type {
  BlogPostDto, BlogCategoryDto, BlogSubcategoryDto, BlogAuthorDto, BlogTemplateDto,
  BlogCategoryLandingDto, PaginatedDto,
} from "./types";
import type { BlogListParams } from "@/types/blog";

const listParams = (p: BlogListParams = {}): Record<string, string | number | boolean> => {
  const out: Record<string, string | number | boolean> = {};
  if (p.page) out.page = p.page;
  if (p.limit) out.limit = p.limit;
  if (p.q) out.q = p.q;
  if (p.status) out.status = p.status;
  if (p.category) out.category = p.category;
  if (p.tag) out.tag = p.tag;
  return out;
};

/* ── Public ── */
export const listPublic = (p?: BlogListParams): Promise<Result<PaginatedDto<BlogPostDto>>> =>
  api.get(API_BLOG, { requireAuth: false, params: listParams(p), revalidate: 120 });
export const getPublicBySlug = (slug: string): Promise<Result<BlogPostDto>> =>
  // no-store: the backend increments `views` on read, so each visit must hit it.
  api.get(apiBlogBySlug(slug), { requireAuth: false, revalidate: false });
export const publicCategoryNames = (): Promise<Result<string[]>> =>
  api.get(API_BLOG_CATEGORIES_PUBLIC, { requireAuth: false, revalidate: 300 });
export const topics = (): Promise<Result<BlogCategoryDto[]>> =>
  api.get(API_BLOG_TOPICS, { requireAuth: false, revalidate: 300 });
export const categoryLanding = (slug: string, p?: BlogListParams): Promise<Result<BlogCategoryLandingDto>> =>
  api.get(apiBlogCategoryLanding(slug), { requireAuth: false, params: listParams(p), revalidate: 120 });

/* ── Admin articles ── */
export const listAdmin = (p?: BlogListParams): Promise<Result<PaginatedDto<BlogPostDto>>> =>
  api.get(API_ADMIN_BLOG, { params: listParams(p) });
export const getAdmin = (id: string): Promise<Result<BlogPostDto>> => api.get(apiAdminBlog(id));
export const create = (input: Record<string, unknown>): Promise<Result<BlogPostDto>> => api.post(API_ADMIN_BLOG, input);
export const update = (id: string, input: Record<string, unknown>): Promise<Result<BlogPostDto>> => api.patch(apiAdminBlog(id), input);
export const remove = (id: string): Promise<Result<{ success: boolean }>> => api.delete(apiAdminBlog(id));
export const lifecycle = (id: string, action: string): Promise<Result<BlogPostDto>> => api.post(apiAdminBlogAction(id, action), {});
export const toggleFeatured = (id: string): Promise<Result<BlogPostDto>> => api.patch(apiAdminBlogFeatured(id), {});

/* ── Categories ── */
export const listCategories = (): Promise<Result<BlogCategoryDto[]>> => api.get(API_ADMIN_BLOG_CATEGORIES);
export const createCategory = (input: Record<string, unknown>): Promise<Result<BlogCategoryDto>> => api.post(API_ADMIN_BLOG_CATEGORIES, input);
export const updateCategory = (id: string, input: Record<string, unknown>): Promise<Result<BlogCategoryDto>> => api.patch(apiAdminBlogCategory(id), input);
export const deleteCategory = (id: string): Promise<Result<{ success: boolean }>> => api.delete(apiAdminBlogCategory(id));

/* ── Subcategories ── */
export const listSubcategories = (categoryId?: string): Promise<Result<BlogSubcategoryDto[]>> =>
  api.get(API_ADMIN_BLOG_SUBCATEGORIES, { params: categoryId ? { categoryId } : undefined });
export const createSubcategory = (input: Record<string, unknown>): Promise<Result<BlogSubcategoryDto>> => api.post(API_ADMIN_BLOG_SUBCATEGORIES, input);
export const updateSubcategory = (id: string, input: Record<string, unknown>): Promise<Result<BlogSubcategoryDto>> => api.patch(apiAdminBlogSubcategory(id), input);
export const deleteSubcategory = (id: string): Promise<Result<{ success: boolean }>> => api.delete(apiAdminBlogSubcategory(id));

/* ── Authors ── */
export const listAuthors = (): Promise<Result<BlogAuthorDto[]>> => api.get(API_ADMIN_BLOG_AUTHORS);
export const createAuthor = (input: Record<string, unknown>): Promise<Result<BlogAuthorDto>> => api.post(API_ADMIN_BLOG_AUTHORS, input);
export const updateAuthor = (id: string, input: Record<string, unknown>): Promise<Result<BlogAuthorDto>> => api.patch(apiAdminBlogAuthor(id), input);
export const deleteAuthor = (id: string): Promise<Result<{ success: boolean }>> => api.delete(apiAdminBlogAuthor(id));

/* ── Templates ── */
export const listTemplates = (): Promise<Result<BlogTemplateDto[]>> => api.get(API_ADMIN_BLOG_TEMPLATES);
export const getTemplate = (id: string): Promise<Result<BlogTemplateDto>> => api.get(apiAdminBlogTemplate(id));
export const createTemplate = (input: Record<string, unknown>): Promise<Result<BlogTemplateDto>> => api.post(API_ADMIN_BLOG_TEMPLATES, input);
export const updateTemplate = (id: string, input: Record<string, unknown>): Promise<Result<BlogTemplateDto>> => api.patch(apiAdminBlogTemplate(id), input);
export const deleteTemplate = (id: string): Promise<Result<{ success: boolean }>> => api.delete(apiAdminBlogTemplate(id));
