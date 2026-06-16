import { ArrowLeft } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { InvoiceDetail } from "@/features/finance/components/invoice-detail";
import { getTheme } from "@/lib/db/site-settings";

export default async function AdminInvoiceDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Finance");

  const theme = await getTheme().catch(() => null);

  return (
    <div className="mx-auto max-w-350 space-y-5">
      <Button asChild variant="ghost" size="sm" className="gap-1.5 -ms-2 print:hidden">
        <Link href="/admin/crm/invoices">
          <ArrowLeft className="size-4 rtl:rotate-180" />
          {t("backToInvoices")}
        </Link>
      </Button>
      <InvoiceDetail id={id} logoLight={theme?.logoLight} logoDark={theme?.logoDark} />
    </div>
  );
}
