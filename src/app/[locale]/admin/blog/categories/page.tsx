import { setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { PageHeader } from "@/components/shared/page-header";
import { BlogTaxonomyManager } from "@/features/blog-admin/components/blog-taxonomy-manager";

export const metadata = { robots: { index: false } };

export default async function AdminBlogCategoriesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [catsRes, subsRes] = await Promise.all([
    dal.blog.fetchCategories(),
    dal.blog.fetchSubcategories(),
  ]);

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader title="Categories" description="Blog categories and subcategories." />
      <BlogTaxonomyManager
        initialCategories={catsRes.ok ? catsRes.data : []}
        initialSubcategories={subsRes.ok ? subsRes.data : []}
      />
    </div>
  );
}
