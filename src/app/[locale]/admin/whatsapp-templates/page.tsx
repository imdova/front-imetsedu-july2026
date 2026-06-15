import { Plus } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { WhatsappTemplates } from "@/features/admin/components/whatsapp-templates";

export default async function AdminWhatsappTemplatesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Admin");
  const res = await dal.admin.fetchWhatsappTemplates();
  return (
    <div className="mx-auto max-w-[1100px] space-y-6">
      <PageHeader title={t("whatsappTitle")} description={t("whatsappSubtitle")}>
        <Button className="gap-1.5">
          <Plus className="size-4" />
          {t("newTemplate")}
        </Button>
      </PageHeader>
      <WhatsappTemplates items={res.ok ? res.data : []} />
    </div>
  );
}
