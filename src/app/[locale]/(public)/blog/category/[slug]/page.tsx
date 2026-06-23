import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { staticPageMeta } from "@/lib/seo";
import { ArticleCard } from "@/features/blog/components/article-card";

const COLOR_WASH: Record<string, string> = {
  primary: "from-primary/15", info: "from-info/15", success: "from-success/15",
  warning: "from-warning/15", destructive: "from-destructive/15", neutral: "from-muted",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const res = await dal.blog.fetchCategoryLanding(slug);
  if (!res.ok) return {};
  const c = res.data.category;
  return staticPageMeta({
    title: c.seoTitle || `${c.name} articles`,
    description: c.seoDescription || c.description || `Articles in ${c.name}.`,
    path: `/blog/category/${slug}`,
    locale,
  });
}

export default async function BlogCategoryPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const res = await dal.blog.fetchCategoryLanding(slug);
  if (!res.ok) notFound();
  const { category, data } = res.data;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className={`mb-8 rounded-3xl bg-gradient-to-br to-transparent p-8 ${COLOR_WASH[category.color] ?? COLOR_WASH.primary}`}>
        <h1 className="font-heading text-3xl font-bold tracking-tight">{category.name}</h1>
        {category.description && <p className="mt-2 max-w-2xl text-muted-foreground">{category.description}</p>}
      </div>

      {data.length === 0 ? (
        <div className="grid h-48 place-items-center rounded-2xl border border-dashed border-border/60 text-sm text-muted-foreground">
          No articles in this category yet.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((p) => <ArticleCard key={p.id} post={p} featured={p.featured} />)}
        </div>
      )}
    </div>
  );
}
