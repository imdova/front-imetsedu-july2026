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

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 space-y-2">
        <h1 className="font-heading text-3xl font-bold tracking-tight">{t("blogTitle")}</h1>
        <p className="text-muted-foreground">{t("blogSubtitle")}</p>
      </div>
      <BlogExplorerLive posts={posts} categories={categories} />
    </div>
  );
}
