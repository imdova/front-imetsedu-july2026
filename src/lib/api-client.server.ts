/**
 * Server-side configuration of the integration HTTP client.
 *
 * DAL calls run in React Server Components, where the bearer token can't come
 * from client Zustand. Instead the token is read from the `imets_token` cookie
 * (set at login). `cookies()` is request-scoped via AsyncLocalStorage, so a
 * single global registration resolves the right token per request.
 *
 * This module imports `next/headers`, which makes it server-only — never import
 * it from a client component or from the `@/lib/dal` barrel (which is reachable
 * from client components). Wire it from the server `layout.tsx` instead.
 */
import { cookies } from "next/headers";
import { configureApiClient } from "@integration/lib/api-client";

let configured = false;

export function configureServerApiClient(): void {
  if (configured) return;
  configured = true;

  configureApiClient({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
    getToken: async () => {
      try {
        const store = await cookies();
        return store.get("imets_token")?.value ?? null;
      } catch {
        // Called outside a request scope (e.g. static generation) — no token.
        return null;
      }
    },
  });
}
