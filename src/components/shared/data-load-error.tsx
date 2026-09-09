import { AlertTriangle } from "lucide-react";

import type { Result } from "@integration/lib/api-client";

/**
 * Surfaces failed server-side fetches instead of letting them render as "0".
 *
 * Admin pages commonly reduce a DAL result with `res.ok ? res.data : []`, which
 * turns every failure — an expired token, a permission gate, a backend that is
 * down — into an empty table. The screen then says "No users found", which is a
 * statement about the data rather than about the request, and is wrong in a way
 * nobody can act on: it reads as data loss.
 *
 * This says which source failed and what the API replied, so the actual cause
 * is on screen. 401/403 in particular get a concrete next step, because a stale
 * session is by far the most common reason a populated directory renders empty.
 */

export interface FailedSource {
  /** Human label for the thing being fetched, e.g. "Staff directory". */
  label: string;
  error: string;
}

/** Collect the failures from a set of labelled results. */
export function failedSources(
  entries: [string, Result<unknown>][],
): FailedSource[] {
  return entries
    .filter(([, r]) => !r.ok)
    .map(([label, r]) => ({ label, error: (r as { error: string }).error }));
}

const looksLikeAuth = (msg: string) =>
  /unauthor|forbidden|401|403|token|expired|jwt/i.test(msg);

export function DataLoadError({ sources }: { sources: FailedSource[] }) {
  if (sources.length === 0) return null;
  const authProblem = sources.some((s) => looksLikeAuth(s.error));

  return (
    <div
      role="alert"
      className="rounded-xl border border-destructive/30 bg-destructive/[0.06] p-4"
    >
      <p className="flex items-center gap-2 text-sm font-semibold text-destructive">
        <AlertTriangle className="size-4" />
        Couldn&apos;t load some data — this page is showing less than it should
      </p>
      <ul className="mt-2 space-y-1">
        {sources.map((s) => (
          <li key={s.label} className="text-sm text-foreground/80">
            <span className="font-medium">{s.label}:</span> {s.error}
          </li>
        ))}
      </ul>
      <p className="mt-2.5 text-sm text-muted-foreground">
        {authProblem
          ? "This is a session problem, not missing data — your records are still there. Sign out and back in, then reload."
          : "The records may still exist. Reload, and if it persists check that the API is reachable."}
      </p>
    </div>
  );
}
