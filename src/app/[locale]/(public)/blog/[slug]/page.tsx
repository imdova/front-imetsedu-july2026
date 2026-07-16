import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { CalendarDays, Clock, ChevronRight, ArrowRight } from "lucide-react";
import { setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import { Badge } from "@/components/ui/badge";
import { JsonLd } from "@/components/seo/json-ld";
import { SITE_URL, SITE_NAME, localeUrl, metaDescription, breadcrumbLd } from "@/lib/seo";
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
    image: post.coverImageUrl || `${SITE_URL}/blog/${post.slug}/og`,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    inLanguage: post.language || locale,
    keywords: post.tags?.length ? post.tags.join(", ") : undefined,
    articleSection: post.category || undefined,
    author: post.authorName
      ? { "@type": "Organization", name: post.authorName }
      : { "@type": "Organization", name: SITE_NAME },
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    mainEntityOfPage: localeUrl(`/blog/${post.slug}`, locale),
  };

  // GEO/SEO: surface every FAQ block as FAQPage structured data so search and
  // AI answer engines can cite the Q&A directly.
  const faqs = (post.sections ?? [])
    .flatMap((s) => s.cols)
    .flatMap((c) => c.blocks)
    .filter((b) => b.type === "faq")
    .flatMap((b) => b.faqs ?? []);
  const faqLd = faqs.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }
    : null;

  const crumb = breadcrumbLd([
    { name: locale === "ar" ? "الرئيسية" : "Home", url: localeUrl("/", locale) },
    { name: locale === "ar" ? "المدونة" : "Blog", url: localeUrl("/blog", locale) },
    { name: post.title, url: localeUrl(`/blog/${post.slug}`, locale) },
  ]);

  // Curated (editor-picked) course links. One list fetch, then filtered — the
  // list call is already public + ISR'd, so this costs no extra round-trip per slug.
  const picked = post.relatedCourseSlugs ?? [];
  const coursesRes = picked.length ? await dal.courses.fetchCourses({ status: "published" }) : null;
  const related = picked
    .map((slug) => coursesRes?.ok ? coursesRes.data.find((c) => c.slug === slug) : undefined)
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <JsonLd data={[articleLd, ...(faqLd ? [faqLd] : []), crumb]} />
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground">{locale === "ar" ? "الرئيسية" : "Home"}</Link>
        <ChevronRight className="size-3.5 rtl:rotate-180" />
        <Link href="/blog" className="hover:text-foreground">{locale === "ar" ? "المدونة" : "Blog"}</Link>
        <ChevronRight className="size-3.5 rtl:rotate-180" />
        <span className="line-clamp-1 text-foreground">{post.title}</span>
      </nav>

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
        <div className="relative mt-6 aspect-[16/9] w-full overflow-hidden rounded-2xl bg-muted">
          <Image
            src={post.coverImageUrl}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            priority
            className="object-cover"
          />
        </div>
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

      {/* Related courses — the course title IS the anchor text, which is the
          only reason an internal link like this carries any weight. */}
      {related.length > 0 && (
        <section className="mt-10 border-t border-border/60 pt-8">
          <h2 className="font-heading text-xl font-semibold">
            {locale === "ar" ? "برامج ذات صلة" : "Related courses"}
          </h2>
          <ul className="mt-4 space-y-2.5">
            {related.map((c) => {
              const title = locale === "ar" ? c.titleAr || c.titleEn : c.titleEn;
              return (
                <li key={c.slug}>
                  <Link
                    href={`/courses/${c.slug}`}
                    className="group flex items-start gap-3 rounded-xl border border-border/70 bg-card p-4 transition-colors hover:border-primary/40 hover:bg-muted/40"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold leading-snug text-foreground group-hover:text-primary">
                        {title}
                      </span>
                      {c.category && (
                        <span className="mt-0.5 block text-xs text-muted-foreground">{c.category}</span>
                      )}
                    </span>
                    <ArrowRight className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary rtl:rotate-180" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </article>
  );
}
