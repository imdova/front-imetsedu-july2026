import type { CourseRow } from "@/types";

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

function blob(c: CourseRow): string {
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

export function effectivePrice(c: CourseRow): number {
  if (c.salePriceEGP > 0 && c.salePriceEGP < c.priceEGP) return c.salePriceEGP;
  return c.priceEGP;
}

export function courseSpecialties(c: CourseRow): string[] {
  const b = blob(c);
  const out: string[] = [];
  if (/quality|cphq|naqh|nahq|accreditation|clinical governance/.test(b)) out.push("healthcare_quality");
  if (/infection|cic\b|ipc\b|steriliz/.test(b)) out.push("infection_control");
  if (/leadership|leader|management|hospital mgmt|executive/.test(b)) out.push("leadership");
  if (/patient safety|cpps|safety/.test(b)) out.push("patient_safety");
  return out;
}

export function courseCertifications(c: CourseRow): string[] {
  const b = blob(c);
  const out: string[] = [];
  if (/\bcphq\b/.test(b)) out.push("cphq");
  if (/\bcic\b/.test(b)) out.push("cic");
  if (/\bcpps\b/.test(b)) out.push("cpps");
  if (/\bjci\b|joint commission/.test(b)) out.push("jci");
  if (/\bhcqm\b|healthcare quality management/.test(b)) out.push("hcqm");
  return out;
}

export function courseDeliveries(c: CourseRow): string[] {
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
  if (/recorded|on-demand|self[- ]paced|asynchronous/.test(b)) out.add("recorded");
  if (/online|remote|virtual/.test(b)) out.add("online");
  // Public cards currently advertise live online by default
  if (out.size === 0) {
    out.add("online");
    out.add("live");
  }
  return [...out];
}

/** Normalize duration strings into filter buckets. */
export function courseDurationBuckets(c: CourseRow): string[] {
  const raw = (c.duration ?? "").toLowerCase().trim();
  const b = blob(c);
  const text = `${raw} ${b}`;
  const out = new Set<string>();

  const weeks =
    text.match(/(\d+)\s*(?:weeks?|أسابيع|اسبوع)/i) ??
    text.match(/(\d+)\s*w\b/i);
  const months =
    text.match(/(\d+)\s*(?:months?|أشهر|شهر)/i) ??
    text.match(/(\d+)\s*m\b/i);

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

export function courseLanguages(c: CourseRow): string[] {
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

function anyMatch(selected: string[], actual: string[]): boolean {
  if (!selected.length) return true;
  return selected.some((s) => actual.includes(s));
}

export interface CatalogFilterState {
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

export function catalogFiltersActive(f: CatalogFilterState, priceCeiling: number): boolean {
  return (
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

export function courseMatchesCatalogFilters(c: CourseRow, f: CatalogFilterState): boolean {
  if (!anyMatch(f.specialties, courseSpecialties(c))) return false;
  if (!anyMatch(f.certifications, courseCertifications(c))) return false;
  if (!anyMatch(f.deliveries, courseDeliveries(c))) return false;
  if (!anyMatch(f.durations, courseDurationBuckets(c))) return false;
  if (!anyMatch(f.languages, courseLanguages(c))) return false;
  if (f.levels.length && !f.levels.includes(c.difficulty)) return false;
  const price = effectivePrice(c);
  if (price < f.priceMin || price > f.priceMax) return false;
  return true;
}
