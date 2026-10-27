"use client";

import * as React from "react";

/**
 * Fetch a JSON document the first time something asks for it.
 *
 * For data a page *might* need — a search index, say — that would otherwise be
 * inlined into every page view whether or not anyone searches. Call `load()`
 * from the interaction that makes the data necessary (focusing the search box);
 * further calls are no-ops. A failed request clears the flag so the next
 * interaction retries rather than leaving the feature permanently degraded.
 */
export function useLazyJson<T>(url: string) {
  const [data, setData] = React.useState<T | null>(null);
  const started = React.useRef(false);

  const load = React.useCallback(() => {
    if (started.current) return;
    started.current = true;
    fetch(url)
      .then((res) => (res.ok ? (res.json() as Promise<T>) : Promise.reject(new Error(String(res.status)))))
      .then(setData)
      .catch(() => {
        started.current = false;
      });
  }, [url]);

  return { data, load };
}
