import { setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { computeUmStats } from "@/lib/admin/map-user-mgmt";
import { UsersWorkspace } from "@/features/admin/components/users-workspace";

export default async function AdminUsersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [usersRes, invitesRes] = await Promise.all([
    dal.userManagement.fetchUmUsers(),
    dal.userManagement.fetchUmInvitations(),
  ]);

  const rawUsers = usersRes.ok ? usersRes.data : [];
  const invitations = invitesRes.ok ? invitesRes.data : [];

  const pendingInvitations = invitations.filter((i) => i.status === "pending");

  // Mark existing staff as pending if they have a pending invitation
  const pendingEmails = new Set(pendingInvitations.map((i) => i.email.toLowerCase()));
  const users = rawUsers.map((u) =>
    pendingEmails.has(u.email.toLowerCase()) ? { ...u, status: "pending" as const } : u,
  );

  // Add pending invitees who are not yet in the staff list
  const staffEmails = new Set(rawUsers.map((u) => u.email.toLowerCase()));
  const inviteRows = pendingInvitations
    .filter((i) => !staffEmails.has(i.email.toLowerCase()))
    .map((i) => ({
      id: i.id,
      name: i.name,
      email: i.email,
      title: "—",
      role: i.role,
      department: i.department,
      status: "pending" as const,
      expiresAt: i.expiresAt,
      acceptedAt: null,
      initials: i.initials,
      invitationId: i.id,
      phone: "",
    }));

  const allUsers = [...users, ...inviteRows];
  const stats = computeUmStats(allUsers);

  return (
    <div className="mx-auto max-w-375">
      <UsersWorkspace users={allUsers} stats={stats} />
    </div>
  );
}
