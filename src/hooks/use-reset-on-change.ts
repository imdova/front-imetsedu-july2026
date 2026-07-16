"use client";

import * as React from "react";

/**
 * Runs `reset` during render whenever any of `deps` changes — the "reseed this
 * form when the dialog opens / the edited record changes" idiom.
 *
 * Same trigger points as `useEffect(reset, deps)`, but React re-runs the render
 * before committing instead of painting the previous record's values first and
 * correcting them a frame later. Keep any guard (`if (!open) return`) inside
 * `reset`, exactly as it sat inside the effect.
 *
 * `reset` may only set state belonging to the calling component — that is what
 * makes setting state during render legal here.
 *
 * Every dep must be referentially stable across renders. This is stricter than
 * `useEffect`, which tolerates a dep rebuilt each render because re-setting a
 * state value to an equal one makes React bail out of the re-render. Here the
 * bookkeeping `setPrev` commits on every detected change, so a dep that is never
 * `Object.is`-equal to itself would loop. Props, and memoised values such as
 * next-intl's `t`, are fine; an array or object literal built in the caller's own
 * render body is not.
 */
export function useResetOnChange(deps: readonly unknown[], reset: () => void): void {
  // null until the first render completes, so `reset` runs on mount just as the
  // effect it replaces did.
  const [prev, setPrev] = React.useState<readonly unknown[] | null>(null);
  const changed =
    prev === null ||
    prev.length !== deps.length ||
    deps.some((d, i) => !Object.is(d, prev[i]));
  if (changed) {
    // Compared element-wise, so the fresh array literal each render is not
    // itself a change — this settles after one pass.
    setPrev(deps);
    reset();
  }
}
