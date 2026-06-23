/**
 * Client-side helpers for Meta Pixel ↔ Conversions API deduplication.
 *
 * We send the same `eventId` from the browser Pixel and from the server (CAPI),
 * plus the `_fbp` / `_fbc` cookies the Pixel sets, so Meta matches and dedups
 * the two and improves event-match quality.
 */
declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export interface FbLeadContext {
  fbp?: string;
  fbc?: string;
  eventId: string;
  eventSourceUrl: string;
}

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : undefined;
}

function newEventId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `e_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

/** Build the dedup/match context to send alongside a lead capture. */
export function fbLeadContext(): FbLeadContext {
  return {
    fbp: readCookie("_fbp"),
    fbc: readCookie("_fbc"),
    eventId: newEventId(),
    eventSourceUrl: typeof window !== "undefined" ? window.location.href : "",
  };
}

/** Fire the browser-side Lead with the SAME eventId so Meta dedups vs. the server event. */
export function fireBrowserLead(eventId: string, customData?: Record<string, unknown>): void {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq("track", "Lead", customData ?? {}, { eventID: eventId });
  }
}
