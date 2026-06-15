import { getTranslations, setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { PageHeader } from "@/components/shared/page-header";
import { TransactionsModule } from "@/features/admin/components/transactions-module";

export default async function AdminTransactionsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Admin");

  const [txnRes, payoutRes] = await Promise.all([
    dal.admin.fetchTransactions(),
    dal.admin.fetchPayouts(),
  ]);

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader title={t("transactionsTitle")} description={t("transactionsSubtitle")} />
      <TransactionsModule
        transactions={txnRes.ok ? txnRes.data : []}
        payouts={payoutRes.ok ? payoutRes.data : []}
      />
    </div>
  );
}
