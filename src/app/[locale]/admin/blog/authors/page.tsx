import { setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { PageHeader } from "@/components/shared/page-header";
import { AuthorsManager } from "@/features/blog-admin/components/authors-manager";

export const metadata = { robots: { index: false } };

export default async function AdminBlogAuthorsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const res = await dal.blog.fetchAuthors();

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader title="Authors" description="Blog authors." />
      <AuthorsManager initial={res.ok ? res.data : []} />
    </div>
  );
}
