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
  // Dark mode is disabled platform-wide — always render light.
  const js = `(function(){try{var e=document.documentElement;e.classList.remove('dark');e.style.colorScheme='light';}catch(e){}})();`;
  return <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: js }} />;
}
