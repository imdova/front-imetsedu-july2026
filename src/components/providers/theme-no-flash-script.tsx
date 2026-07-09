import { THEME_STORAGE_KEY } from "./theme-constants";

/**
 * No-flash theme bootstrap. This MUST be a server component: rendering a
 * `<script>` inside a client component triggers React 19's "Encountered a
 * script tag while rendering React component" warning and the script never
 * executes. As a server component the tag is emitted as real HTML in the
 * initial document, so it runs before hydration and sets the theme class
 * before first paint (no flash).
 */
export function ThemeNoFlashScript() {
  const js = `(function(){try{var t=localStorage.getItem('${THEME_STORAGE_KEY}')||'system';var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);var e=document.documentElement;e.classList.toggle('dark',d);e.style.colorScheme=d?'dark':'light';}catch(e){}})();`;
  return <script dangerouslySetInnerHTML={{ __html: js }} />;
}
