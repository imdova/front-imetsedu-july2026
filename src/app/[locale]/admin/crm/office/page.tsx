import { setRequestLocale } from "next-intl/server";

import { PageHeader } from "@/components/shared/page-header";
import { requirePermission } from "@/lib/permission-guard";
import { OfficePanel } from "@/features/crm/components/office-panel";

export const metadata = { robots: { index: false } };

export default async function OfficePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requirePermission("crm.office.view");

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <PageHeader
        title="Office"
        description="Templates, sheets and documents your team uses day to day."
      />
      <OfficePanel />
    </div>
  );
}
