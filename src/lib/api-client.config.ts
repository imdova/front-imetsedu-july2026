/**
 * One-time bootstrap that injects this app's auth/token source into the
 * vendored integration HTTP client. Today the DAL serves dummy data, so this is
 * dormant — but the moment a DAL function is switched to call an integration
 * service, every request is already authenticated against the live backend at
 * NEXT_PUBLIC_API_URL with the token from our Zustand auth slice.
 *
 * Call `bootstrapApiClient()` once from a top-level client component.
 */
import { configureApiClient } from "@integration/lib/api-client";
import { useStore } from "@/store";

let configured = false;

export function bootstrapApiClient(): void {
  if (configured) return;
  // Client-only: the server bundle is configured via api-client.server.ts
  // (cookie-based token). Guarding here prevents the client (Zustand) token
  // provider from overwriting the server config during SSR.
  if (typeof window === "undefined") return;
  configured = true;

  configureApiClient({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
    getToken: () => useStore.getState().user?.access_token ?? null,
    onUnauthorized: () => useStore.getState().logout(),
  });
}
