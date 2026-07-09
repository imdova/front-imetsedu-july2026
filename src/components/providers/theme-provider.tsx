"use client";

import * as React from "react";

import { THEME_STORAGE_KEY } from "./theme-constants";

/**
 * Lightweight class-based theme provider (replaces next-themes).
 *
 * The no-flash bootstrap script lives in a separate *server* component
 * (`ThemeNoFlashScript` in `./theme-no-flash-script`) so React never renders a
 * `<script>` during a client render (which React 19 flags and never executes).
 * `useTheme()` keeps the same shape the app already used.
 */
export type Theme = "light" | "dark" | "system";
export { THEME_STORAGE_KEY };

interface ThemeCtx {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (t: Theme) => void;
}
const ThemeContext = React.createContext<ThemeCtx | null>(null);

function systemPrefersDark(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
}
function applyTheme(theme: Theme): "light" | "dark" {
  const dark = theme === "dark" || (theme === "system" && systemPrefersDark());
  const el = document.documentElement;
  el.classList.toggle("dark", dark);
  el.style.colorScheme = dark ? "dark" : "light";
  return dark ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = React.useState<"light" | "dark">("light");

  React.useEffect(() => {
    let stored: Theme = "system";
    try { stored = (localStorage.getItem(THEME_STORAGE_KEY) as Theme | null) ?? "system"; } catch { /* ignore */ }
    setThemeState(stored);
    setResolvedTheme(applyTheme(stored));

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setThemeState((t) => { if (t === "system") setResolvedTheme(applyTheme("system")); return t; });
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const setTheme = React.useCallback((t: Theme) => {
    try { localStorage.setItem(THEME_STORAGE_KEY, t); } catch { /* ignore */ }
    setThemeState(t);
    setResolvedTheme(applyTheme(t));
  }, []);

  const value = React.useMemo<ThemeCtx>(() => ({ theme, resolvedTheme, setTheme }), [theme, resolvedTheme, setTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeCtx {
  return React.useContext(ThemeContext) ?? { theme: "system", resolvedTheme: "light", setTheme: () => {} };
}
