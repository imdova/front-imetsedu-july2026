"use client";

import { useStore } from "@/store";

/**
 * Returns true if the current user has the given permission.
 * Super-admins (staffRole === null) always return true.
 *
 * Usage:
 *   const canExport = usePermission("crm.leads.export");
 *   const canCreate = usePermission("crm.leads.create");
 */
export function usePermission(permission: string): boolean {
  const permissions = useStore((s) => s.user?.staffRole?.permissions);
  // Store not yet hydrated — optimistically allow (server-side guards are the real gate)
  if (permissions === undefined) return true;
  // No staffRole → super-admin → allow everything
  if (permissions === null) return true;
  return permissions[permission] === true;
}

/**
 * Returns true if the current user has ALL of the given permissions.
 */
export function usePermissions(keys: string[]): boolean {
  const permissions = useStore((s) => s.user?.staffRole?.permissions);
  if (permissions === undefined || permissions === null) return true;
  return keys.every((k) => permissions[k] === true);
}
