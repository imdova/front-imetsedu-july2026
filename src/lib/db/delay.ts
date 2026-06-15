/**
 * Mock-DB helpers. Every mock "query" awaits `delay()` and returns a
 * structurally-cloned copy so callers can never mutate the in-memory seed —
 * exactly how a real network/DB boundary behaves. When the DAL is later pointed
 * at the integration services, these helpers simply disappear.
 */

export const delay = (ms = 350) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Deep clone that works for our plain JSON-like seed data. */
export function clone<T>(value: T): T {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value)) as T;
}

/** Await a small randomized latency, then return a detached clone of `data`. */
export async function respond<T>(data: T, ms = 350): Promise<T> {
  await delay(ms);
  return clone(data);
}
