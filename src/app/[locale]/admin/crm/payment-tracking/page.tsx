import { Receipt, Download } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { PaymentTracking } from "@/features/admin/components/payment-tracking";
import { getSessionUser } from "@/lib/permission-guard";

export default async function AdminPaymentTrackingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Admin");

  const user = await getSessionUser();
  const isStaff = user?.staffRole !== null && user?.staffRole !== undefined;
  const counselorId = isStaff ? (user?.staffId ?? user?.id) : undefined;

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader title={t("paymentTrackingTitle")}>
        <Button variant="outline" className="gap-1.5"><Receipt className="size-4" />{t("transactionsLedger")}</Button>
        <Button variant="outline" className="gap-1.5"><Download className="size-4" />{t("exportBtn")}</Button>
      </PageHeader>
      <PaymentTracking counselorId={counselorId} />
    </div>
  );
}
