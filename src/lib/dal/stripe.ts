/** Stripe DAL — LIVE against the NestJS `stripe` module. */
import * as svc from "@integration/services/stripe";

/** LIVE: public — is Stripe configured on this environment? */
export const fetchStripeStatus = () => svc.getStripeStatus();

/** LIVE: public — hosted Checkout Session for a CRM payment link. */
export const createStripeCheckout = (token: string) =>
  svc.createStripeCheckoutSession(token);

/** LIVE: public — summary of a finished Checkout Session (amount, course). */
export const fetchStripeSession = (id: string) => svc.getStripeSession(id);
export type { StripeSessionSummary } from "@integration/services/stripe";
