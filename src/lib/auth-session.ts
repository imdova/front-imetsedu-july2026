/**
 * Auth session helpers — bridge the backend auth response to this app's
 * client auth state (Zustand) and a lightweight cookie the middleware/server
 * can read. Client-only (touches document.cookie).
 */
import type { AuthResponse, BackendRole } from "@integration/services/auth";
import type { AuthUser } from "@/store/slices/auth-slice";

export type AppRole = AuthUser["role"]; // "admin" | "instructor" | "staff" | "student"

/** Backend coarse role → this app's routing role. */
export function mapRole(role: BackendRole): AppRole {
  if (role === "admin") return "admin";
  if (role === "instructor") return "instructor";
  return "student"; // backend "user"
}

/** Landing route per role after sign-in. */
export function homeForRole(role: AppRole): string {
  switch (role) {
    case "admin": return "/admin/dashboard";
    case "instructor": return "/instructor/dashboard";
    case "staff": return "/staff/crm";
    default: return "/student/dashboard";
  }
}

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days (matches backend JWT_EXPIRES_IN)

/** Build the Zustand AuthUser from a backend auth response. */
export function toAuthUser(res: AuthResponse): AuthUser {
  return {
    id: res.user.id,
    name: res.user.name,
    email: res.user.email,
    role: mapRole(res.user.role),
    avatarUrl: res.user.avatarUrl ?? res.user.image,
    access_token: res.access_token,
  };
}

/** Persist a readable session cookie so the middleware can gate routes. */
export function persistSessionCookie(user: AuthUser): void {
  if (typeof document === "undefined") return;
  const opts = `path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
  document.cookie = `imets_role=${user.role}; ${opts}`;
  if (user.access_token) document.cookie = `imets_token=${user.access_token}; ${opts}`;
}

export function clearSessionCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = "imets_role=; path=/; max-age=0";
  document.cookie = "imets_token=; path=/; max-age=0";
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
