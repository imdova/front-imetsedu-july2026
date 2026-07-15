import { setRequestLocale } from "next-intl/server";

import { PageHeader } from "@/components/shared/page-header";
import { requirePermission } from "@/lib/permission-guard";
import { CertificatesManager } from "@/features/crm/components/certificates-manager";

export const metadata = { robots: { index: false } };

export default async function CrmCertificatesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requirePermission("lms.certificates.view");

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <PageHeader
        title="Certificates"
        description="Upload certificates for a group's enrolled students, and track certificate shipments through to delivery."
      />
      <CertificatesManager />
    </div>
  );
}
