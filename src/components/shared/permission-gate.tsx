"use client";

import { usePermission, usePermissions } from "@/hooks/use-permission";

interface PermissionGateProps {
  /** Hide children unless the user has this single permission */
  permission?: string;
  /** Hide children unless the user has ALL of these permissions */
  permissions?: string[];
  children: React.ReactNode;
  /** Optional fallback rendered when access is denied (default: nothing) */
  fallback?: React.ReactNode;
}

/**
 * Conditionally renders children based on the current user's permissions.
 *
 * Examples:
 *   <PermissionGate permission="crm.leads.export">
 *     <ExportButton />
 *   </PermissionGate>
 *
 *   <PermissionGate permissions={["crm.leads.create", "crm.leads.edit"]}>
 *     <EditForm />
 *   </PermissionGate>
 */
export function PermissionGate({
  permission,
  permissions,
  children,
  fallback = null,
}: PermissionGateProps) {
  const singleOk = usePermission(permission ?? "");
  const multiOk = usePermissions(permissions ?? []);

  // If neither prop provided, always render
  if (!permission && !permissions?.length) return <>{children}</>;

  const allowed = (permission ? singleOk : true) && (permissions?.length ? multiOk : true);
  return allowed ? <>{children}</> : <>{fallback}</>;
}
