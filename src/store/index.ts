import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";

import type { StoreState } from "./types";
import { createUiSlice } from "./slices/ui-slice";
import { createAuthSlice } from "./slices/auth-slice";

/**
 * Single app store composed from independent slices (slice pattern). Only
 * durable preferences (sidebar state) are persisted; transient and auth state
 * are intentionally excluded from storage via `partialize`.
 */
export const useStore = create<StoreState>()(
  persist(
    (...a) => ({
      ...createUiSlice(...a),
      ...createAuthSlice(...a),
    }),
    {
      name: "imets-admin-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        collapsedNavSections: state.collapsedNavSections,
        user: state.user,
      }),
    },
  ),
);

/**
 * Selector hooks — always select the narrowest slice needed. `useShallow`
 * prevents re-renders when unrelated state changes (best-practice typing).
 */
export const useUi = () =>
  useStore(
    useShallow((s) => ({
      sidebarCollapsed: s.sidebarCollapsed,
      commandOpen: s.commandOpen,
      collapsedNavSections: s.collapsedNavSections,
      toggleSidebar: s.toggleSidebar,
      setSidebarCollapsed: s.setSidebarCollapsed,
      toggleNavSection: s.toggleNavSection,
      setNavSectionCollapsed: s.setNavSectionCollapsed,
      setCommandOpen: s.setCommandOpen,
    })),
  );

export const useAuth = () =>
  useStore(
    useShallow((s) => ({
      user: s.user,
      setUser: s.setUser,
      logout: s.logout,
    })),
  );
