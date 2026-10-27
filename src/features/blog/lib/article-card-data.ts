import type { BlogPost } from "@/types/blog";

/** Posts per listing page. */
export const BLOG_PAGE_SIZE = 12;

/**
 * Everything an article card renders, and what the explorer sorts and filters on.
 *
 * The list endpoint returns whole articles — the rendered body, every section and
 * block — and the explorer is a client component, so handing it those serialised
 * all of them into the page: ~10 KB a post, ~500 KB for the listing. A card shows
 * a headline, an excerpt, a handful of tags and a byline.
 */
export type ArticleCardData = Pick<
  BlogPost,
  | "id"
  | "slug"
  | "language"
  | "title"
  | "excerpt"
  | "coverImageUrl"
  | "category"
  | "tags"
  | "featured"
  | "publishedAt"
  | "readingMinutes"
  | "authorName"
  | "views"
>;

export function toArticleCardData(p: BlogPost): ArticleCardData {
  return {
    id: p.id,
    slug: p.slug,
    language: p.language,
    title: p.title,
    excerpt: p.excerpt,
    coverImageUrl: p.coverImageUrl,
    category: p.category,
    // The card shows three; the tag filter needs the rest, but not dozens.
    tags: (p.tags ?? []).slice(0, 8),
    featured: p.featured,
    publishedAt: p.publishedAt,
    readingMinutes: p.readingMinutes,
    authorName: p.authorName,
    views: p.views,
  };
}

export const blogPageCount = (total: number) => Math.max(1, Math.ceil(total / BLOG_PAGE_SIZE));

/** The path of listing page `n`. Page 1 is the listing itself, not /blog/page/1. */
export const blogPagePath = (n: number) => (n <= 1 ? "/blog" : `/blog/page/${n}`);
