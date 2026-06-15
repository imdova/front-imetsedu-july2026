import { getTranslations, setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { PageHeader } from "@/components/shared/page-header";
import { PaymentMethodsList } from "@/features/student/components/payment-methods-list";

export default async function StudentPaymentMethodsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Student");
  const res = await dal.student.fetchPaymentMethods();
  return (
    <div className="mx-auto max-w-[800px] space-y-6">
      <PageHeader title={t("paymentMethodsTitle")} description={t("paymentMethodsSubtitle")} />
      <PaymentMethodsList items={res.ok ? res.data : []} />
    </div>
  );
}
