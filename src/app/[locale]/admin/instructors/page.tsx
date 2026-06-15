import { getTranslations, setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { PageHeader } from "@/components/shared/page-header";
import { InstructorsModule } from "@/features/admin/components/instructors-module";

export default async function AdminInstructorsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Admin");
  const res = await dal.admin.fetchInstructors();
  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader title={t("instructorsTitle")} description={t("instructorsSubtitle")} />
      <InstructorsModule initialData={res.ok ? res.data : []} />
    </div>
  );
}
