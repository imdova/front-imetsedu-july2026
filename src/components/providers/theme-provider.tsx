"use client";

import * as React from "react";

import { THEME_STORAGE_KEY } from "./theme-constants";

/**
 * Light-only theme provider. Dark mode is disabled platform-wide, so this keeps
 * the `useTheme()` shape the app already imports but always resolves to light
 * and never adds the `dark` class. `setTheme` is a no-op.
 *
 * The no-flash bootstrap script (`ThemeNoFlashScript`) strips any stale `dark`
 * class before first paint.
 */
export type Theme = "light" | "dark" | "system";
export { THEME_STORAGE_KEY };

interface ThemeCtx {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (t: Theme) => void;
}
const ThemeContext = React.createContext<ThemeCtx | null>(null);

const LIGHT_VALUE: ThemeCtx = { theme: "light", resolvedTheme: "light", setTheme: () => {} };

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    // Belt-and-braces: make sure nothing left a `dark` class around.
    const el = document.documentElement;
    el.classList.remove("dark");
    el.style.colorScheme = "light";
  }, []);

  return <ThemeContext.Provider value={LIGHT_VALUE}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeCtx {
  return React.useContext(ThemeContext) ?? LIGHT_VALUE;
}
