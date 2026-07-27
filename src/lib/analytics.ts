/**
 * Thin, safe wrappers over the two analytics globals (GA4 `gtag` + Meta `fbq`).
 * Both no-op when the underlying script isn't loaded, so callers never need to
 * guard. `window.fbq` is declared globally in `@/lib/meta-events`.
 */
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

/** GA4 custom event. */
export function gaEvent(name: string, params?: Record<string, unknown>): void {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", name, params ?? {});
  }
}

/** Meta Pixel standard/custom event (queues on the fbq stub until fbevents loads). */
export function fbqTrack(event: string, data?: Record<string, unknown>, opts?: Record<string, unknown>): void {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq("track", event, data ?? {}, opts);
  }
}

export {};
