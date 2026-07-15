"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { SlidersHorizontal, X, SearchX } from "lucide-react";

import type { CourseRow, InstructorLookup } from "@/types";
import type { BlogPost } from "@/types/blog";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CourseCard } from "./course-card";
import { SmartSearchBox } from "./smart-search-box";
import { CourseCatalogFilters } from "./course-catalog-filters";
import { LearningPathsSection } from "./learning-paths-section";
import { CareerQuizCta } from "./career-quiz-cta";
import { courseMatchesSmartSearch } from "@/features/marketing/lib/smart-course-search";
import {
  catalogCategories,
  catalogFiltersActive,
  courseMatchesCatalogFilters,
  effectivePrice,
  emptyCatalogFilters,
  CERT_OPTIONS,
  DELIVERY_OPTIONS,
  DURATION_OPTIONS,
  LANGUAGE_FILTER_OPTIONS,
  LEVEL_FILTER_OPTIONS,
  type CatalogFilterState,
} from "@/features/marketing/lib/catalog-filters";

/** Filter categories that can be surfaced as removable chips. */
const CHIP_GROUPS = [
  { key: "certifications", options: CERT_OPTIONS },
  { key: "deliveries", options: DELIVERY_OPTIONS },
  { key: "durations", options: DURATION_OPTIONS },
  { key: "languages", options: LANGUAGE_FILTER_OPTIONS },
  { key: "levels", options: LEVEL_FILTER_OPTIONS },
] as const;

export function CourseCatalog({
  courses,
  instructors = [],
  articles = [],
}: {
  courses: CourseRow[];
  instructors?: InstructorLookup[];
  articles?: BlogPost[];
}) {
  const t = useTranslations("Marketing");
  const locale = useLocale();
  const [search, setSearch] = React.useState("");
  const [pickedCourseIds, setPickedCourseIds] = React.useState<string[] | null>(
    null,
  );
  const [mobileFiltersOpen, setMobileFiltersOpen] = React.useState(false);

  const priceCeiling = React.useMemo(() => {
    const max = Math.max(0, ...courses.map((c) => effectivePrice(c)));
    // Round up to a friendly slider ceiling
    return Math.max(5000, Math.ceil(max / 1000) * 1000);
  }, [courses]);

  const [raw, setFilters] = React.useState<CatalogFilterState>(() =>
    emptyCatalogFilters(priceCeiling),
  );

  // Clamp priceMax to the ceiling by deriving it rather than syncing it back
  // through an effect — the old effect setState'd on every ceiling change,
  // costing a second render pass on load for a value we can just compute.
  const filters = React.useMemo<CatalogFilterState>(
    () => ({
      ...raw,
      priceMax: raw.priceMax === 0 || raw.priceMax > priceCeiling ? priceCeiling : raw.priceMax,
    }),
    [raw, priceCeiling],
  );

  const filtersOn = catalogFiltersActive(filters, priceCeiling);

  // Tab counts respect every other active filter but ignore the tab selection
  // itself — otherwise picking a tab would zero out all its siblings.
  const categoryTabs = React.useMemo(() => {
    const pool = courses.filter((c) =>
      courseMatchesCatalogFilters(c, { ...filters, category: "" }),
    );
    return [
      { value: "", label: t("catalogCategoryAll"), count: pool.length },
      ...catalogCategories(pool).map((c) => ({
        value: c.value,
        // Filter on the English name, label in the reader's language.
        label: locale === "ar" ? c.nameAr || c.value : c.value,
        count: c.count,
      })),
    ];
  }, [courses, filters, t, locale]);

  const filtered = courses.filter((c) => {
    if (pickedCourseIds?.length) {
      if (!pickedCourseIds.includes(c.id)) return false;
    } else if (search.trim() && !courseMatchesSmartSearch(c, search)) {
      return false;
    }
    if (!courseMatchesCatalogFilters(c, filters)) return false;
    return true;
  });

  // Default to most popular — no UI sort control.
  const sorted = React.useMemo(() => {
    return [...filtered].sort(
      (a, b) => b.students - a.students || b.rating - a.rating,
    );
  }, [filtered]);

  // Active-filter chips (each removable) — search, price and every filter group.
  const chips: { id: string; label: string; onRemove: () => void }[] = [];
  if (search.trim())
    chips.push({
      id: "search",
      label: `“${search.trim()}”`,
      onRemove: () => setSearch(""),
    });
  if (pickedCourseIds?.length)
    chips.push({
      id: "picked",
      label: t("catalogSmartSelection"),
      onRemove: () => setPickedCourseIds(null),
    });
  for (const g of CHIP_GROUPS) {
    const selected = filters[g.key] as string[];
    for (const val of selected) {
      const opt = g.options.find((o) => o.value === val);
      chips.push({
        id: `${g.key}:${val}`,
        label: opt ? t(opt.labelKey) : val,
        onRemove: () =>
          setFilters((prev) => ({
            ...prev,
            [g.key]: (prev[g.key] as string[]).filter((v) => v !== val),
          })),
      });
    }
  }
  if (filters.priceMin > 0 || filters.priceMax < priceCeiling) {
    chips.push({
      id: "price",
      label: `${filters.priceMin.toLocaleString()} – ${filters.priceMax.toLocaleString()} EGP`,
      onRemove: () =>
        setFilters((prev) => ({
          ...prev,
          priceMin: 0,
          priceMax: priceCeiling,
        })),
    });
  }
  const clearAll = () => {
    setSearch("");
    setPickedCourseIds(null);
    setFilters(emptyCatalogFilters(priceCeiling));
  };

  const hideGuides =
    Boolean(search.trim()) || filtersOn || Boolean(pickedCourseIds?.length);

  return (
    <div className="space-y-12">
      {/* Core: the full searchable / filterable catalog */}
      <section id="all-programs" className="scroll-mt-24 space-y-5">
        <div className="grid items-center gap-4 lg:grid-cols-[264px_minmax(0,1fr)] xl:grid-cols-[288px_minmax(0,1fr)]">
          <h2 className="font-heading text-2xl font-bold tracking-tight text-[#0a2f7a]">
            {t("allProgramsTitle")}
          </h2>
          <SmartSearchBox
            value={search}
            onChange={setSearch}
            onPickCourses={setPickedCourseIds}
            courses={courses}
            instructors={instructors}
            articles={articles}
            className="w-full min-w-0"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-[264px_minmax(0,1fr)] lg:items-start xl:grid-cols-[288px_minmax(0,1fr)]">
          {/* Desktop rail. On mobile the same panel lives in the drawer below —
              rendering it inline there pushed every result off-screen. */}
          <CourseCatalogFilters
            value={filters}
            onChange={setFilters}
            priceCeiling={priceCeiling}
            courses={courses}
            className="hidden lg:sticky lg:top-24 lg:block"
          />

          <div className="min-w-0 space-y-4">
            {/* Mobile filters only — desktop uses the left rail. */}
            <div className="lg:hidden">
              <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                <SheetTrigger asChild>
                  <Button type="button" variant="outline" size="sm" className="gap-1.5">
                    <SlidersHorizontal className="size-4" />
                    {t("catalogFiltersTitle")}
                    {chips.length > 0 && (
                      <span className="grid size-5 place-items-center rounded-full bg-primary text-[0.65rem] font-bold text-primary-foreground">
                        {chips.length}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="gap-0 p-0">
                  <SheetHeader className="sr-only">
                    <SheetTitle>{t("catalogFiltersTitle")}</SheetTitle>
                  </SheetHeader>
                  <div className="min-h-0 flex-1 overflow-y-auto p-3">
                    <CourseCatalogFilters
                      value={filters}
                      onChange={setFilters}
                      priceCeiling={priceCeiling}
                      courses={courses}
                      className="border-0 shadow-none"
                    />
                  </div>
                  <SheetFooter className="flex-row gap-2 border-t bg-card p-3">
                    {filtersOn && (
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setFilters(emptyCatalogFilters(priceCeiling))}
                      >
                        {t("catalogFiltersClear")}
                      </Button>
                    )}
                    <Button className="flex-1" onClick={() => setMobileFiltersOpen(false)}>
                      {t("catalogShowResults", { n: sorted.length })}
                    </Button>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>

            {/* Category tabs — the top-level cut of the catalog, above the grid.
                Scrolls horizontally rather than wrapping so the row stays one
                line on narrow screens. */}
            {categoryTabs.length > 1 && (
              <div
                role="tablist"
                aria-label={t("catalogCategoriesLabel")}
                className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {categoryTabs.map((tab) => {
                  const on = filters.category === tab.value;
                  return (
                    <button
                      key={tab.value || "all"}
                      type="button"
                      role="tab"
                      aria-selected={on}
                      onClick={() => setFilters((p) => ({ ...p, category: tab.value }))}
                      className={cn(
                        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                        on
                          ? "border-primary bg-primary text-primary-foreground shadow-sm"
                          : "border-border bg-card text-foreground/80 hover:border-primary/50 hover:bg-primary/5 hover:text-foreground",
                      )}
                    >
                      {tab.label}
                      <span
                        className={cn(
                          "tabular-nums",
                          on ? "text-primary-foreground/70" : "text-muted-foreground/70",
                        )}
                      >
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Active-filter chips */}
            {chips.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {chips.map((ch) => (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={ch.onRemove}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    {ch.label}
                    <X className="size-3 text-muted-foreground" />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={clearAll}
                  className="ms-1 text-xs font-semibold text-primary hover:underline"
                >
                  {t("catalogFiltersClear")}
                </button>
              </div>
            )}

            {sorted.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {sorted.map((c) => (
                  <CourseCard key={c.id} course={c} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
                <SearchX className="size-10 text-muted-foreground/40" />
                <p className="font-medium">{t("noCoursesFound")}</p>
                {chips.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={clearAll}
                  >
                    <X className="size-4" />
                    {t("catalogFiltersClear")}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Guide: structured paths for the still-undecided */}
      {!hideGuides && <LearningPathsSection courses={courses} />}

      <CareerQuizCta courses={courses} />
    </div>
  );
}
