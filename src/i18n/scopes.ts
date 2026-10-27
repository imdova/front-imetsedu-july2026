import scopes from "./scopes.json";

/**
 * Which message namespaces the browser receives, per route area.
 *
 * `NextIntlClientProvider` serialises the messages it is given into the page, so
 * handing it the whole catalogue puts every namespace — including the ~50 KB
 * admin one — into the HTML of a public marketing page that never reads it. A
 * client component only needs the namespaces it passes to `useTranslations`;
 * server components read messages on the server and need nothing here.
 *
 * The lists live in `scopes.json` so the build scripts can read them without
 * importing TypeScript. `scripts/check-i18n-scopes.mjs` walks the import graph
 * from each area and fails when a client component reads a namespace its area
 * does not ship — the failure mode otherwise is a raw message key on screen,
 * with no error. `scripts/gen-public-message-keys.mjs` narrows the public
 * namespaces further, to the keys the browser code actually names.
 */

/** Everything the locale layout's own client components read. */
export const ROOT_NAMESPACES: readonly string[] = scopes.root;

/** The marketing site. Client code here reads only these. */
export const PUBLIC_NAMESPACES: readonly string[] = scopes.public;

/**
 * Areas that keep the full catalogue. They are signed-in consoles, not landing
 * pages, so the weight does not reach a search crawler or a first-time visitor,
 * and several read namespaces through `useTranslations()` with a path prefix
 * that is not statically checkable.
 */
export const FULL_CATALOGUE = "all" as const;

export type NamespaceScope = readonly string[] | typeof FULL_CATALOGUE;
