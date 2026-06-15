import { getTranslations, setRequestLocale } from "next-intl/server";

import { PageHeader } from "@/components/shared/page-header";
import { VerificationView } from "@/features/student/components/verification-view";

export default async function StudentVerificationPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Student");
  return (
    <div className="mx-auto max-w-[800px] space-y-6">
      <PageHeader title={t("verificationTitle")} description={t("verificationSubtitle")} />
      <VerificationView />
    </div>
  );
}
