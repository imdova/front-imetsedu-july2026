import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { GroupDetailFull } from "@/features/admin/components/group-detail-full";

export default async function AdminGroupDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const res = await dal.groups.fetchGroup(id);
  if (!res.ok || !res.data) notFound();

  return (
    <div className="mx-auto max-w-[1500px]">
      <GroupDetailFull group={res.data} />
    </div>
  );
}
