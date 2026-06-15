import { setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { InviteUserForm } from "@/features/admin/components/invite-user-form";

export default async function AdminInviteUserPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [rolesRes, deptsRes] = await Promise.all([
    dal.userManagement.fetchUmRoles(),
    dal.userManagement.fetchUmDepartments(),
  ]);

  return (
    <div className="mx-auto max-w-[1100px]">
      <InviteUserForm
        roles={rolesRes.ok ? rolesRes.data.map((r) => ({ id: r.id, name: r.name })) : []}
        departments={deptsRes.ok ? deptsRes.data.map((d) => ({ id: d.id, name: d.name })) : []}
      />
    </div>
  );
}
