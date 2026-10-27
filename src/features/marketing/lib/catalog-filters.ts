import type { CourseRow } from "@/types";

/**
 * What the facet functions read. Deliberately a pick of the course record: the
 * description is only ever consulted here, on the server, to derive facets.
 */
export type FacetSource = Pick<
  CourseRow,
  | "titleEn"
  | "titleAr"
  | "slug"
  | "category"
  | "duration"
  | "languages"
  | "deliveryModes"
  | "tagLabels"
  | "headlineEn"
  | "descriptionEn"
>;

/** Facet values for one course, computed once on the server. */
export interface CourseFacets {
  specialties: string[];
  certifications: string[];
  deliveries: string[];
  durations: string[];
  languages: string[];
}

/**
 * The slice of a course the client-side filters need. `facets` carries the
 * answers the description-reading functions below used to compute in the browser.
 */
export interface FilterableCourse {
  category: string;
  categoryAr?: string;
  difficulty: string;
  priceEGP: number;
  salePriceEGP: number;
  facets: CourseFacets;
}

export const SPECIALTY_OPTIONS = [
  { value: "healthcare_quality", labelKey: "filterSpecialtyQuality" },
  { value: "infection_control", labelKey: "filterSpecialtyInfection" },
  { value: "leadership", labelKey: "filterSpecialtyLeadership" },
  { value: "patient_safety", labelKey: "filterSpecialtySafety" },
] as const;

export const CERT_OPTIONS = [
  { value: "cphq", labelKey: "filterCertCphq", hintKey: "certHintCphq" },
  { value: "cic", labelKey: "filterCertCic", hintKey: "certHintCic" },
  { value: "cpps", labelKey: "filterCertCpps", hintKey: "certHintCpps" },
  { value: "jci", labelKey: "filterCertJci", hintKey: "certHintJci" },
  { value: "hcqm", labelKey: "filterCertHcqm", hintKey: "certHintHcqm" },
] as const;

export const DELIVERY_OPTIONS = [
  { value: "online", labelKey: "filterDeliveryOnline" },
  { value: "live", labelKey: "filterDeliveryLive" },
  { value: "recorded", labelKey: "filterDeliveryRecorded" },
  { value: "hybrid", labelKey: "filterDeliveryHybrid" },
] as const;

export const DURATION_OPTIONS = [
  { value: "4w", labelKey: "filterDuration4w" },
  { value: "8w", labelKey: "filterDuration8w" },
  { value: "12w", labelKey: "filterDuration12w" },
  { value: "6m", labelKey: "filterDuration6m" },
] as const;

export const LANGUAGE_FILTER_OPTIONS = [
  { value: "english", labelKey: "filterLangEnglish" },
  { value: "arabic", labelKey: "filterLangArabic" },
  { value: "bilingual", labelKey: "filterLangBilingual" },
] as const;

export const LEVEL_FILTER_OPTIONS = [
  { value: "Beginner", labelKey: "filterLevelBeginner" },
  { value: "Intermediate", labelKey: "filterLevelIntermediate" },
  { value: "Advanced", labelKey: "filterLevelAdvanced" },
] as const;

function blob(c: FacetSource): string {
  return [
    c.titleEn,
    c.titleAr,
    c.slug,
    c.category,
    c.duration,
    ...(c.languages ?? []),
    ...(c.deliveryModes ?? []),
    ...(c.tagLabels ?? []),
    c.headlineEn,
    c.descriptionEn,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function effectivePrice(c: Pick<CourseRow, "priceEGP" | "salePriceEGP">): number {
  if (c.salePriceEGP > 0 && c.salePriceEGP < c.priceEGP) return c.salePriceEGP;
  return c.priceEGP;
}

export function courseSpecialties(c: FacetSource): string[] {
  const b = blob(c);
  const out: string[] = [];
  if (/quality|cphq|naqh|nahq|accreditation|clinical governance/.test(b))
    out.push("healthcare_quality");
  if (/infection|cic\b|ipc\b|steriliz/.test(b)) out.push("infection_control");
  if (/leadership|leader|management|hospital mgmt|executive/.test(b))
    out.push("leadership");
  if (/patient safety|cpps|safety/.test(b)) out.push("patient_safety");
  return out;
}

export function courseCertifications(c: FacetSource): string[] {
  const b = blob(c);
  const out: string[] = [];
  if (/\bcphq\b/.test(b)) out.push("cphq");
  if (/\bcic\b/.test(b)) out.push("cic");
  if (/\bcpps\b/.test(b)) out.push("cpps");
  if (/\bjci\b|joint commission/.test(b)) out.push("jci");
  if (/\bhcqm\b|healthcare quality management/.test(b)) out.push("hcqm");
  return out;
}

export function courseDeliveries(c: FacetSource): string[] {
  const explicit = (c.deliveryModes ?? []).map((d) => d.toLowerCase());
  const b = blob(c);
  const out = new Set<string>();
  for (const d of explicit) {
    if (d.includes("hybrid")) out.add("hybrid");
    else if (d.includes("live")) out.add("live");
    else if (d.includes("record")) out.add("recorded");
    else if (d.includes("online") || d.includes("zoom")) out.add("online");
    else if (d.includes("offline")) out.add("hybrid");
  }
  if (/hybrid|blended/.test(b)) out.add("hybrid");
  if (/live|zoom|instructor-led|instructor led/.test(b)) out.add("live");
  if (/recorded|on-demand|self[- ]paced|asynchronous/.test(b))
    out.add("recorded");
  if (/online|remote|virtual/.test(b)) out.add("online");
  // Public cards currently advertise live online by default
  if (out.size === 0) {
    out.add("online");
    out.add("live");
  }
  return [...out];
}

/** Normalize duration strings into filter buckets. */
export function courseDurationBuckets(c: FacetSource): string[] {
  const raw = (c.duration ?? "").toLowerCase().trim();
  const b = blob(c);
  const text = `${raw} ${b}`;
  const out = new Set<string>();

  const weeks =
    text.match(/(\d+)\s*(?:weeks?|أسابيع|اسبوع)/i) ??
    text.match(/(\d+)\s*w\b/i);
  const months =
    text.match(/(\d+)\s*(?:months?|أشهر|شهر)/i) ?? text.match(/(\d+)\s*m\b/i);

  if (weeks) {
    const n = Number(weeks[1]);
    if (n <= 5) out.add("4w");
    else if (n <= 9) out.add("8w");
    else out.add("12w");
  }
  if (months) {
    const n = Number(months[1]);
    if (n >= 5) out.add("6m");
    else if (n >= 3) out.add("12w");
    else out.add("8w");
  }

  if (/4\s*weeks?|4w/.test(text)) out.add("4w");
  if (/8\s*weeks?|8w/.test(text)) out.add("8w");
  if (/12\s*weeks?|12w|3\s*months?/.test(text)) out.add("12w");
  if (/6\s*months?|6m|semester/.test(text)) out.add("6m");

  return [...out];
}

export function courseLanguages(c: FacetSource): string[] {
  const langs = (c.languages ?? []).map((l) => l.toLowerCase());
  const out = new Set<string>();
  for (const l of langs) {
    if (l.includes("bilingual") || l.includes("both")) out.add("bilingual");
    else if (l.includes("arab") || l === "ar") out.add("arabic");
    else if (l.includes("english") || l === "en") out.add("english");
  }
  const b = blob(c);
  if (/bilingual|ثنائي/.test(b)) out.add("bilingual");
  if (/arabic|عربي/.test(b)) out.add("arabic");
  if (/english|إنجليز/.test(b)) out.add("english");
  // Catalog cards advertise bilingual delivery by default
  if (out.size === 0) out.add("bilingual");
  return [...out];
}

/** Run the facet functions once. Server-side only — it reads the description. */
export function computeFacets(c: FacetSource): CourseFacets {
  return {
    specialties: courseSpecialties(c),
    certifications: courseCertifications(c),
    deliveries: courseDeliveries(c),
    durations: courseDurationBuckets(c),
    languages: courseLanguages(c),
  };
}

function anyMatch(selected: string[], actual: string[]): boolean {
  if (!selected.length) return true;
  return selected.some((s) => actual.includes(s));
}

export interface CatalogFilterState {
  /** Course category, driven by the tab row. "" ⇒ All. Single-select by
   *  design: it's the top-level cut of the catalog, not a facet. */
  category: string;
  specialties: string[];
  certifications: string[];
  deliveries: string[];
  durations: string[];
  languages: string[];
  levels: string[];
  priceMin: number;
  priceMax: number;
}

export function emptyCatalogFilters(priceCeiling: number): CatalogFilterState {
  return {
    category: "",
    specialties: [],
    certifications: [],
    deliveries: [],
    durations: [],
    languages: [],
    levels: [],
    priceMin: 0,
    priceMax: priceCeiling,
  };
}

/**
 * Categories present in the catalog, with counts, ordered biggest first.
 * `value` is the English name — the stable key filters match on — while
 * `nameAr` carries the Arabic label for display.
 */
export function catalogCategories(
  courses: Pick<FilterableCourse, "category" | "categoryAr">[],
): { value: string; nameAr?: string; count: number }[] {
  const counts = new Map<string, { count: number; nameAr?: string }>();
  for (const c of courses) {
    const name = (c.category ?? "").trim();
    if (!name || name === "—") continue;
    const prev = counts.get(name);
    counts.set(name, {
      count: (prev?.count ?? 0) + 1,
      nameAr: prev?.nameAr ?? c.categoryAr,
    });
  }
  return [...counts.entries()]
    .map(([value, { count, nameAr }]) => ({ value, nameAr, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
}

export function catalogFiltersActive(
  f: CatalogFilterState,
  priceCeiling: number,
): boolean {
  return (
    f.category !== "" ||
    f.specialties.length > 0 ||
    f.certifications.length > 0 ||
    f.deliveries.length > 0 ||
    f.durations.length > 0 ||
    f.languages.length > 0 ||
    f.levels.length > 0 ||
    f.priceMin > 0 ||
    f.priceMax < priceCeiling
  );
}

/** Filter groups that behave as OR-facets (price and level are special-cased). */
export type FacetKey =
  | "specialties"
  | "certifications"
  | "deliveries"
  | "durations"
  | "languages"
  | "levels";

/** The values a course exposes for a given facet. */
export function courseFacetValues(c: FilterableCourse, key: FacetKey): string[] {
  switch (key) {
    case "specialties":
      return c.facets.specialties;
    case "certifications":
      return c.facets.certifications;
    case "deliveries":
      return c.facets.deliveries;
    case "durations":
      return c.facets.durations;
    case "languages":
      return c.facets.languages;
    case "levels":
      return [c.difficulty];
  }
}

/**
 * How many courses each option in `key` would return, given every OTHER active
 * filter. The group's own selection is deliberately ignored: options inside a
 * group are OR-ed, so counting with them applied would show "0" next to every
 * unpicked sibling the moment you pick one.
 *
 * Lets the UI show counts and disable dead ends instead of letting people click
 * their way into an empty result set.
 */
export function facetCounts(
  courses: FilterableCourse[],
  filters: CatalogFilterState,
  key: FacetKey,
): Record<string, number> {
  const base: CatalogFilterState = { ...filters, [key]: [] };
  const out: Record<string, number> = {};
  for (const c of courses) {
    if (!courseMatchesCatalogFilters(c, base)) continue;
    for (const v of courseFacetValues(c, key)) out[v] = (out[v] ?? 0) + 1;
  }
  return out;
}

export function courseMatchesCatalogFilters(
  c: FilterableCourse,
  f: CatalogFilterState,
): boolean {
  if (f.category && (c.category ?? "").trim() !== f.category) return false;
  if (!anyMatch(f.specialties, c.facets.specialties)) return false;
  if (!anyMatch(f.certifications, c.facets.certifications)) return false;
  if (!anyMatch(f.deliveries, c.facets.deliveries)) return false;
  if (!anyMatch(f.durations, c.facets.durations)) return false;
  if (!anyMatch(f.languages, c.facets.languages)) return false;
  if (f.levels.length && !f.levels.includes(c.difficulty)) return false;
  const price = effectivePrice(c);
  if (price < f.priceMin || price > f.priceMax) return false;
  return true;
}
