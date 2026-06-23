import { setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { ArticleBuilder, type BuilderMeta } from "@/features/blog-admin/components/article-builder";
import type { ArticleSection } from "@/types/blog";

export const metadata = { robots: { index: false } };

export default async function NewArticlePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ templateId?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { templateId } = await searchParams;

  const [authorsRes, categoriesRes, templateRes] = await Promise.all([
    dal.blog.fetchAuthors(),
    dal.blog.fetchCategories(),
    templateId ? dal.blog.fetchTemplate(templateId) : Promise.resolve(null),
  ]);

  const doc = templateRes && templateRes.ok ? (templateRes.data.doc as { meta?: Partial<BuilderMeta>; sections?: ArticleSection[] }) : null;
  const initial = { meta: doc?.meta ?? {}, sections: doc?.sections ?? [] };

  return (
    <div className="mx-auto max-w-[1500px] py-2">
      <ArticleBuilder
        mode="new"
        initial={initial}
        authors={authorsRes.ok ? authorsRes.data : []}
        categories={categoriesRes.ok ? categoriesRes.data : []}
      />
    </div>
  );
}
