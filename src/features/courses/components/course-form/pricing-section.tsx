"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";

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

function CurrencyRow({
  currencyKey,
  control,
  t,
  onPriceChange,
  recalcDiscount,
  recalcSalePrice,
}: {
  currencyKey: CurrencyKey;
  control: ReturnType<typeof useFormContext<CourseFormValues>>["control"];
  t: ReturnType<typeof useTranslations>;
  onPriceChange: (key: CurrencyKey) => void;
  recalcDiscount: (key: CurrencyKey) => void;
  recalcSalePrice: (key: CurrencyKey) => void;
}) {
  const style = CURRENCY_STYLES[currencyKey];

  const priceLabel = () => {
    if (currencyKey === "egp") return t("price");
    if (currencyKey === "sar") return t("priceSar");
    return t("priceUsd");
  };

  const salePriceLabel = () => {
    if (currencyKey === "egp") return t("salePrice");
    if (currencyKey === "sar") return t("salePriceSar");
    return t("salePriceUsd");
  };

  return (
    <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
      <div className="flex shrink-0 items-center gap-2.5 sm:w-28">
        <span
          className={cn(
            "grid size-9 place-items-center rounded-full text-xs font-semibold",
            style.badge,
          )}
        >
          {currencyKey === "egp" ? "$" : style.label}
        </span>
        <span className="font-medium">{style.label}</span>
      </div>

      <div className="grid flex-1 gap-4 sm:grid-cols-3">
        <FormField
          control={control}
          name={`pricing.${currencyKey}.price`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs text-muted-foreground">
                {priceLabel()}
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    onPriceChange(currencyKey);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`pricing.${currencyKey}.salePrice`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs text-muted-foreground">
                {salePriceLabel()}
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    recalcDiscount(currencyKey);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`pricing.${currencyKey}.discount`}
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
                    recalcSalePrice(currencyKey);
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
}

function hasOptionalPricing(pricing: CourseFormValues["pricing"] | undefined) {
  if (!pricing) return false;
  const keys: CurrencyKey[] = ["sar", "usd"];
  return keys.some((key) => {
    const row = pricing[key];
    return (
      Number(row?.price) > 0 ||
      Number(row?.salePrice) > 0 ||
      Number(row?.discount) > 0
    );
  });
}

/** Stacked currency rows — EGP shown by default; SAR & USD optional behind collapse. */
export function PricingSection() {
  const { control, setValue, getValues, watch } =
    useFormContext<CourseFormValues>();
  const t = useTranslations("CourseForm");
  const [showOptional, setShowOptional] = React.useState(false);
  const pricing = watch("pricing");
  const hasOptional = hasOptionalPricing(pricing);

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

  const onPriceChange = (key: CurrencyKey) => {
    const { discount } = getValues(`pricing.${key}`);
    if (Number(discount) > 0) recalcSalePrice(key);
    else recalcDiscount(key);
  };

  const optionalCurrencies = CURRENCIES.filter((c) => c.code !== "EGP");

  return (
    <div className="divide-y rounded-lg border">
      <CurrencyRow
        currencyKey="egp"
        control={control}
        t={t}
        onPriceChange={onPriceChange}
        recalcDiscount={recalcDiscount}
        recalcSalePrice={recalcSalePrice}
      />

      <div className="bg-muted/20">
        <button
          type="button"
          onClick={() => setShowOptional((v) => !v)}
          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-start text-sm font-medium text-foreground transition-colors hover:bg-muted/40"
          aria-expanded={showOptional}
        >
          <span className="flex items-center gap-2">
            {t("optionalCurrencies")}
            {hasOptional && !showOptional ? (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                {t("filled")}
              </span>
            ) : null}
          </span>
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform",
              showOptional && "rotate-180",
            )}
          />
        </button>
        {showOptional ? (
          <div className="divide-y border-t">
            {optionalCurrencies.map((cur) => {
              const key = cur.code.toLowerCase() as CurrencyKey;
              return (
                <CurrencyRow
                  key={cur.code}
                  currencyKey={key}
                  control={control}
                  t={t}
                  onPriceChange={onPriceChange}
                  recalcDiscount={recalcDiscount}
                  recalcSalePrice={recalcSalePrice}
                />
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
