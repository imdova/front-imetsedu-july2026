import { setRequestLocale } from "next-intl/server";

import { requirePermission } from "@/lib/permission-guard";
import { CommissionManager } from "@/features/crm/components/commission-manager";

export const metadata = { robots: { index: false } };

export default async function CommissionPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requirePermission("crm.dashboard.view");

  return (
    <div className="mx-auto max-w-[1400px]">
      <CommissionManager />
    </div>
  );
}
