"use client";

import * as React from "react";

/** Never resubscribes — "have we mounted" only ever changes once, at mount. */
const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * `false` on the server and during the first client render, `true` afterwards.
 *
 * Use to gate anything that can only be known on the client (portals, drag-and-
 * drop sensors, theme) so the first client render matches the server HTML.
 *
 * Replaces the `useState(false)` + `useEffect(() => setMounted(true), [])` idiom:
 * that sets state synchronously in an effect, which React flags as a cascading
 * render. `useSyncExternalStore` is the sanctioned way to read this — it has an
 * explicit server snapshot rather than a render-then-correct round trip.
 */
export function useMounted(): boolean {
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
