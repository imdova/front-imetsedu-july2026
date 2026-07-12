"use client";

import { useTranslations } from "next-intl";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DELIVERY_OPTIONS,
  DURATION_OPTIONS,
  LANGUAGE_FILTER_OPTIONS,
  LEVEL_FILTER_OPTIONS,
  SPECIALTY_OPTIONS,
  catalogFiltersActive,
  emptyCatalogFilters,
  type CatalogFilterState,
} from "@/features/marketing/lib/catalog-filters";

function toggleValue(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function ChipGroup({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="flex flex-col gap-1.5">
        {options.map((o) => {
          const on = selected.includes(o.value);
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onToggle(o.value)}
              className={cn(
                "rounded-lg border px-3 py-2 text-start text-sm font-medium transition-colors",
                on
                  ? "border-[#0b3fa8] bg-[#0b3fa8] text-white"
                  : "border-border text-muted-foreground hover:border-[#0b3fa8]/40 hover:text-foreground",
              )}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface Props {
  value: CatalogFilterState;
  onChange: (next: CatalogFilterState) => void;
  priceCeiling: number;
  className?: string;
}

export function CourseCatalogFilters({ value, onChange, priceCeiling, className }: Props) {
  const t = useTranslations("Marketing");
  const active = catalogFiltersActive(value, priceCeiling);

  const patch = (partial: Partial<CatalogFilterState>) => onChange({ ...value, ...partial });

  const fmt = (n: number) => `${n.toLocaleString("en-US")} EGP`;

  return (
    <aside
      className={cn(
        "space-y-5 rounded-2xl border border-blue-100 bg-gradient-to-b from-blue-50/50 to-white p-4 sm:p-5",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-heading text-sm font-bold text-[#0a2f7a]">{t("catalogFiltersTitle")}</h3>
        {active && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 px-2 text-muted-foreground"
            onClick={() => onChange(emptyCatalogFilters(priceCeiling))}
          >
            <X className="size-3.5" />
            {t("catalogFiltersClear")}
          </Button>
        )}
      </div>

      <div className="space-y-5">
        <ChipGroup
          label={t("filterSpecialty")}
          options={SPECIALTY_OPTIONS.map((o) => ({ value: o.value, label: t(o.labelKey) }))}
          selected={value.specialties}
          onToggle={(v) => patch({ specialties: toggleValue(value.specialties, v) })}
        />
        <ChipGroup
          label={t("filterDelivery")}
          options={DELIVERY_OPTIONS.map((o) => ({ value: o.value, label: t(o.labelKey) }))}
          selected={value.deliveries}
          onToggle={(v) => patch({ deliveries: toggleValue(value.deliveries, v) })}
        />
        <ChipGroup
          label={t("filterDuration")}
          options={DURATION_OPTIONS.map((o) => ({ value: o.value, label: t(o.labelKey) }))}
          selected={value.durations}
          onToggle={(v) => patch({ durations: toggleValue(value.durations, v) })}
        />
        <ChipGroup
          label={t("filterLanguage")}
          options={LANGUAGE_FILTER_OPTIONS.map((o) => ({ value: o.value, label: t(o.labelKey) }))}
          selected={value.languages}
          onToggle={(v) => patch({ languages: toggleValue(value.languages, v) })}
        />
        <ChipGroup
          label={t("filterLevel")}
          options={LEVEL_FILTER_OPTIONS.map((o) => ({ value: o.value, label: t(o.labelKey) }))}
          selected={value.levels}
          onToggle={(v) => patch({ levels: toggleValue(value.levels, v) })}
        />
      </div>

      <div className="space-y-3 border-t border-blue-100 pt-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t("filterPrice")}
          </p>
          <p className="text-sm font-semibold tabular-nums text-[#0a2f7a]">
            {fmt(value.priceMin)} – {fmt(value.priceMax)}
          </p>
        </div>

        <div className="relative h-8">
          <input
            type="range"
            min={0}
            max={priceCeiling}
            step={100}
            value={value.priceMin}
            onChange={(e) => {
              const next = Math.min(Number(e.target.value), value.priceMax - 100);
              patch({ priceMin: Math.max(0, next) });
            }}
            className="pointer-events-none absolute inset-x-0 top-1/2 z-20 h-2 w-full -translate-y-1/2 appearance-none bg-transparent accent-[#0b3fa8] [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:relative [&::-webkit-slider-thumb]:z-30 [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#0b3fa8] [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[#0b3fa8]"
            aria-label={t("filterPriceMin")}
          />
          <input
            type="range"
            min={0}
            max={priceCeiling}
            step={100}
            value={value.priceMax}
            onChange={(e) => {
              const next = Math.max(Number(e.target.value), value.priceMin + 100);
              patch({ priceMax: Math.min(priceCeiling, next) });
            }}
            className="pointer-events-none absolute inset-x-0 top-1/2 z-20 h-2 w-full -translate-y-1/2 appearance-none bg-transparent accent-[#0b3fa8] [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:relative [&::-webkit-slider-thumb]:z-30 [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#0b3fa8] [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[#0b3fa8]"
            aria-label={t("filterPriceMax")}
          />
          <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-blue-100">
            <div
              className="absolute h-full rounded-full bg-[#0b3fa8]/70"
              style={{
                left: `${(value.priceMin / priceCeiling) * 100}%`,
                right: `${100 - (value.priceMax / priceCeiling) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
