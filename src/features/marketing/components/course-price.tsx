"use client";

import * as React from "react";

import { cn, deriveDiscount, formatCurrency } from "@/lib/utils";
import {
  useGeoCurrency,
  pickCourseMoney,
  type Money,
} from "@/hooks/use-geo-currency";

/**
 * Geo-aware course price.
 *
 * Renders EGP on the server / first paint (matches the static/ISR HTML crawlers
 * see, and the no-JS fallback). After mount it asks `/api/geo` (shared, cached
 * across every price on the page) for the visitor's country and swaps the
 * currency: Egypt→EGP, Saudi Arabia→SAR, elsewhere→USD. If the course has no
 * price in the target currency it stays on EGP, so a missing price never shows "0".
 */

export function CoursePrice({
  egp,
  sar,
  usd,
  locale,
  variant = "hero",
}: {
  egp: Money;
  sar?: Money;
  usd?: Money;
  locale: string;
  variant?: "hero" | "compact" | "strip";
}) {
  const ar = locale === "ar";
  const geoCurrency = useGeoCurrency();
  const money = pickCourseMoney(geoCurrency, egp, sar, usd);
  const currency = money.currency;
  const onSale = money.sale > 0 && money.sale < money.price;
  const shown = onSale ? money.sale : money.price;

  // Currency-code prefix format ("EGP 19,000") used in the dark hero strip.
  const strip = (amount: number) =>
    `${currency} ${Math.round(amount).toLocaleString("en-US")}`;

  if (variant === "strip") {
    return (
      <span className="inline-flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <span className="font-semibold tabular-nums">{strip(shown)}</span>
        {onSale && (
          <span className="text-xs text-red-300 line-through tabular-nums">
            {strip(money.price)}
          </span>
        )}
      </span>
    );
  }

  if (variant === "compact") {
    return (
      <span className="flex items-baseline gap-1.5 leading-tight">
        <span className="font-heading text-lg font-bold tabular-nums text-primary">
          {formatCurrency(shown, currency)}
        </span>
        {onSale && (
          <span className="text-[11px] text-muted-foreground line-through tabular-nums">
            {formatCurrency(money.price, currency)}
          </span>
        )}
      </span>
    );
  }

  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
      <span className="font-heading text-3xl font-bold text-primary tabular-nums">
        {formatCurrency(shown, currency)}
      </span>
      {onSale && (
        <>
          <span className="text-muted-foreground line-through tabular-nums">
            {formatCurrency(money.price, currency)}
          </span>
          <span
            className={cn(
              "rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
            )}
          >
            {ar
              ? `وفّر ${deriveDiscount(money.price, money.sale)}٪`
              : `Save ${deriveDiscount(money.price, money.sale)}%`}
          </span>
        </>
      )}
    </div>
  );
}
