import type { StateCreator } from "zustand";
import type { StoreState } from "../types";

export type StaffRolePermissions = Record<string, boolean>;

export interface StaffRole {
  _id: string;
  title: string;
  permissions: StaffRolePermissions;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "instructor" | "staff" | "student";
  avatarUrl?: string;
  access_token?: string;
  /**
   * For staff users: the counselor/staff ID used to filter their own leads.
   * Matches the `counselorId` field on Lead records.
   */
  staffId?: string;
  /**
   * Present for staff users whose backend `role === "user"`.
   * - `null`  → super-admin (no staffRole) → all permissions granted
   * - object  → fine-grained permissions map
   * - absent / undefined → store not yet hydrated → optimistically allow
   */
  staffRole?: StaffRole | null;
}

/**
 * Auth slice — the single source of truth for the current user + bearer token.
 * The integration HTTP client reads the token from here via `configureApiClient`
 * (see lib/api-client.config.ts), so switching the DAL to the real backend
 * needs no auth plumbing changes.
 */
export interface AuthSlice {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  logout: () => void;
}

// A seeded admin so the console renders a signed-in shell out of the box.
const DEMO_ADMIN: AuthUser = {
  id: "usr_admin",
  name: "Ahmed Habib",
  email: "ahmed.habib@imetsedu.com",
  role: "admin",
  staffRole: null, // null = super-admin = all permissions
};

export const createAuthSlice: StateCreator<StoreState, [], [], AuthSlice> = (
  set,
) => ({
  user: DEMO_ADMIN,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
});
