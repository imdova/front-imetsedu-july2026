import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import { Button } from "@/components/ui/button";
import { InvoiceDetail } from "@/features/finance/components/invoice-detail";

export default async function AdminInvoiceDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Finance");

  const res = await dal.finance.fetchInvoice(id);
  if (!res.ok || !res.data) notFound();

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <Button asChild variant="ghost" size="sm" className="gap-1.5 -ms-2">
        <Link href="/admin/crm/invoices">
          <ArrowLeft className="size-4 rtl:rotate-180" />
          {t("backToInvoices")}
        </Link>
      </Button>
      <InvoiceDetail invoice={res.data} />
    </div>
  );
}
