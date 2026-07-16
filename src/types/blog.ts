/**
 * Blog domain — UI view-model types (id-based). Backend DTOs (`_id`) live in
 * `@integration/services/blog`; the DAL maps between them.
 */
export type BlogStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type BlogLifecycleAction = "publish" | "unpublish" | "archive";

/* ── Block-builder layout ── */
export type SectionBg = "default" | "muted" | "soft" | "primary" | "dark" | "gradient";
export type BlockType =
  | "heading" | "paragraph" | "list" | "checklist" | "quote" | "image" | "gallery"
  | "embed" | "table" | "code" | "hero" | "stats" | "feature" | "testimonial"
  | "callout" | "faq" | "cta" | "button" | "divider";

export interface ArticleBlock {
  id: string;
  type: BlockType;
  level?: 2 | 3;
  text?: string;
  html?: string;
  url?: string;
  alt?: string;
  caption?: string;
  label?: string;
  ordered?: boolean;
  items?: string[];
  variant?: "info" | "tip" | "warning" | "success";
  cite?: string;
  lang?: string;
  metrics?: { value: string; label: string }[];
  size?: "sm" | "md" | "lg";
  rows?: string[][];
  images?: { url: string; alt?: string }[];
  faqs?: { q: string; a: string }[];
}
export interface ArticleColumn { id: string; blocks: ArticleBlock[] }
export interface ArticleSection { id: string; columns: 1 | 2 | 3 | 4; bg: SectionBg; cols: ArticleColumn[] }

/* ── Entities ── */
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl?: string;
  category?: string;
  tags: string[];
  language?: string;
  status: BlogStatus;
  featured: boolean;
  authorId?: string;
  authorName?: string;
  readingMinutes: number;
  seoTitle?: string;
  seoDescription?: string;
  views: number;
  publishedAt?: string;
  sections?: ArticleSection[];
  /** Curated course slugs rendered as the "Related courses" block. */
  relatedCourseSlugs?: string[];
  createdAt?: string;
  updatedAt?: string;
}
export type BlogInput = Partial<Omit<BlogPost, "id" | "views" | "createdAt" | "updatedAt">>;

export type BlogCategoryColor = "primary" | "info" | "success" | "warning" | "destructive" | "neutral";
export interface BlogCategory {
  id: string; name: string; slug: string; description: string; color: BlogCategoryColor;
  image?: string; rank: number; status: "active" | "inactive"; seoTitle?: string; seoDescription?: string;
  articleCount?: number; createdAt?: string;
}
export type BlogCategoryInput = Partial<Omit<BlogCategory, "id" | "articleCount">>;

export interface BlogSubcategory extends Omit<BlogCategory, "articleCount"> {
  categoryId: string; categoryName?: string; articleCount?: number;
}
export type BlogSubcategoryInput = Partial<Omit<BlogSubcategory, "id" | "articleCount" | "categoryName">> & { categoryId?: string };

export interface BlogAuthor {
  id: string; name: string; email?: string; avatarUrl?: string; role?: string; bio?: string; articleCount?: number; totalViews?: number;
}
export type BlogAuthorInput = Partial<Omit<BlogAuthor, "id" | "articleCount" | "totalViews">>;

export interface BlogTemplate { id: string; name: string; description?: string; doc: Record<string, unknown> }
export type BlogTemplateInput = Partial<Omit<BlogTemplate, "id">>;

export interface BlogListParams { page?: number; limit?: number; q?: string; status?: BlogStatus; category?: string; tag?: string }
export interface Paginated<T> { data: T[]; meta: { total: number; page: number; limit: number; totalPages: number } }
export interface BlogCategoryLanding { category: BlogCategory; data: BlogPost[]; meta: Paginated<BlogPost>["meta"] }
