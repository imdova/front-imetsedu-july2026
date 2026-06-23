import { setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { PageHeader } from "@/components/shared/page-header";
import { AdminBlogList } from "@/features/blog-admin/components/admin-blog-list";

export const metadata = { robots: { index: false } };

export default async function AdminBlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const res = await dal.blog.fetchArticles({ limit: 100 });

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        title="Articles"
        description="Manage blog articles — scores, lifecycle and the block-based builder."
      />
      <AdminBlogList initial={res.ok ? res.data.data : []} />
    </div>
  );
}
