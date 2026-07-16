import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { ArticleBuilder } from "@/features/blog-admin/components/article-builder";
import { blogBuilderCourses } from "@/features/blog-admin/lib/builder-courses";

export const metadata = { robots: { index: false } };

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const [articleRes, authorsRes, categoriesRes, courses] = await Promise.all([
    dal.blog.fetchArticle(id),
    dal.blog.fetchAuthors(),
    dal.blog.fetchCategories(),
    blogBuilderCourses(),
  ]);
  if (!articleRes.ok || !articleRes.data) notFound();
  const p = articleRes.data;

  return (
    <div className="mx-auto max-w-[1500px] py-2">
      <ArticleBuilder
        mode="edit"
        articleId={p.id}
        initial={{
          meta: {
            title: p.title, slug: p.slug, excerpt: p.excerpt, coverImageUrl: p.coverImageUrl ?? "",
            category: p.category ?? "", tags: p.tags, authorId: p.authorId ?? "", authorName: p.authorName ?? "", language: p.language ?? "en",
            status: p.status, featured: p.featured, seoTitle: p.seoTitle ?? "", seoDescription: p.seoDescription ?? "",
            publishedAt: p.publishedAt, relatedCourseSlugs: p.relatedCourseSlugs ?? [],
          },
          sections: p.sections ?? [],
        }}
        authors={authorsRes.ok ? authorsRes.data : []}
        categories={categoriesRes.ok ? categoriesRes.data : []}
        courses={courses}
      />
    </div>
  );
}
