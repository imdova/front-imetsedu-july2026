import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { getSessionUser } from "@/lib/permission-guard";
import { GroupDetailFull } from "@/features/admin/components/group-detail-full";

export default async function AdminGroupDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const [res, user] = await Promise.all([
    dal.groups.fetchGroup(id),
    getSessionUser(),
  ]);
  if (!res.ok || !res.data) notFound();

  const isStaff = user?.staffRole !== null && user?.staffRole !== undefined;

  return (
    <div className="mx-auto max-w-[1500px]">
      <GroupDetailFull group={res.data} isStaff={isStaff} />
    </div>
  );
}
