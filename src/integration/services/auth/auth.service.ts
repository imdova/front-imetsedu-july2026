import { api, type Result } from "@integration/services/http/client";

/** Coarse system role as returned by the backend User model — matches the
 * backend enum `['USER','ADMIN']`. The three app users are derived from these:
 * admin + no staffRole = super-admin, admin + staffRole = staff member (both
 * under /admin), user = student. */
export type BackendRole = "admin" | "user";

export type StaffRolePermissions = Record<string, boolean>;

export interface StaffRole {
  _id: string;
  title: string;
  permissions: StaffRolePermissions;
}

export interface AuthUserDto {
  id: string;
  /** Backend uses Mongo `_id`; normalized to `id` in getProfile(). */
  _id?: string;
  name: string;
  email: string;
  role: BackendRole;
  image?: string;
  avatarUrl?: string;
  /** Populated for non-super-admin staff — carries the fine-grained permissions object. */
  staffRole?: StaffRole | null;
}

/** Shape of POST /auth/login | /auth/register | /auth/refresh. */
export interface AuthResponse {
  message?: string;
  user: AuthUserDto;
  access_token: string;
  refresh_token: string;
}

export interface ForgotPasswordResult {
  message?: string;
}

export function login(email: string, password: string): Promise<Result<AuthResponse>> {
  return api.post<AuthResponse>("/auth/login", { email, password }, { requireAuth: false });
}

export function register(input: {
  name: string;
  email: string;
  password: string;
  role?: BackendRole;
}): Promise<Result<AuthResponse>> {
  return api.post<AuthResponse>("/auth/register", input, { requireAuth: false });
}

/**
 * GET /users/me — current authenticated user profile (requires a bearer token).
 * Returns the staffRole + fine-grained permissions used by the guards. Pass
 * `accessToken` explicitly when calling right after login (before the token is
 * in Zustand) — mirrors old codebase AuthDAL.getCurrentUser(token). The backend
 * returns Mongo `_id`; we normalize it to `id`.
 */
export async function getProfile(accessToken?: string): Promise<Result<AuthUserDto>> {
  const res = accessToken
    ? await api.get<AuthUserDto>("/users/me", {
        requireAuth: false,
        headers: { Authorization: `Bearer ${accessToken}` },
      })
    : await api.get<AuthUserDto>("/users/me");
  if (!res.ok) return res;
  const d = res.data;
  return { ...res, data: { ...d, id: d.id ?? d._id ?? "" } };
}

export function refresh(refreshToken: string): Promise<Result<AuthResponse>> {
  return api.post<AuthResponse>("/auth/refresh", { refresh_token: refreshToken }, { requireAuth: false });
}

export function changePassword(currentPassword: string, newPassword: string): Promise<Result<{ message?: string }>> {
  return api.post<{ message?: string }>("/auth/change-password", { currentPassword, newPassword });
}

export interface UpdateProfileInput {
  name?: string;
  image?: string;
}

/** PATCH /users/me — update the signed-in user's profile. */
export async function updateProfile(input: UpdateProfileInput): Promise<Result<AuthUserDto>> {
  const res = await api.patch<AuthUserDto>("/users/me", input);
  if (!res.ok) return res;
  const d = res.data;
  return { ...res, data: { ...d, id: d.id ?? d._id ?? "" } };
}

export function forgotPassword(email: string): Promise<Result<ForgotPasswordResult>> {
  return api.post<ForgotPasswordResult>("/auth/forgot-password", { email }, { requireAuth: false });
}

export function resetPassword(token: string, newPassword: string): Promise<Result<unknown>> {
  return api.post<unknown>("/auth/reset-password", { token, newPassword }, { requireAuth: false });
}
