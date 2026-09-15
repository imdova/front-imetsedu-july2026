import { setRequestLocale } from "next-intl/server";

import { redirect } from "@/i18n/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { requirePermission } from "@/lib/permission-guard";
import { OfficePanel } from "@/features/crm/components/office-panel";

export const metadata = { robots: { index: false } };

export default async function OfficePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Sales Orientation used to be a tab here; it has its own section now.
  const { tab } = await searchParams;
  if (tab === "orientation") redirect({ href: "/admin/orientation", locale });

  await requirePermission("crm.office.view");

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <PageHeader
        title="Office"
        description="Templates, sheets and documents your team uses day to day."
      />
      <OfficePanel initialTab={tab} />
    </div>
  );
}
