/**
 * Blog DAL — LIVE against the NestJS `blog` module via `@integration/services/blog`,
 * mapping backend `_id` → UI `id`. UI types come from `@/types/blog`.
 */
import { ok, type Result } from "@integration/lib/api-client";
import * as svc from "@integration/services/blog";
import type {
  BlogPost, BlogInput, BlogCategory, BlogCategoryInput, BlogSubcategory, BlogSubcategoryInput,
  BlogAuthor, BlogAuthorInput, BlogTemplate, BlogTemplateInput,
  BlogListParams, Paginated, BlogCategoryLanding,
} from "@/types/blog";

function mapId<T>(d: svc.Raw<T>): T {
  const { _id, ...rest } = d;
  return { ...(rest as object), id: _id } as T;
}
function mapPage<T>(p: svc.PaginatedDto<svc.Raw<T>>): Paginated<T> {
  return { data: p.data.map((d) => mapId<T>(d)), meta: p.meta };
}
const rec = (o: object) => o as unknown as Record<string, unknown>;

/* ── Public ── */
export async function fetchPublicArticles(p?: BlogListParams): Promise<Result<Paginated<BlogPost>>> {
  const res = await svc.listPublic(p);
  return res.ok ? ok(mapPage<BlogPost>(res.data)) : res;
}
export async function fetchArticleBySlug(slug: string): Promise<Result<BlogPost>> {
  const res = await svc.getPublicBySlug(slug);
  return res.ok ? ok(mapId<BlogPost>(res.data)) : res;
}
export const fetchPublicCategoryNames = () => svc.publicCategoryNames();
export async function fetchTopics(): Promise<Result<BlogCategory[]>> {
  const res = await svc.topics();
  return res.ok ? ok(res.data.map((d) => mapId<BlogCategory>(d))) : res;
}
export async function fetchCategoryLanding(slug: string, p?: BlogListParams): Promise<Result<BlogCategoryLanding>> {
  const res = await svc.categoryLanding(slug, p);
  return res.ok ? ok({ category: mapId<BlogCategory>(res.data.category), data: res.data.data.map((d) => mapId<BlogPost>(d)), meta: res.data.meta }) : res;
}

/* ── Admin articles ── */
export async function fetchArticles(p?: BlogListParams): Promise<Result<Paginated<BlogPost>>> {
  const res = await svc.listAdmin(p);
  return res.ok ? ok(mapPage<BlogPost>(res.data)) : res;
}
export async function fetchArticle(id: string): Promise<Result<BlogPost>> {
  const res = await svc.getAdmin(id);
  return res.ok ? ok(mapId<BlogPost>(res.data)) : res;
}
export async function createArticle(input: BlogInput): Promise<Result<BlogPost>> {
  const res = await svc.create(rec(input));
  return res.ok ? ok(mapId<BlogPost>(res.data)) : res;
}
export async function updateArticle(id: string, input: BlogInput): Promise<Result<BlogPost>> {
  const res = await svc.update(id, rec(input));
  return res.ok ? ok(mapId<BlogPost>(res.data)) : res;
}
export async function deleteArticle(id: string): Promise<Result<boolean>> {
  const res = await svc.remove(id);
  return res.ok ? ok(true) : res;
}
export async function articleLifecycle(id: string, action: string): Promise<Result<BlogPost>> {
  const res = await svc.lifecycle(id, action);
  return res.ok ? ok(mapId<BlogPost>(res.data)) : res;
}
export async function toggleFeatured(id: string): Promise<Result<BlogPost>> {
  const res = await svc.toggleFeatured(id);
  return res.ok ? ok(mapId<BlogPost>(res.data)) : res;
}

/** AI assist (server-side Claude) — `type`: "excerpt" | "tags" | "keyword". */
export function aiAssist(input: {
  type: "excerpt" | "tags" | "keyword";
  title: string;
  content?: string;
  excerpt?: string;
  language?: string;
}): Promise<Result<svc.AiAssistResult>> {
  return svc.aiAssist(input as unknown as Record<string, unknown>);
}

/* ── Categories ── */
export async function fetchCategories(): Promise<Result<BlogCategory[]>> {
  const res = await svc.listCategories();
  return res.ok ? ok(res.data.map((d) => mapId<BlogCategory>(d))) : res;
}
export async function createCategory(input: BlogCategoryInput): Promise<Result<BlogCategory>> {
  const res = await svc.createCategory(rec(input));
  return res.ok ? ok(mapId<BlogCategory>(res.data)) : res;
}
export async function updateCategory(id: string, input: BlogCategoryInput): Promise<Result<BlogCategory>> {
  const res = await svc.updateCategory(id, rec(input));
  return res.ok ? ok(mapId<BlogCategory>(res.data)) : res;
}
export async function deleteCategory(id: string): Promise<Result<boolean>> {
  const res = await svc.deleteCategory(id);
  return res.ok ? ok(true) : res;
}

/* ── Subcategories ── */
export async function fetchSubcategories(categoryId?: string): Promise<Result<BlogSubcategory[]>> {
  const res = await svc.listSubcategories(categoryId);
  return res.ok ? ok(res.data.map((d) => mapId<BlogSubcategory>(d))) : res;
}
export async function createSubcategory(input: BlogSubcategoryInput): Promise<Result<BlogSubcategory>> {
  const res = await svc.createSubcategory(rec(input));
  return res.ok ? ok(mapId<BlogSubcategory>(res.data)) : res;
}
export async function updateSubcategory(id: string, input: BlogSubcategoryInput): Promise<Result<BlogSubcategory>> {
  const res = await svc.updateSubcategory(id, rec(input));
  return res.ok ? ok(mapId<BlogSubcategory>(res.data)) : res;
}
export async function deleteSubcategory(id: string): Promise<Result<boolean>> {
  const res = await svc.deleteSubcategory(id);
  return res.ok ? ok(true) : res;
}

/* ── Authors ── */
export async function fetchAuthors(): Promise<Result<BlogAuthor[]>> {
  const res = await svc.listAuthors();
  return res.ok ? ok(res.data.map((d) => mapId<BlogAuthor>(d))) : res;
}
export async function createAuthor(input: BlogAuthorInput): Promise<Result<BlogAuthor>> {
  const res = await svc.createAuthor(rec(input));
  return res.ok ? ok(mapId<BlogAuthor>(res.data)) : res;
}
export async function updateAuthor(id: string, input: BlogAuthorInput): Promise<Result<BlogAuthor>> {
  const res = await svc.updateAuthor(id, rec(input));
  return res.ok ? ok(mapId<BlogAuthor>(res.data)) : res;
}
export async function deleteAuthor(id: string): Promise<Result<boolean>> {
  const res = await svc.deleteAuthor(id);
  return res.ok ? ok(true) : res;
}

/* ── Templates ── */
export async function fetchTemplates(): Promise<Result<BlogTemplate[]>> {
  const res = await svc.listTemplates();
  return res.ok ? ok(res.data.map((d) => mapId<BlogTemplate>(d))) : res;
}
export async function fetchTemplate(id: string): Promise<Result<BlogTemplate>> {
  const res = await svc.getTemplate(id);
  return res.ok ? ok(mapId<BlogTemplate>(res.data)) : res;
}
export async function createTemplate(input: BlogTemplateInput): Promise<Result<BlogTemplate>> {
  const res = await svc.createTemplate(rec(input));
  return res.ok ? ok(mapId<BlogTemplate>(res.data)) : res;
}
export async function updateTemplate(id: string, input: BlogTemplateInput): Promise<Result<BlogTemplate>> {
  const res = await svc.updateTemplate(id, rec(input));
  return res.ok ? ok(mapId<BlogTemplate>(res.data)) : res;
}
export async function deleteTemplate(id: string): Promise<Result<boolean>> {
  const res = await svc.deleteTemplate(id);
  return res.ok ? ok(true) : res;
}
