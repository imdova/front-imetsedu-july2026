/**
 * Geo → display currency for course pricing.
 *
 * Business rule (set by IMETS):
 *   - Visitor in Egypt        → EGP
 *   - Visitor in Saudi Arabia → SAR
 *   - Everyone else           → USD
 *
 * The country itself is resolved at request time by `/api/geo` (CDN header,
 * with an IP-geolocation fallback). This module only owns the country→currency
 * mapping so the rule lives in one place.
 */
import type { CurrencyCode } from "@/types";

/** Map an ISO-3166 alpha-2 country code to the display currency. */
export function currencyForCountry(country?: string | null): CurrencyCode {
  const cc = (country || "").trim().toUpperCase();
  if (cc === "EG") return "EGP";
  if (cc === "SA") return "SAR";
  return "USD";
}

export type GeoResult = { country: string; currency: CurrencyCode };
