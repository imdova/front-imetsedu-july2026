import type { StateCreator } from "zustand";
import type { StoreState } from "../types";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "instructor" | "staff" | "student";
  avatarUrl?: string;
  access_token?: string;
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
};

export const createAuthSlice: StateCreator<StoreState, [], [], AuthSlice> = (
  set,
) => ({
  user: DEMO_ADMIN,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
});
