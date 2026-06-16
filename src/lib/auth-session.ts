/**
 * Auth session helpers — bridge the backend auth response to this app's
 * client auth state (Zustand) and a lightweight cookie the middleware/server
 * can read. Client-only (touches document.cookie).
 */
import type { AuthResponse, AuthUserDto, BackendRole } from "@integration/services/auth";
import type { AuthUser, StaffRole } from "@/store/slices/auth-slice";

export type AppRole = AuthUser["role"]; // "admin" | "instructor" | "staff" | "student"

/**
 * Map a backend coarse role to this app's routing role.
 *
 * Mirrors old codebase constants/auth.ts redirectMap exactly:
 *   - role="admin" (both super-admin AND staff members) → "admin" → /admin/dashboard
 *   - role="instructor"                                 → "instructor"
 *   - role="user"                                       → "student" (or "staff" if has staffRole)
 *
 * The distinction between super-admin and staff is made by staffRole presence:
 *   - staffRole === null  → super-admin → all permissions granted
 *   - staffRole is object → staff member → filtered permissions
 * This check happens in sidebar-nav (hasAccess) and components (!user?.staffRole).
 */
export function mapRole(role: BackendRole, staffRole?: StaffRole | null): AppRole {
  if (role === "admin") return "admin"; // both super-admin and staff
  if (role === "instructor") return "instructor";
  // backend role === "user": student (or legacy staff schema)
  if (staffRole !== undefined && staffRole !== null) return "staff";
  return "student";
}

/** Landing route per role after sign-in — mirrors old codebase redirectMap exactly. */
export function homeForRole(role: AppRole): string {
  switch (role) {
    case "admin": return "/admin/dashboard";   // both super-admin and staff
    case "instructor": return "/instructor/dashboard";
    case "staff": return "/admin/dashboard";   // legacy path (shouldn't occur with current backend)
    default: return "/student/dashboard";
  }
}

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days (matches backend JWT_EXPIRES_IN)

/**
 * Build the Zustand AuthUser from a backend auth response.
 * Pass the profile DTO (from GET /users/me) as the second argument
 * to attach the staffRole after login — mirrors the old codebase exactly.
 */
export function toAuthUser(res: AuthResponse, profile?: AuthUserDto | null): AuthUser {
  const staffRole = profile?.staffRole ?? res.user.staffRole;
  const role = mapRole(res.user.role, staffRole);
  // staffId: the user's own backend id for auto-assigning leads
  // Set for any user who has a staffRole object (= is a staff member, not super-admin)
  const isStaff = staffRole !== undefined && staffRole !== null;
  return {
    id: res.user.id,
    name: res.user.name,
    email: res.user.email,
    role,
    avatarUrl: res.user.avatarUrl ?? res.user.image,
    access_token: res.access_token,
    // staffRole === null  → super-admin (hasAccess returns true for everything)
    // staffRole is object → staff member (hasAccess filters by permissions)
    staffRole: staffRole ?? null,
    staffId: isStaff ? res.user.id : undefined,
  };
}

/** Persist a readable session cookie so the middleware can gate routes. */
export function persistSessionCookie(user: AuthUser): void {
  if (typeof document === "undefined") return;
  const opts = `path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
  document.cookie = `imets_role=${user.role}; ${opts}`;
  if (user.access_token) document.cookie = `imets_token=${user.access_token}; ${opts}`;
  document.cookie = `imets_user=${encodeURIComponent(JSON.stringify(user))}; ${opts}`;
}

export function clearSessionCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = "imets_role=; path=/; max-age=0";
  document.cookie = "imets_token=; path=/; max-age=0";
  document.cookie = "imets_user=; path=/; max-age=0";
}

/** Store the refresh token (separate from the cookie) for token renewal. */
export function persistRefreshToken(token: string): void {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem("imets_refresh", token); } catch { /* ignore */ }
}
export function readRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  try { return window.localStorage.getItem("imets_refresh"); } catch { return null; }
}
