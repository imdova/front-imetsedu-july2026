import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { dal } from "@/lib/dal";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { staticPageMeta, type SeoLocale } from "@/lib/seo";
import { BlogExplorerLive } from "@/features/blog/components/blog-explorer-live";
import {
  BLOG_PAGE_SIZE,
  blogPageCount,
  blogPagePath,
  toArticleCardData,
} from "@/features/blog/lib/article-card-data";

/**
 * Every published article, newest first. Memoised so `generateMetadata` and the
 * page share one request, and cached upstream under the `blog` tag so an article
 * save clears every listing page at once.
 */
const loadPosts = cache(async () => {
  const res = await dal.blog.fetchPublicArticles({ limit: 200 });
  const posts = res.ok ? res.data.data : [];
  return [...posts].sort((a, b) => +new Date(b.publishedAt ?? 0) - +new Date(a.publishedAt ?? 0));
});

/** Pages that exist, for `generateStaticParams` on /blog/page/[page]. */
export async function blogListingPageNumbers(): Promise<number[]> {
  const total = (await loadPosts()).length;
  return Array.from({ length: Math.max(0, blogPageCount(total) - 1) }, (_, i) => i + 2);
}

export async function blogListingMetadata({
  locale,
  page,
}: {
  locale: string;
  page: number;
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "Marketing" });
  const posts = await loadPosts();
  const pages = blogPageCount(posts.length);

  /*
   * The listing's own chrome is translated, but the articles it lists are not:
   * all of them are English today. So /ar/blog is a page of English headlines
   * with an Arabic frame — worth keeping reachable, not worth indexing, and not
   * an Arabic alternate of /blog.
   *
   * Both facts come from the posts themselves, so the day an Arabic article is
   * published the page indexes itself and the alternate appears.
   */
  const hasArabic = posts.some((p) => p.language === "ar");
  const locales: SeoLocale[] = hasArabic ? ["en", "ar"] : ["en"];

  // Every page is its own canonical: page 2 is not a duplicate of page 1, it
  // lists different articles, so it carries its own title and description.
  const title = page > 1 ? `${t("blogTitle")} — Page ${page}` : t("blogTitle");
  const description = page > 1 ? `${t("blogSubtitle")} Page ${page} of ${pages}.` : t("blogSubtitle");

  return staticPageMeta({
    title,
    description,
    path: blogPagePath(page),
    locale,
    locales,
    noindex: locale === "ar" && !hasArabic,
  });
}

export async function BlogListing({ locale, page }: { locale: string; page: number }) {
  const t = await getTranslations({ locale, namespace: "Marketing" });
  const [posts, catsRes] = await Promise.all([loadPosts(), dal.blog.fetchPublicCategoryNames()]);
  const categories = catsRes.ok ? catsRes.data : [];

  const pages = blogPageCount(posts.length);
  if (!Number.isInteger(page) || page < 1 || page > pages) notFound();

  const pagePosts = posts.slice((page - 1) * BLOG_PAGE_SIZE, page * BLOG_PAGE_SIZE).map(toArticleCardData);
  const tags = [...new Set(posts.flatMap((p) => p.tags ?? []))].slice(0, 24);
  const ar = locale === "ar";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Hero band */}
      <div className="mb-10 overflow-hidden rounded-3xl bg-gradient-to-br from-primary/[0.1] via-primary/[0.04] to-transparent p-8 ring-1 ring-primary/10 sm:p-12">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-primary">
          {ar ? "المدونة" : "Insights"}
        </span>
        <h1 className="mt-4 font-heading text-3xl font-bold leading-tight tracking-tight text-balance sm:text-[2.6rem]">
          {t("blogTitle")}
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          {t("blogSubtitle")}
        </p>
        <div className="mt-6 flex flex-wrap gap-2.5 text-sm">
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-card px-3 py-1.5 font-medium shadow-sm ring-1 ring-border/60">
            <span className="font-heading font-bold text-primary">{posts.length}</span>
            {ar ? "مقالة" : "articles"}
          </span>
          {categories.length > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-card px-3 py-1.5 font-medium shadow-sm ring-1 ring-border/60">
              <span className="font-heading font-bold text-primary">{categories.length}</span>
              {ar ? "أقسام" : "topics"}
            </span>
          )}
          <Link
            href="/become-author"
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            {ar ? "اكتب مع IMETS" : "Write for IMETS"}
          </Link>
        </div>
      </div>

      <BlogExplorerLive posts={pagePosts} categories={categories} tags={tags}>
        <BlogPagination page={page} pages={pages} ar={ar} />
      </BlogExplorerLive>
    </div>
  );
}

/**
 * Plain links, so every page of the archive is reachable by a crawler with no
 * JavaScript. Rendered on the server and handed to the explorer as `children`.
 */
function BlogPagination({ page, pages, ar }: { page: number; pages: number; ar: boolean }) {
  if (pages <= 1) return null;
  const numbers = Array.from({ length: pages }, (_, i) => i + 1);

  const item = "inline-flex size-9 items-center justify-center rounded-lg border text-sm font-medium transition-colors";
  return (
    <nav aria-label={ar ? "ترقيم الصفحات" : "Pagination"} className="mt-10 flex flex-wrap items-center justify-center gap-1.5">
      {page > 1 && (
        <Link
          href={blogPagePath(page - 1)}
          rel="prev"
          className={cn(item, "w-auto gap-1 px-3 hover:bg-muted")}
        >
          <ChevronLeft className="size-4 rtl:rotate-180" />
          {ar ? "السابق" : "Previous"}
        </Link>
      )}
      {numbers.map((n) => (
        <Link
          key={n}
          href={blogPagePath(n)}
          aria-current={n === page ? "page" : undefined}
          aria-label={ar ? `صفحة ${n}` : `Page ${n}`}
          className={cn(item, n === page ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted")}
        >
          {n}
        </Link>
      ))}
      {page < pages && (
        <Link
          href={blogPagePath(page + 1)}
          rel="next"
          className={cn(item, "w-auto gap-1 px-3 hover:bg-muted")}
        >
          {ar ? "التالي" : "Next"}
          <ChevronRight className="size-4 rtl:rotate-180" />
        </Link>
      )}
    </nav>
  );
}
