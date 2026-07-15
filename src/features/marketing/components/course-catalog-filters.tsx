"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { X, ChevronDown } from "lucide-react";

import type { CourseRow } from "@/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CERT_OPTIONS,
  DELIVERY_OPTIONS,
  DURATION_OPTIONS,
  LANGUAGE_FILTER_OPTIONS,
  LEVEL_FILTER_OPTIONS,
  catalogFiltersActive,
  emptyCatalogFilters,
  facetCounts,
  type CatalogFilterState,
  type FacetKey,
} from "@/features/marketing/lib/catalog-filters";

function toggleValue(list: string[], value: string): string[] {
  return list.includes(value)
    ? list.filter((v) => v !== value)
    : [...list, value];
}

type Option = { value: string; label: string; hint?: string; count: number };

/**
 * One collapsible facet group. Options wrap as chips rather than stacking full
 * width — the same 18 options ran ~800px tall as a single column, which pushed
 * the price slider out of reach of the sticky rail.
 */
function FacetGroup({
  label,
  options,
  selected,
  onToggle,
  defaultOpen = true,
}: {
  label: string;
  options: Option[];
  selected: string[];
  onToggle: (value: string) => void;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  const groupId = React.useId();
  // A facet nobody can act on is noise — drop it rather than render dead chips.
  if (!options.some((o) => o.count > 0 || selected.includes(o.value)))
    return null;

  return (
    <div className="border-b border-border/60 pb-4 last:border-0 last:pb-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={groupId}
        className="flex w-full items-center justify-between gap-2 py-1 text-start"
      >
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <span className="flex items-center gap-1.5">
          {selected.length > 0 && (
            <span className="grid size-4.5 min-w-[1.125rem] place-items-center rounded-full bg-primary px-1 text-[0.625rem] font-bold text-primary-foreground tabular-nums">
              {selected.length}
            </span>
          )}
          <ChevronDown
            className={cn(
              "size-4 text-muted-foreground transition-transform",
              open && "rotate-180",
            )}
          />
        </span>
      </button>

      {open && (
        <div id={groupId} className="mt-2.5 flex flex-wrap gap-1.5">
          {options.map((o) => {
            const on = selected.includes(o.value);
            // Zero-count options are dead ends: keep them visible (they tell you
            // what exists) but not clickable, unless already selected.
            const dead = o.count === 0 && !on;
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => onToggle(o.value)}
                aria-pressed={on}
                disabled={dead}
                title={o.hint}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs font-medium transition-colors",
                  on
                    ? "border-primary bg-primary text-primary-foreground"
                    : dead
                      ? "cursor-not-allowed border-border/50 text-muted-foreground/40"
                      : "border-border text-foreground/80 hover:border-primary/50 hover:bg-primary/5 hover:text-foreground",
                )}
              >
                {o.label}
                <span
                  className={cn(
                    "tabular-nums",
                    on
                      ? "text-primary-foreground/70"
                      : "text-muted-foreground/70",
                  )}
                >
                  {o.count}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface Props {
  value: CatalogFilterState;
  onChange: (next: CatalogFilterState) => void;
  priceCeiling: number;
  /** Full catalog — needed to compute per-option result counts. */
  courses: CourseRow[];
  className?: string;
}

export function CourseCatalogFilters({
  value,
  onChange,
  priceCeiling,
  courses,
  className,
}: Props) {
  const t = useTranslations("Marketing");
  const active = catalogFiltersActive(value, priceCeiling);

  const patch = (partial: Partial<CatalogFilterState>) =>
    onChange({ ...value, ...partial });
  const fmt = (n: number) => `${n.toLocaleString("en-US")} EGP`;

  const counts = React.useMemo(() => {
    const keys: FacetKey[] = [
      "specialties",
      "certifications",
      "deliveries",
      "durations",
      "languages",
      "levels",
    ];
    return Object.fromEntries(
      keys.map((k) => [k, facetCounts(courses, value, k)]),
    ) as Record<FacetKey, Record<string, number>>;
  }, [courses, value]);

  const opts = (
    key: FacetKey,
    list: readonly { value: string; labelKey: string; hintKey?: string }[],
  ): Option[] =>
    list.map((o) => ({
      value: o.value,
      label: t(o.labelKey),
      hint: o.hintKey ? t(o.hintKey) : undefined,
      count: counts[key][o.value] ?? 0,
    }));

  const priceTouched = value.priceMin > 0 || value.priceMax < priceCeiling;

  return (
    <aside
      className={cn(
        // Sticky rails must fit the viewport or their tail is unreachable while
        // pinned; scroll internally instead of growing past the fold.
        "rounded-2xl border border-border/70 bg-card shadow-sm",
        "lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto",
        className,
      )}
    >
      <div className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-border/60 bg-card/95 px-4 py-3 backdrop-blur">
        <h3 className="font-heading text-sm font-bold">
          {t("catalogFiltersTitle")}
        </h3>
        {active && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 gap-1 px-2 text-xs text-muted-foreground"
            onClick={() => onChange(emptyCatalogFilters(priceCeiling))}
          >
            <X className="size-3.5" />
            {t("catalogFiltersClear")}
          </Button>
        )}
      </div>

      <div className="space-y-4 px-4 py-4">
        <FacetGroup
          label={t("filterCertification")}
          options={opts("certifications", CERT_OPTIONS)}
          selected={value.certifications}
          onToggle={(v) =>
            patch({ certifications: toggleValue(value.certifications, v) })
          }
        />
        <FacetGroup
          label={t("filterDelivery")}
          options={opts("deliveries", DELIVERY_OPTIONS)}
          selected={value.deliveries}
          onToggle={(v) =>
            patch({ deliveries: toggleValue(value.deliveries, v) })
          }
        />
        <FacetGroup
          label={t("filterDuration")}
          options={opts("durations", DURATION_OPTIONS)}
          selected={value.durations}
          onToggle={(v) =>
            patch({ durations: toggleValue(value.durations, v) })
          }
        />
        <FacetGroup
          label={t("filterLanguage")}
          options={opts("languages", LANGUAGE_FILTER_OPTIONS)}
          selected={value.languages}
          onToggle={(v) =>
            patch({ languages: toggleValue(value.languages, v) })
          }
          defaultOpen={false}
        />
        <FacetGroup
          label={t("filterLevel")}
          options={opts("levels", LEVEL_FILTER_OPTIONS)}
          selected={value.levels}
          onToggle={(v) => patch({ levels: toggleValue(value.levels, v) })}
          defaultOpen={false}
        />

        <div className="space-y-2.5 pt-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t("filterPrice")}
            </p>
            {priceTouched && (
              <button
                type="button"
                onClick={() => patch({ priceMin: 0, priceMax: priceCeiling })}
                className="text-[0.6875rem] font-medium text-primary hover:underline"
              >
                {t("catalogFiltersClear")}
              </button>
            )}
          </div>
          <p className="text-sm font-semibold tabular-nums">
            {priceTouched
              ? `${fmt(value.priceMin)} – ${fmt(value.priceMax)}`
              : t("filterPriceAny")}
          </p>

          <div className="relative h-8">
            <input
              type="range"
              min={0}
              max={priceCeiling}
              step={100}
              value={value.priceMin}
              onChange={(e) => {
                const next = Math.min(
                  Number(e.target.value),
                  value.priceMax - 100,
                );
                patch({ priceMin: Math.max(0, next) });
              }}
              className="pointer-events-none absolute inset-x-0 top-1/2 z-20 h-2 w-full -translate-y-1/2 appearance-none bg-transparent accent-primary [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:relative [&::-webkit-slider-thumb]:z-30 [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-primary"
              aria-label={t("filterPriceMin")}
            />
            <input
              type="range"
              min={0}
              max={priceCeiling}
              step={100}
              value={value.priceMax}
              onChange={(e) => {
                const next = Math.max(
                  Number(e.target.value),
                  value.priceMin + 100,
                );
                patch({ priceMax: Math.min(priceCeiling, next) });
              }}
              className="pointer-events-none absolute inset-x-0 top-1/2 z-20 h-2 w-full -translate-y-1/2 appearance-none bg-transparent accent-primary [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:relative [&::-webkit-slider-thumb]:z-30 [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-primary"
              aria-label={t("filterPriceMax")}
            />
            <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-muted">
              <div
                className="absolute h-full rounded-full bg-primary/70"
                style={{
                  left: `${(value.priceMin / priceCeiling) * 100}%`,
                  right: `${100 - (value.priceMax / priceCeiling) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
