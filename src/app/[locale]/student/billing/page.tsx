import { getTranslations, setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { PageHeader } from "@/components/shared/page-header";
import { FinanceKpis } from "@/features/finance/components/finance-kpis";
import { InvoicesTable } from "@/features/finance/components/invoices-table";

export default async function StudentBillingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Student");

  const [statsRes, invoicesRes] = await Promise.all([
    dal.finance.fetchFinanceStats(),
    dal.finance.fetchInvoices(),
  ]);

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader title={t("billingTitle")} description={t("billingSubtitle")} />
      {statsRes.ok && <FinanceKpis stats={statsRes.data} />}
      <InvoicesTable
        initialData={invoicesRes.ok ? invoicesRes.data.slice(0, 5) : []}
        basePath="/student"
      />
    </div>
  );
}
