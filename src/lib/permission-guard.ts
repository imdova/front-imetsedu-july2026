"use server";

import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { AuthUser } from "@/store/slices/auth-slice";

/** Read the current user from the session cookie (server-side). */
export async function getSessionUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get("imets_user")?.value;
    if (userCookie) {
      return JSON.parse(decodeURIComponent(userCookie)) as AuthUser;
    }
    const role = cookieStore.get("imets_role")?.value;
    const token = cookieStore.get("imets_token")?.value;
    if (!role || !token) return null;
    return { id: "", name: "", email: "", role: role as AuthUser["role"], access_token: token };
  } catch {
    return null;
  }
}

/**
 * Server-side permission check for page.tsx files.
 * Call at the top of any server page/layout that requires a specific permission.
 *
 * - Super-admins (staffRole === null) always pass.
 * - Staff without the required permission get a 404 (not-found page).
 *
 * Usage in page.tsx:
 *   await requirePermission("crm.leads.view");
 */
export async function requirePermission(permission: string): Promise<void> {
  const user = await getSessionUser();
  if (!user) return; // not authenticated — middleware handles redirect
  
  // Super-admin (no staffRole object) always passes
  if (user.staffRole === null) return;
  
  // If user has a staffRole object, check if they have the specific permission
  if (!user.staffRole?.permissions || user.staffRole.permissions[permission] !== true) {
    notFound();
  }
}

/**
 * Check multiple permissions — user must have ALL of them.
 */
export async function requirePermissions(permissions: string[]): Promise<void> {
  const user = await getSessionUser();
  if (!user) return;
  
  // Super-admin (no staffRole object) always passes
  if (user.staffRole === null) return;
  
  if (!user.staffRole?.permissions) notFound();
  
  const missing = permissions.some((p) => user.staffRole!.permissions[p] !== true);
  if (missing) notFound();
}

/**
 * Restrict a page to super-admins only (role === "admin" and staffRole === null).
 * Any staff member — regardless of permissions — gets a 404.
 */
export async function requireSuperAdmin(): Promise<void> {
  const user = await getSessionUser();
  if (!user) return; // unauthenticated — middleware handles redirect
  if (user.role !== "admin" || user.staffRole !== null) {
    notFound();
  }
}

/**
 * Restrict a page to admin or staff roles only (excludes students/instructors).
 */
export async function requireStaffOrAdmin(): Promise<void> {
  const user = await getSessionUser();
  if (!user) return;
  if (user.role !== "admin" && user.role !== "staff") notFound();
}
