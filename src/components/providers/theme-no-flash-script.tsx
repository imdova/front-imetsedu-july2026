import { THEME_STORAGE_KEY } from "./theme-constants";

/**
 * No-flash theme bootstrap. Sets the `dark` class + `color-scheme` before first
 * paint so there's no light→dark flash.
 *
 * Rendered inside <head> as a plain inline <script>, NOT next/script:
 *  - `next/script` still emits a <script> element into the React tree, which
 *    trips React 19's "Encountered a script tag while rendering React
 *    component" warning.
 *  - This must run before the first paint and before hydration, so it has to be
 *    a blocking inline script in the document head. It only ever needs to
 *    execute once from the server-rendered HTML — React never re-runs it on the
 *    client, which is exactly the behaviour we want.
 */
export function ThemeNoFlashScript() {
  const js = `(function(){try{var t=localStorage.getItem('${THEME_STORAGE_KEY}')||'system';var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);var e=document.documentElement;e.classList.toggle('dark',d);e.style.colorScheme=d?'dark':'light';}catch(e){}})();`;
  return <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: js }} />;
}
