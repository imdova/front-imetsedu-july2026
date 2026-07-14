import { setRequestLocale } from "next-intl/server";

import { PageHeader } from "@/components/shared/page-header";
import { requirePermission } from "@/lib/permission-guard";
import { RulesRegulationsManager } from "@/features/crm/components/rules-regulations-manager";

export const metadata = { robots: { index: false } };

export default async function RulesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requirePermission("crm.dashboard.view");

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <PageHeader
        title="Rules and Regulations"
        description="Work instructions and policies for staff and the students enrollment process."
      />
      <RulesRegulationsManager />
    </div>
  );
}
