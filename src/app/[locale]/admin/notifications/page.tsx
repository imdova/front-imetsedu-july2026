import { setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { NotificationsInbox } from "@/features/admin/components/notifications-inbox";

export default async function AdminNotificationsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [notifRes, statsRes] = await Promise.all([
    dal.notificationsAdmin.fetchAdminNotifications(),
    dal.notificationsAdmin.fetchNotifStats(),
  ]);

  const stats = statsRes.ok ? statsRes.data : { total: 0, unread: 0, urgent: 0, archived: 0 };

  return (
    <div className="mx-auto max-w-[1400px]">
      <NotificationsInbox notifications={notifRes.ok ? notifRes.data : []} stats={stats} />
    </div>
  );
}
