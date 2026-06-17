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
  const [res, profileRes] = await Promise.all([
    dal.student.fetchCertificates(),
    dal.student.fetchProfile(),
  ]);
  const holderName = profileRes.ok ? profileRes.data.name : undefined;

  return (
    <div className="mx-auto max-w-[1100px] space-y-6">
      <PageHeader title={t("certificatesTitle")} description={t("certificatesSubtitle")} />
      <CertificatesGrid certificates={res.ok ? res.data : []} holderName={holderName} />
    </div>
  );
}
