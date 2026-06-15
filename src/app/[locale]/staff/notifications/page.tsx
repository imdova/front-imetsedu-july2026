import { getTranslations, setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { PageHeader } from "@/components/shared/page-header";
import { NotificationsList } from "@/features/student/components/notifications-list";

export default async function StaffNotificationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tn = await getTranslations("Nav");
  const res = await dal.student.fetchNotifications();

  return (
    <div className="mx-auto max-w-[900px] space-y-6">
      <PageHeader title={tn("notifications")} />
      <NotificationsList items={res.ok ? res.data : []} />
    </div>
  );
}
