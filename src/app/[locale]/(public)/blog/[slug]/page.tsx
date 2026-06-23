import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarDays, Clock, ArrowLeft } from "lucide-react";
import { setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import { Badge } from "@/components/ui/badge";
import { JsonLd } from "@/components/seo/json-ld";
import { SITE_URL, SITE_NAME, localeUrl, metaDescription } from "@/lib/seo";
import { ArticleSections, ArticleContent } from "@/features/blog/components/article-sections";

// Memoize per request so generateMetadata + the page share one fetch
// (the backend increments `views` on read — we want exactly one increment).
const getArticle = cache((slug: string) => dal.blog.fetchArticleBySlug(slug));

const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("en", { month: "long", day: "numeric", year: "numeric" }) : "";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const res = await getArticle(slug);
  if (!res.ok) return {};
  const post = res.data;
  const title = post.seoTitle || post.title;
  const description = post.seoDescription || metaDescription(post.excerpt, title);
  const url = localeUrl(`/blog/${post.slug}`, locale);
  const ogImage = post.coverImageUrl || `${SITE_URL}/blog/${post.slug}/og`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: "article", title, description, url, images: [ogImage], publishedTime: post.publishedAt },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
  };
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const res = await getArticle(slug);
  if (!res.ok || !res.data) notFound();
  const post = res.data;

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: post.coverImageUrl || undefined,
    datePublished: post.publishedAt,
    author: post.authorName ? { "@type": "Person", name: post.authorName } : undefined,
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    mainEntityOfPage: localeUrl(`/blog/${post.slug}`, locale),
  };

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <JsonLd data={articleLd} />
      <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4 rtl:rotate-180" /> All articles
      </Link>

      <header className="mt-4 space-y-3">
        {post.category && <Badge variant="secondary">{post.category}</Badge>}
        <h1 className="font-heading text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{post.title}</h1>
        {post.excerpt && <p className="text-lg text-muted-foreground">{post.excerpt}</p>}
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          {post.authorName && <span className="font-medium text-foreground">{post.authorName}</span>}
          {post.publishedAt && <span className="inline-flex items-center gap-1"><CalendarDays className="size-4" />{fmtDate(post.publishedAt)}</span>}
          <span className="inline-flex items-center gap-1"><Clock className="size-4" />{post.readingMinutes} min read</span>
        </div>
      </header>

      {post.coverImageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.coverImageUrl} alt={post.title} className="mt-6 w-full rounded-2xl" />
      )}

      <div className="mt-8">
        {post.sections && post.sections.length > 0 ? (
          <ArticleSections sections={post.sections} />
        ) : (
          <ArticleContent html={post.content} />
        )}
      </div>

      {post.tags.length > 0 && (
        <div className="mt-10 flex flex-wrap gap-2 border-t border-border/60 pt-6">
          {post.tags.map((t) => <Badge key={t} variant="outline">{t}</Badge>)}
        </div>
      )}
    </article>
  );
}
