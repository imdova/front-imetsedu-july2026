import { setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { RolesPermissions } from "@/features/admin/components/roles-permissions";
import { DataLoadError, failedSources } from "@/components/shared/data-load-error";

export default async function AdminUserRolesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [rolesRes, deptsRes, registryRes, usersRes] = await Promise.all([
    dal.userManagement.fetchUmRoles(),
    dal.userManagement.fetchUmDepartments(),
    dal.userManagement.fetchUmRegistry(),
    dal.userManagement.fetchUmUsers(),
  ]);

  // A failed fetch here used to render as an empty roles/departments list,
  // which reads as "you have none" rather than "the request failed".
  const failures = failedSources([
    ["Roles", rolesRes],
    ["Departments", deptsRes],
    ["Permission registry", registryRes],
    ["Staff directory", usersRes],
  ]);

  return (
    <div className="mx-auto max-w-[1500px] space-y-4">
      <DataLoadError sources={failures} />
      <RolesPermissions
        roles={rolesRes.ok ? rolesRes.data : []}
        departments={deptsRes.ok ? deptsRes.data : []}
        registry={registryRes.ok ? registryRes.data : []}
        users={usersRes.ok ? usersRes.data : []}
      />
    </div>
  );
}
