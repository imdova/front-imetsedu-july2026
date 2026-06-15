import { getTranslations, setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { PageHeader } from "@/components/shared/page-header";
import { ExportButton } from "@/features/finance/components/export-button";
import { PaymentsTable } from "@/features/finance/components/payments-table";

export default async function StaffPaymentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Finance");

  const res = await dal.finance.fetchPayments();

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader title={t("paymentsTitle")} description={t("paymentsSubtitle")}>
        <ExportButton />
      </PageHeader>
      <PaymentsTable initialData={res.ok ? res.data : []} />
    </div>
  );
}
