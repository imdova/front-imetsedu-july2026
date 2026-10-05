import { api, type Result } from "@integration/services/http/client";

/** Whether the server has Stripe keys; the pay page hides the card button otherwise. */
export function getStripeStatus(): Promise<Result<{ configured: boolean }>> {
  return api.get<{ configured: boolean }>("/stripe/status");
}

/**
 * Starts a hosted Stripe Checkout for a payment link and returns its URL.
 * The amount is taken from the stored link server-side — never sent from here.
 */
export function createStripeCheckoutSession(
  token: string,
): Promise<Result<{ url: string; id: string }>> {
  return api.post<{ url: string; id: string }>("/stripe/checkout-session", { token });
}

export interface StripeSessionSummary {
  paid: boolean;
  amount: number;
  currency: string;
  courseTitle: string;
  transactionId: string;
}

/** What the thank-you page shows after Stripe redirects back. */
export function getStripeSession(id: string): Promise<Result<StripeSessionSummary>> {
  return api.get<StripeSessionSummary>(`/stripe/session/${encodeURIComponent(id)}`);
}
