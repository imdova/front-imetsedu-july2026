import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import { Button } from "@/components/ui/button";
import { InvoiceDetail } from "@/features/finance/components/invoice-detail";

export default async function StudentInvoiceDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Student");

  const res = await dal.finance.fetchInvoice(id);
  if (!res.ok || !res.data) notFound();

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <Button asChild variant="ghost" size="sm" className="gap-1.5 -ms-2">
        <Link href="/student/billing">
          <ArrowLeft className="size-4 rtl:rotate-180" />
          {t("billingTitle")}
        </Link>
      </Button>
      <InvoiceDetail invoice={res.data} />
    </div>
  );
}
