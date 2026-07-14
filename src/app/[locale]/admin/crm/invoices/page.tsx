import { Download } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { getSessionUser } from "@/lib/permission-guard";
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

  const user = await getSessionUser();
  const isStaff = user?.staffRole !== null && user?.staffRole !== undefined;
  const counselorId = isStaff ? (user?.staffId ?? user?.id) : undefined;

  const [statsRes, invoicesRes] = await Promise.all([
    dal.finance.fetchFinanceStats(),
    dal.finance.fetchInvoices(),
  ]);

  let invoices = invoicesRes.ok ? invoicesRes.data : [];

  if (isStaff && counselorId) {
    const leadsRes = await dal.crm.fetchLeads({ counselorId });
    const leadIds = new Set((leadsRes.ok ? leadsRes.data : []).map((l) => l.id));
    invoices = invoices.filter((inv) => leadIds.has(inv.studentId ?? ""));
  }

  const stats = statsRes.ok ? statsRes.data : { collected: 0, outstanding: 0, overdue: 0, refunded: 0 };

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader title={t("invoicesTitle")} description={t("invoicesSubtitle")}>
        <Button variant="outline" className="gap-1.5"><Download className="size-4" />{t("exportCsv")}</Button>
      </PageHeader>
      <InvoicesModule
        invoices={invoices}
        stats={stats}
        basePath="/admin/crm"
        counselorId={counselorId}
      />
    </div>
  );
}
