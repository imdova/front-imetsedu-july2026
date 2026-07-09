import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { PageHeader } from "@/components/shared/page-header";
import { requireSuperAdmin } from "@/lib/permission-guard";
import { dal } from "@/lib/dal";
import { TemplateForm } from "@/features/crm/components/template-form";

export const metadata = { robots: { index: false } };

export default async function EditTemplatePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  await requireSuperAdmin();

  const res = await dal.messageTemplates.fetchTemplate(id);
  if (!res.ok) notFound();

  return (
    <div className="mx-auto max-w-[840px] space-y-6">
      <PageHeader
        title="Edit message template"
        description="Update this ready-to-send message. Changes apply for the whole team."
      />
      <TemplateForm initial={res.data} />
    </div>
  );
}
