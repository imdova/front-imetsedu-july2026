import { setRequestLocale } from "next-intl/server";

import { PageHeader } from "@/components/shared/page-header";
import { requirePermission } from "@/lib/permission-guard";
import { PaymentLinksManager } from "@/features/crm/components/payment-links-manager";

export const metadata = { robots: { index: false } };

export default async function PaymentLinksPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requirePermission("crm.payment_links.view");

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <PageHeader
        title="Payment Links"
        description="Generate a PayPal payment link for a course and payment type — set the amount, discount and taxes, then share the link to collect payment in USD."
      />
      <PaymentLinksManager />
    </div>
  );
}
