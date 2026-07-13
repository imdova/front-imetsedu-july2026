import { Receipt, Download } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { PaymentTracking } from "@/features/admin/components/payment-tracking";

export default async function AdminPaymentTrackingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Admin");

  // Visibility is scoped server-side by the /crm/payments endpoint based on the
  // caller's permissions (own customers, or all with finance.payment_tracking.view_all).
  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader title={t("paymentTrackingTitle")}>
        <Button variant="outline" className="gap-1.5"><Receipt className="size-4" />{t("transactionsLedger")}</Button>
        <Button variant="outline" className="gap-1.5"><Download className="size-4" />{t("exportBtn")}</Button>
      </PageHeader>
      <PaymentTracking />
    </div>
  );
}
