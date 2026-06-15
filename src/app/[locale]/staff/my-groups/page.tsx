import { getTranslations, setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { PageHeader } from "@/components/shared/page-header";
import { GroupsTable } from "@/features/admin/components/groups-table";

export default async function StaffMyGroupsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tn = await getTranslations("Nav");
  const res = await dal.admin.fetchGroups();

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader title={tn("myGroups")} />
      <GroupsTable initialData={res.ok ? res.data : []} />
    </div>
  );
}
