import { getTranslations, setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { PageHeader } from "@/components/shared/page-header";
import { EarningsView } from "@/features/instructor/components/earnings-view";

export default async function InstructorEarningsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Instructor");

  const res = await dal.instructor.fetchEarnings();
  const data = res.ok ? res.data : { summary: { available: 0, pending: 0, lifetime: 0, thisMonth: 0 }, payouts: [] };

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <PageHeader title={t("earningsTitle")} description={t("earningsSubtitle")} />
      <EarningsView summary={data.summary} payouts={data.payouts} />
    </div>
  );
}
