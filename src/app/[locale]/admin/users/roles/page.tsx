import { setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { RolesPermissions } from "@/features/admin/components/roles-permissions";

export default async function AdminUserRolesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [rolesRes, deptsRes, registryRes] = await Promise.all([
    dal.userManagement.fetchUmRoles(),
    dal.userManagement.fetchUmDepartments(),
    dal.userManagement.fetchUmRegistry(),
  ]);

  return (
    <div className="mx-auto max-w-[1500px]">
      <RolesPermissions
        roles={rolesRes.ok ? rolesRes.data : []}
        departments={deptsRes.ok ? deptsRes.data : []}
        registry={registryRes.ok ? registryRes.data : []}
      />
    </div>
  );
}
