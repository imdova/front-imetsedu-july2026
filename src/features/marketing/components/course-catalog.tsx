"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { SlidersHorizontal, ArrowDownUp, X, SearchX } from "lucide-react";

import type { CourseRow, InstructorLookup } from "@/types";
import type { BlogPost } from "@/types/blog";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { CourseCard } from "./course-card";
import { SmartSearchBox } from "./smart-search-box";
import { CourseCatalogFilters } from "./course-catalog-filters";
import { BrowseByCertification } from "./browse-by-certification";
import { LearningPathsSection } from "./learning-paths-section";
import { CareerQuizCta } from "./career-quiz-cta";
import { courseMatchesSmartSearch } from "@/features/marketing/lib/smart-course-search";
import {
  catalogFiltersActive,
  courseMatchesCatalogFilters,
  effectivePrice,
  emptyCatalogFilters,
  SPECIALTY_OPTIONS,
  CERT_OPTIONS,
  DELIVERY_OPTIONS,
  DURATION_OPTIONS,
  LANGUAGE_FILTER_OPTIONS,
  LEVEL_FILTER_OPTIONS,
  type CatalogFilterState,
} from "@/features/marketing/lib/catalog-filters";

const SORTS = ["popular", "rating", "priceAsc", "priceDesc", "newest"] as const;
type SortKey = (typeof SORTS)[number];

/** Filter categories that can be surfaced as removable chips. */
const CHIP_GROUPS = [
  { key: "specialties", options: SPECIALTY_OPTIONS },
  { key: "certifications", options: CERT_OPTIONS },
  { key: "deliveries", options: DELIVERY_OPTIONS },
  { key: "durations", options: DURATION_OPTIONS },
  { key: "languages", options: LANGUAGE_FILTER_OPTIONS },
  { key: "levels", options: LEVEL_FILTER_OPTIONS },
] as const;

const FEATURE_BADGES = [
  "featureMostPopular",
  "featureBestBeginners",
  "featureCareerBooster",
  "featureTopRated",
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
  const [search, setSearch] = React.useState("");
  const [pickedCourseIds, setPickedCourseIds] = React.useState<string[] | null>(null);
  const [sort, setSort] = React.useState<SortKey>("popular");
  const [mobileFiltersOpen, setMobileFiltersOpen] = React.useState(false);

  const priceCeiling = React.useMemo(() => {
    const max = Math.max(0, ...courses.map((c) => effectivePrice(c)));
    // Round up to a friendly slider ceiling
    return Math.max(5000, Math.ceil(max / 1000) * 1000);
  }, [courses]);

  const [filters, setFilters] = React.useState<CatalogFilterState>(() =>
    emptyCatalogFilters(priceCeiling),
  );

  // Keep priceMax in sync when catalog loads / ceiling changes
  React.useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      priceMax: prev.priceMax === 0 || prev.priceMax > priceCeiling ? priceCeiling : prev.priceMax,
    }));
  }, [priceCeiling]);

  const featured = React.useMemo(() => courses.slice(0, 4), [courses]);
  const filtersOn = catalogFiltersActive(filters, priceCeiling);

  const filtered = courses.filter((c) => {
    if (pickedCourseIds?.length) {
      if (!pickedCourseIds.includes(c.id)) return false;
    } else if (search.trim() && !courseMatchesSmartSearch(c, search)) {
      return false;
    }
    if (!courseMatchesCatalogFilters(c, filters)) return false;
    return true;
  });

  // Sorted view of the filtered results.
  const sorted = React.useMemo(() => {
    const time = (c: CourseRow) => new Date(c.updatedAt).getTime() || 0;
    const arr = [...filtered];
    switch (sort) {
      case "rating": return arr.sort((a, b) => b.rating - a.rating || b.students - a.students);
      case "priceAsc": return arr.sort((a, b) => effectivePrice(a) - effectivePrice(b));
      case "priceDesc": return arr.sort((a, b) => effectivePrice(b) - effectivePrice(a));
      case "newest": return arr.sort((a, b) => time(b) - time(a));
      default: return arr.sort((a, b) => b.students - a.students || b.rating - a.rating); // popular
    }
  }, [filtered, sort]);

  // Active-filter chips (each removable) — search, price and every filter group.
  const chips: { id: string; label: string; onRemove: () => void }[] = [];
  if (search.trim()) chips.push({ id: "search", label: `“${search.trim()}”`, onRemove: () => setSearch("") });
  if (pickedCourseIds?.length) chips.push({ id: "picked", label: t("catalogSmartSelection"), onRemove: () => setPickedCourseIds(null) });
  for (const g of CHIP_GROUPS) {
    const selected = filters[g.key] as string[];
    for (const val of selected) {
      const opt = g.options.find((o) => o.value === val);
      chips.push({
        id: `${g.key}:${val}`,
        label: opt ? t(opt.labelKey) : val,
        onRemove: () => setFilters((prev) => ({ ...prev, [g.key]: (prev[g.key] as string[]).filter((v) => v !== val) })),
      });
    }
  }
  if (filters.priceMin > 0 || filters.priceMax < priceCeiling) {
    chips.push({
      id: "price",
      label: `${filters.priceMin.toLocaleString()} – ${filters.priceMax.toLocaleString()} EGP`,
      onRemove: () => setFilters((prev) => ({ ...prev, priceMin: 0, priceMax: priceCeiling })),
    });
  }
  const clearAll = () => { setSearch(""); setPickedCourseIds(null); setFilters(emptyCatalogFilters(priceCeiling)); };

  const SORT_LABEL: Record<SortKey, string> = {
    popular: t("catalogSortPopular"),
    rating: t("catalogSortRating"),
    priceAsc: t("catalogSortPriceAsc"),
    priceDesc: t("catalogSortPriceDesc"),
    newest: t("catalogSortNewest"),
  };

  const hideFeatured = Boolean(search.trim()) || filtersOn || Boolean(pickedCourseIds?.length);

  const onPickCertification = (value: string) => {
    setPickedCourseIds(null);
    setSearch("");
    setFilters((prev) => ({
      ...prev,
      certifications: prev.certifications.includes(value) ? [] : [value],
    }));
  };

  return (
    <div className="space-y-12">
      {/* Orient: pick a certification track first */}
      <BrowseByCertification
        selected={filters.certifications}
        onSelect={onPickCertification}
      />

      {featured.length > 0 && !hideFeatured && (
        <section className="space-y-5">
          <div>
            <h2 className="font-heading text-2xl font-bold tracking-tight text-[#0a2f7a]">
              {t("featuredSectionTitle")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{t("featuredSectionSubtitle")}</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((c, i) => (
              <div key={c.id} className="flex flex-col gap-2.5">
                <p className="text-sm font-bold text-[#0a2f7a]">
                  {t(FEATURE_BADGES[i] ?? "featureTopRated")}
                </p>
                <CourseCard course={c} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Core: the full searchable / filterable catalog */}
      <section className="space-y-5">
        <div>
          <h2 className="font-heading text-2xl font-bold tracking-tight text-[#0a2f7a]">
            {t("allProgramsTitle")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("allProgramsSubtitle")}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start xl:grid-cols-[280px_minmax(0,1fr)]">
          <CourseCatalogFilters
            value={filters}
            onChange={setFilters}
            priceCeiling={priceCeiling}
            className={cn("lg:sticky lg:top-24 lg:block", mobileFiltersOpen ? "block" : "hidden")}
          />

          <div className="min-w-0 space-y-4">
            <SmartSearchBox
              value={search}
              onChange={setSearch}
              onPickCourses={setPickedCourseIds}
              courses={courses}
              instructors={instructors}
              articles={articles}
            />

            {/* Toolbar: count + mobile filters toggle + sort */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5 lg:hidden"
                  onClick={() => setMobileFiltersOpen((o) => !o)}
                >
                  <SlidersHorizontal className="size-4" />
                  {t("catalogFiltersTitle")}
                  {chips.length > 0 && (
                    <span className="grid size-5 place-items-center rounded-full bg-[#0b3fa8] text-[0.65rem] font-bold text-white">
                      {chips.length}
                    </span>
                  )}
                </Button>
                <p className="text-sm text-muted-foreground">
                  {t("catalogResultsCount", { n: sorted.length })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <ArrowDownUp className="size-4 shrink-0 text-muted-foreground" />
                <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
                  <SelectTrigger className="h-9 w-[170px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SORTS.map((s) => (
                      <SelectItem key={s} value={s}>{SORT_LABEL[s]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

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
                <button type="button" onClick={clearAll} className="ms-1 text-xs font-semibold text-[#0b3fa8] hover:underline">
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
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={clearAll}>
                    <X className="size-4" />{t("catalogFiltersClear")}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Guide: structured paths for the still-undecided */}
      {!hideFeatured && <LearningPathsSection courses={courses} />}

      <CareerQuizCta courses={courses} />
    </div>
  );
}
