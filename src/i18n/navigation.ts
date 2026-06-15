import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * Locale-aware navigation primitives. Use these instead of `next/link` and
 * `next/navigation` everywhere in the app so links/redirects automatically
 * carry the active locale (and omit the prefix for the default `en`).
 * `usePathname` here returns the path WITHOUT the locale prefix, which is
 * exactly what we match nav `href`s against.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
