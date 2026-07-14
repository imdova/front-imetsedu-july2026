/**
 * PayPal client-id used across the public checkout and CRM payment links.
 * Public by design (it's the browser-side client id). Override per environment
 * with NEXT_PUBLIC_PAYPAL_CLIENT_ID; falls back to the live IMETS client id.
 */
export const PAYPAL_CLIENT_ID =
  process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ||
  "AciGOwxWxJ5-oteiz0qyQFRh3uAv4uWBqjfjKCAoZU4K6_jtGhHSDCqj_aoxuANLYpKP90oYTSao_QHn";

export const PAYPAL_CURRENCY = "USD";
