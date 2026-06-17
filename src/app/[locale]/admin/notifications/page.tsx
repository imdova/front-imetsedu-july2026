import { setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { NotificationsInbox } from "@/features/admin/components/notifications-inbox";

export default async function AdminNotificationsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const res = await dal.notificationsAdmin.fetchAdminNotifications(1, 20);
  const initialPage = res.ok
    ? res.data
    : { items: [], unreadCount: 0, meta: { total: 0, page: 1, limit: 20, totalPages: 0 } };

  return (
    <div className="mx-auto max-w-[1400px]">
      <NotificationsInbox initialPage={initialPage} />
    </div>
  );
}
