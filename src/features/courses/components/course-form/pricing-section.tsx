"use client";

import { useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";

import type { CourseFormValues } from "@/validations/course-schema";
import { CURRENCIES } from "@/constants/course-options";
import { deriveDiscount, deriveSalePrice, cn } from "@/lib/utils";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

type CurrencyKey = "egp" | "sar" | "usd";

const CURRENCY_STYLES: Record<
  CurrencyKey,
  { badge: string; label: string }
> = {
  egp: {
    badge: "bg-amber-100 text-amber-700",
    label: "EGP",
  },
  sar: {
    badge: "bg-emerald-100 text-emerald-700",
    label: "SAR",
  },
  usd: {
    badge: "bg-violet-100 text-violet-700",
    label: "USD",
  },
};

/** Stacked currency rows — Price, Sale price, Discount (%) per row. */
export function PricingSection() {
  const { control, setValue, getValues } = useFormContext<CourseFormValues>();
  const t = useTranslations("CourseForm");

  const recalcDiscount = (key: CurrencyKey) => {
    const { price, salePrice } = getValues(`pricing.${key}`);
    setValue(
      `pricing.${key}.discount`,
      deriveDiscount(Number(price) || 0, Number(salePrice) || 0),
      { shouldValidate: true },
    );
  };

  const recalcSalePrice = (key: CurrencyKey) => {
    const { price, discount } = getValues(`pricing.${key}`);
    setValue(
      `pricing.${key}.salePrice`,
      deriveSalePrice(Number(price) || 0, Number(discount) || 0),
      { shouldValidate: true },
    );
  };

  // Price changed: if a discount is already set, keep it and recompute the
  // sale price; otherwise fall back to deriving the discount from sale price.
  const onPriceChange = (key: CurrencyKey) => {
    const { discount } = getValues(`pricing.${key}`);
    if (Number(discount) > 0) recalcSalePrice(key);
    else recalcDiscount(key);
  };

  const priceLabel = (key: CurrencyKey) => {
    if (key === "egp") return t("price");
    if (key === "sar") return t("priceSar");
    return t("priceUsd");
  };

  const salePriceLabel = (key: CurrencyKey) => {
    if (key === "egp") return t("salePrice");
    if (key === "sar") return t("salePriceSar");
    return t("salePriceUsd");
  };

  return (
    <div className="divide-y rounded-lg border">
      {CURRENCIES.map((cur) => {
        const key = cur.code.toLowerCase() as CurrencyKey;
        const style = CURRENCY_STYLES[key];

        return (
          <div
            key={cur.code}
            className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center"
          >
            <div className="flex shrink-0 items-center gap-2.5 sm:w-28">
              <span
                className={cn(
                  "grid size-9 place-items-center rounded-full text-xs font-semibold",
                  style.badge,
                )}
              >
                {key === "egp" ? "$" : style.label}
              </span>
              <span className="font-medium">{cur.code}</span>
            </div>

            <div className="grid flex-1 gap-4 sm:grid-cols-3">
              <FormField
                control={control}
                name={`pricing.${key}.price`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-muted-foreground">
                      {priceLabel(key)}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        placeholder="0"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          onPriceChange(key);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`pricing.${key}.salePrice`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-muted-foreground">
                      {salePriceLabel(key)}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        placeholder="0"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          recalcDiscount(key);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`pricing.${key}.discount`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-muted-foreground">
                      {t("discountPct")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        placeholder="0"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          recalcSalePrice(key);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
