import { ArrowLeft } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { CertificateBulk } from "@/features/admin/components/certificate-bulk";

export default async function AdminCertificateBulkPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Admin");
  const res = await dal.admin.fetchStudents();

  return (
    <div className="mx-auto max-w-[1000px] space-y-6">
      <Button asChild variant="ghost" size="sm" className="gap-1.5 -ms-2">
        <Link href="/admin/certificates">
          <ArrowLeft className="size-4 rtl:rotate-180" />
          {t("certificatesTitle")}
        </Link>
      </Button>
      <PageHeader title={t("certBulkTitle")} description={t("certBulkSubtitle")} />
      <CertificateBulk roster={res.ok ? res.data : []} />
    </div>
  );
}
