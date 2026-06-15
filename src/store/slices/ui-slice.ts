import type { StateCreator } from "zustand";
import type { StoreState } from "../types";

/**
 * UI slice — ephemeral, app-wide interface state (sidebar, command palette).
 * Kept separate from domain/auth state so re-renders stay localized: a
 * component that selects `sidebarCollapsed` never re-renders on auth changes.
 */
export interface UiSlice {
  sidebarCollapsed: boolean;
  commandOpen: boolean;
  /** Nav section label keys that are collapsed (items hidden). */
  collapsedNavSections: Record<string, boolean>;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleNavSection: (sectionKey: string) => void;
  setNavSectionCollapsed: (sectionKey: string, collapsed: boolean) => void;
  setCommandOpen: (open: boolean) => void;
}

export const createUiSlice: StateCreator<StoreState, [], [], UiSlice> = (
  set,
) => ({
  sidebarCollapsed: false,
  commandOpen: false,
  collapsedNavSections: {},
  toggleSidebar: () =>
    set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  toggleNavSection: (sectionKey) =>
    set((s) => ({
      collapsedNavSections: {
        ...s.collapsedNavSections,
        [sectionKey]: !s.collapsedNavSections[sectionKey],
      },
    })),
  setNavSectionCollapsed: (sectionKey, collapsed) =>
    set((s) => ({
      collapsedNavSections: {
        ...s.collapsedNavSections,
        [sectionKey]: collapsed,
      },
    })),
  setCommandOpen: (open) => set({ commandOpen: open }),
});
