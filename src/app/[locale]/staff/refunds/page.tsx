import { getTranslations, setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { PageHeader } from "@/components/shared/page-header";
import { ExportButton } from "@/features/finance/components/export-button";
import { RefundsTable } from "@/features/finance/components/refunds-table";

export default async function StaffRefundsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Finance");

  const res = await dal.finance.fetchRefunds();

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader title={t("refundsTitle")} description={t("refundsSubtitle")}>
        <ExportButton />
      </PageHeader>
      <RefundsTable initialData={res.ok ? res.data : []} />
    </div>
  );
}
