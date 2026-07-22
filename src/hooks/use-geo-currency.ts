"use client";

import * as React from "react";

import type { CurrencyCode } from "@/types";
import type { GeoResult } from "@/lib/geo-currency";

/**
 * Client-side geo → display currency, shared across every price on the page.
 *
 * `/api/geo` is fetched at most ONCE per page load (module-cached promise), so a
 * catalog of 20 course cards makes a single request, not 20. Default is EGP (the
 * SSR/first-paint currency); it swaps to SAR/USD only once a country resolves.
 */
let geoPromise: Promise<GeoResult | null> | null = null;

function loadGeo(): Promise<GeoResult | null> {
  if (!geoPromise) {
    geoPromise = fetch("/api/geo")
      .then((r) => (r.ok ? (r.json() as Promise<GeoResult>) : null))
      .catch(() => null);
  }
  return geoPromise;
}

/** Resolved display currency for the visitor. EGP until (and unless) geo says otherwise. */
export function useGeoCurrency(): CurrencyCode {
  const [currency, setCurrency] = React.useState<CurrencyCode>("EGP");
  React.useEffect(() => {
    let alive = true;
    loadGeo().then((geo) => {
      // No country resolved ⇒ keep the EGP default (don't guess).
      if (alive && geo?.country && geo.currency) setCurrency(geo.currency);
    });
    return () => {
      alive = false;
    };
  }, []);
  return currency;
}

export type Money = { price: number; sale: number };

/**
 * Pick the price pool for a currency, falling back to EGP when that currency
 * has no configured price (so a missing SAR/USD price never shows "0").
 */
export function pickCourseMoney(
  currency: CurrencyCode,
  egp: Money,
  sar?: Money,
  usd?: Money,
): { currency: CurrencyCode; price: number; sale: number } {
  const pool = currency === "SAR" ? sar : currency === "USD" ? usd : egp;
  if (currency !== "EGP" && pool && pool.price > 0) {
    return { currency, price: pool.price, sale: pool.sale };
  }
  return { currency: "EGP", price: egp.price, sale: egp.sale };
}
