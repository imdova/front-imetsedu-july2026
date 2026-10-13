/**
 * Framework-agnostic HTTP client for the IMETS platform API.
 *
 * This is a decoupled clone of the original Next.js/Zustand-bound client.
 * The ONLY behavioural change versus the source project is auth-token
 * acquisition: instead of reading directly from a Zustand store, the token
 * is obtained through an injectable provider (`configureApiClient`). Wire it
 * once at app startup to whatever auth state your new project uses.
 *
 *   // new project bootstrap
 *   import { configureApiClient } from "@integration/lib/api-client";
 *   configureApiClient({
 *     baseUrl: process.env.NEXT_PUBLIC_API_URL,
 *     getToken: () => myAuthStore.getState().user?.access_token ?? null,
 *   });
 *
 * Every service in `src/services/*` calls through the `api` object exported
 * here, so endpoints + payload shapes are reused verbatim.
 */

export type Result<T, E = string> =
  | { ok: true; data: T }
  | { ok: false; error: E };

export const ok = <T>(data: T): Result<T, never> => ({ ok: true, data });
export const fail = <E = string>(error: E): Result<never, E> => ({
  ok: false,
  error,
});

export function toMessage(err: unknown, fallback = "Something went wrong") {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return fallback;
}

/* -------------------------------------------------------------------------- */
/*  Configuration (injectable — replaces the original Zustand coupling)        */
/* -------------------------------------------------------------------------- */

type TokenProvider = () => string | null | Promise<string | null>;

interface ApiClientConfig {
  /** API origin, e.g. https://main-api.imetsedu.com */
  baseUrl: string;
  /** Returns the current bearer token (or null when unauthenticated). */
  getToken: TokenProvider;
  /** Optional: invoked on 401 responses (e.g. to trigger logout/refresh). */
  onUnauthorized?: () => void;
}

const config: ApiClientConfig = {
  baseUrl:
    (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_URL) ||
    "https://main-api.imetsedu.com",
  getToken: () => null,
};

export function configureApiClient(partial: Partial<ApiClientConfig>): void {
  for (const [key, value] of Object.entries(partial)) {
    if (value !== undefined) {
      (config as unknown as Record<string, unknown>)[key] = value;
    }
  }
}

/* -------------------------------------------------------------------------- */
/*  Transport                                                                  */
/* -------------------------------------------------------------------------- */

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
  requireAuth?: boolean;
  /** ISR revalidation in seconds for public GET endpoints. Pass `false` to opt-out. */
  revalidate?: number | false;
  /** Per-request timeout in ms. Defaults to {@link DEFAULT_TIMEOUT_MS}. */
  timeoutMs?: number;
}

/**
 * Long enough for a cold backend to answer, short enough that a page render
 * does not hang on it. The API runs behind pm2 and is restarted on every
 * deploy, so "slow first response" is a normal state, not an exception.
 */
const DEFAULT_TIMEOUT_MS = 10_000;
/** Extra attempts for reads. Mutations are never retried — they are not safe to repeat. */
const GET_RETRIES = 2;
const RETRY_DELAY_MS = 400;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * One attempt. {@link request} decides whether a failure is worth repeating.
 */
async function attempt<T>(
  method: HttpMethod,
  endpoint: string,
  options: RequestOptions = {}
): Promise<Result<T> & { retryable?: boolean }> {
  const { params, requireAuth = true, revalidate, timeoutMs, ...init } = options;

  try {
    const url = new URL(
      `${config.baseUrl}/${endpoint.replace(/^\//, "")}`
    );
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const headers = new Headers(init.headers);
    if (!headers.has("Content-Type") && !(init.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }

    if (requireAuth) {
      const token = await config.getToken();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    }

    // Public GET endpoints use ISR so stale-while-revalidate works and the
    // page never blocks on a slow/cold API hit. Auth-required GETs and all
    // mutations stay no-store so they always return fresh data.
    const isPublicGet = method === "GET" && !requireAuth;
    const fetchNext =
      isPublicGet && revalidate !== false
        ? { revalidate: typeof revalidate === "number" ? revalidate : 300 }
        : undefined;

    // Without a deadline a hung connection blocks the render until the
    // platform's own timeout, which is far longer than any page should wait.
    const response = await fetch(url.toString(), {
      cache: isPublicGet ? undefined : "no-store",
      ...(fetchNext ? { next: fetchNext } : {}),
      signal: init.signal ?? AbortSignal.timeout(timeoutMs ?? DEFAULT_TIMEOUT_MS),
      ...init,
      method,
      headers,
    } as RequestInit);

    if (response.status === 401) {
      config.onUnauthorized?.();
    }

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg =
        payload?.message ||
        payload?.error ||
        `Request failed with status ${response.status}`;
      // A 5xx is the server having a bad moment; a 4xx is an answer.
      return { ...fail(errorMsg), retryable: response.status >= 500 };
    }

    return ok(payload as T);
  } catch (err) {
    // Timeouts and connection failures land here, and both are worth retrying.
    return { ...fail(toMessage(err, "Network or server error")), retryable: true };
  }
}

async function request<T>(
  method: HttpMethod,
  endpoint: string,
  options: RequestOptions = {}
): Promise<Result<T>> {
  const retries = method === "GET" ? GET_RETRIES : 0;
  let last: Result<T> & { retryable?: boolean } = await attempt<T>(method, endpoint, options);
  for (let i = 0; i < retries && !last.ok && last.retryable; i++) {
    await sleep(RETRY_DELAY_MS * (i + 1));
    last = await attempt<T>(method, endpoint, options);
  }
  if (last.ok) return { ok: true, data: last.data };
  return { ok: false, error: last.error };
}

function encodeBody(body: unknown): BodyInit | undefined {
  if (body === undefined || body === null) return undefined;
  if (body instanceof FormData) return body;
  if (body instanceof Blob) return body;
  if (body instanceof URLSearchParams) return body;
  if (typeof body === "string") return body;
  return JSON.stringify(body);
}

export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>("GET", endpoint, options),

  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>("POST", endpoint, { ...options, body: encodeBody(body) }),

  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>("PUT", endpoint, { ...options, body: encodeBody(body) }),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>("PATCH", endpoint, { ...options, body: encodeBody(body) }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>("DELETE", endpoint, options),

  /**
   * Browser-only: streams a file response and triggers a download.
   * Call it from client components only, exactly as the source project did.
   */
  download: async (
    endpoint: string,
    filename: string,
    options: RequestOptions = {}
  ): Promise<Result<void>> => {
    const { params, requireAuth = true } = options;
    try {
      if (typeof window === "undefined") {
        return fail("download() must be called in a browser environment");
      }
      const url = new URL(`${config.baseUrl}/${endpoint.replace(/^\//, "")}`);
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            url.searchParams.append(key, String(value));
          }
        });
      }

      const headers = new Headers();
      if (requireAuth) {
        const token = await config.getToken();
        if (token) {
          headers.set("Authorization", `Bearer ${token}`);
        }
      }

      const response = await fetch(url.toString(), {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        const errorMsg =
          payload?.message ||
          payload?.error ||
          `Download failed with status ${response.status}`;
        return fail(errorMsg);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      return ok(undefined);
    } catch (err) {
      return fail(toMessage(err, "Download error"));
    }
  },
};
