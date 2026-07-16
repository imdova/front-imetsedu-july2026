"use client";

import * as React from "react";

/** The URL is read once per mount here — these links are entered, not navigated. */
const subscribe = () => () => {};
const getServerSnapshot = () => null;

/**
 * Reads a query-string value on the client, `null` on the server and during the
 * first client render.
 *
 * For values that arrive in an emailed link (`?token=…`) and are needed before
 * anything renders. Replaces `useState(null)` + `useEffect(() => setParam(…))`,
 * which sets state synchronously in an effect; the explicit server snapshot here
 * means the first client render still matches the server HTML.
 *
 * Pair with `useMounted()` when you need to tell "not read yet" apart from
 * "read, and the param is absent" — this returns `null` for both.
 */
export function useQueryParam(name: string): string | null {
  const getSnapshot = React.useCallback(
    () => new URLSearchParams(window.location.search).get(name),
    [name],
  );
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
