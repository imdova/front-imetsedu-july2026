import { setRequestLocale } from "next-intl/server";

import { PageHeader } from "@/components/shared/page-header";
import { requireSuperAdmin } from "@/lib/permission-guard";
import { TemplateForm } from "@/features/crm/components/template-form";

export const metadata = { robots: { index: false } };

export default async function NewTemplatePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireSuperAdmin();

  return (
    <div className="mx-auto max-w-[840px] space-y-6">
      <PageHeader
        title="New message template"
        description="Create a ready-to-send message the sales team can copy in one click."
      />
      <TemplateForm />
    </div>
  );
}
