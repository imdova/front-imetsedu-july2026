import { Plus, Download, CreditCard } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { InvoicesModule } from "@/features/finance/components/invoices-module";

export default async function AdminInvoicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Finance");

  const [statsRes, invoicesRes] = await Promise.all([
    dal.finance.fetchFinanceStats(),
    dal.finance.fetchInvoices(),
  ]);

  const stats = statsRes.ok ? statsRes.data : { collected: 0, outstanding: 0, overdue: 0, refunded: 0 };

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader title={t("invoicesTitle")} description={t("invoicesSubtitle")}>
        <Button variant="outline" className="gap-1.5"><Download className="size-4" />{t("exportCsv")}</Button>
        <Button variant="outline" className="gap-1.5"><CreditCard className="size-4" />{t("paidInvoiceBtn")}</Button>
        <Button className="gap-1.5"><Plus className="size-4" />{t("newInvoice")}</Button>
      </PageHeader>
      <InvoicesModule
        invoices={invoicesRes.ok ? invoicesRes.data : []}
        stats={stats}
        basePath="/admin/crm"
      />
    </div>
  );
}
