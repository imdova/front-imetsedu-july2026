import { getTranslations, setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { PageHeader } from "@/components/shared/page-header";
import { InstallmentsView } from "@/features/student/components/installments-view";

export default async function StudentInstallmentsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Student");
  const res = await dal.student.fetchInstallments();
  return (
    <div className="mx-auto max-w-[800px] space-y-6">
      <PageHeader title={t("installmentsTitle")} description={t("installmentsSubtitle")} />
      <InstallmentsView items={res.ok ? res.data : []} />
    </div>
  );
}
