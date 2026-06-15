import { getTranslations, setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { PageHeader } from "@/components/shared/page-header";
import { CertificatesModule } from "@/features/admin/components/certificates-module";

export default async function AdminCertificatesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Admin");
  const res = await dal.admin.fetchCertificates();
  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader title={t("certificatesTitle")} description={t("certificatesSubtitle")} />
      <CertificatesModule initialData={res.ok ? res.data : []} />
    </div>
  );
}
