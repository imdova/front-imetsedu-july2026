import Script from "next/script";
import { THEME_STORAGE_KEY } from "./theme-constants";

/**
 * No-flash theme bootstrap. Sets the `dark` class + `color-scheme` before first
 * paint so there's no light→dark flash.
 *
 * Uses `next/script` with `strategy="beforeInteractive"` (injected into the
 * document by Next) instead of a raw `<script>` element — a raw inline
 * `<script>` in the React tree triggers React 19's "Encountered a script tag
 * while rendering React component" warning during hydration and may not run.
 */
export function ThemeNoFlashScript() {
  const js = `(function(){try{var t=localStorage.getItem('${THEME_STORAGE_KEY}')||'system';var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);var e=document.documentElement;e.classList.toggle('dark',d);e.style.colorScheme=d?'dark':'light';}catch(e){}})();`;
  return (
    <Script id="theme-no-flash" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: js }} />
  );
}
