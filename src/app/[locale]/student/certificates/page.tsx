import { getTranslations, setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { PageHeader } from "@/components/shared/page-header";
import { CertificatesGrid } from "@/features/student/components/certificates-grid";

export default async function StudentCertificatesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Student");
  const res = await dal.student.fetchCertificates();

  return (
    <div className="mx-auto max-w-[1100px] space-y-6">
      <PageHeader title={t("certificatesTitle")} description={t("certificatesSubtitle")} />
      <CertificatesGrid certificates={res.ok ? res.data : []} />
    </div>
  );
}
