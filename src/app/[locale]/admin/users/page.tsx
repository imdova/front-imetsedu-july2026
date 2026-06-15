import { setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { UsersWorkspace } from "@/features/admin/components/users-workspace";

export default async function AdminUsersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [usersRes, statsRes, invitesRes] = await Promise.all([
    dal.userManagement.fetchUmUsers(),
    dal.userManagement.fetchUmStats(),
    dal.userManagement.fetchUmInvitations(),
  ]);

  const stats = statsRes.ok ? statsRes.data : { total: 0, accepted: 0, activeStaff: 0, pendingInvites: 0 };

  return (
    <div className="mx-auto max-w-[1500px]">
      <UsersWorkspace
        users={usersRes.ok ? usersRes.data : []}
        stats={stats}
        invitations={invitesRes.ok ? invitesRes.data : []}
      />
    </div>
  );
}
