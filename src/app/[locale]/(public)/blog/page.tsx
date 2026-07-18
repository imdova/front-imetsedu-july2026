import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { staticPageMeta } from "@/lib/seo";
import { BlogExplorerLive } from "@/features/blog/components/blog-explorer-live";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Marketing" });
  return staticPageMeta({ title: t("blogTitle"), description: t("blogSubtitle"), path: "/blog", locale });
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Marketing");

  const [postsRes, catsRes] = await Promise.all([
    dal.blog.fetchPublicArticles({ limit: 60 }),
    dal.blog.fetchPublicCategoryNames(),
  ]);
  const posts = postsRes.ok ? postsRes.data.data : [];
  const categories = catsRes.ok ? catsRes.data : [];

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
        </div>
      </div>

      <BlogExplorerLive posts={posts} categories={categories} />
    </div>
  );
}
