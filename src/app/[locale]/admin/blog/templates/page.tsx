import { setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { PageHeader } from "@/components/shared/page-header";
import { TemplatesManager } from "@/features/blog-admin/components/templates-manager";

export const metadata = { robots: { index: false } };

export default async function AdminBlogTemplatesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const res = await dal.blog.fetchTemplates();

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader title="Templates" description="Saved article-builder templates." />
      <TemplatesManager initial={res.ok ? res.data : []} />
    </div>
  );
}
