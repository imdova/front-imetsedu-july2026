import { ADMIN_NAV } from "@/constants/navigation";

/**
 * Where a staff member lands in the admin console: the first sidebar page
 * their role grants.
 *
 * Staff and admins share `/admin/dashboard` as their home route, but the
 * platform dashboard is admin-only — its data endpoints reject staff — so a
 * staff member sent there would see nothing but empty cards. Instead they go
 * to the first page in sidebar order that their permissions open: a role with
 * only Sales Orientation lands on Sales Orientation, a sales rep on Leads.
 * With nothing granted, their own profile.
 */
export function staffLandingPath(permissions: Record<string, boolean> | null | undefined): string {
  const perms = permissions ?? {};
  for (const section of ADMIN_NAV) {
    for (const item of section.items) {
      if (item.adminOnly || !item.requiredPermissions?.length) continue;
      if (item.requiredPermissions.some((key) => perms[key] === true)) return item.href;
    }
  }
  return "/admin/profile";
}
