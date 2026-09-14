/**
 * Career Hub vocabularies, labelled in both languages.
 *
 * The codes mirror `career-hub.constants.ts` on the backend, which validates
 * them — a value added here and not there is rejected on save.
 */

type Labelled<T extends string = string> = { value: T; en: string; ar: string };

export const pick = (l: { en: string; ar: string } | undefined, locale: string, fallback = "") =>
  l ? (locale === "ar" ? l.ar : l.en) : fallback;

/* ── countries ── */

export const CAREER_COUNTRIES = [
  { value: "EG", en: "Egypt", ar: "مصر", flag: "🇪🇬", currency: "EGP" },
  { value: "SA", en: "Saudi Arabia", ar: "السعودية", flag: "🇸🇦", currency: "SAR" },
  { value: "AE", en: "United Arab Emirates", ar: "الإمارات", flag: "🇦🇪", currency: "AED" },
  { value: "KW", en: "Kuwait", ar: "الكويت", flag: "🇰🇼", currency: "KWD" },
  { value: "QA", en: "Qatar", ar: "قطر", flag: "🇶🇦", currency: "QAR" },
  { value: "OM", en: "Oman", ar: "عُمان", flag: "🇴🇲", currency: "OMR" },
  { value: "BH", en: "Bahrain", ar: "البحرين", flag: "🇧🇭", currency: "BHD" },
] as const;
export type CareerCountryCode = (typeof CAREER_COUNTRIES)[number]["value"];
export const countryOf = (code?: string) => CAREER_COUNTRIES.find((c) => c.value === code);

/* ── professions (stored as the English label, like the author form) ── */

export const CAREER_PROFESSIONS: Labelled[] = [
  { value: "Physician", en: "Physician", ar: "طبيب" },
  { value: "Nurse", en: "Nurse", ar: "ممرض / ممرضة" },
  { value: "Pharmacist", en: "Pharmacist", ar: "صيدلي" },
  { value: "Dentist", en: "Dentist", ar: "طبيب أسنان" },
  { value: "Allied health professional", en: "Allied health professional", ar: "أخصائي مهن صحية مساندة" },
  { value: "Quality & patient safety professional", en: "Quality & patient safety professional", ar: "أخصائي جودة وسلامة مرضى" },
  { value: "Infection prevention professional", en: "Infection prevention professional", ar: "أخصائي مكافحة عدوى" },
  { value: "Healthcare manager / administrator", en: "Healthcare manager / administrator", ar: "مدير / إداري رعاية صحية" },
  { value: "Academic / researcher", en: "Academic / researcher", ar: "أكاديمي / باحث" },
  { value: "Other", en: "Other", ar: "أخرى" },
];
export const professionOf = (v?: string) => CAREER_PROFESSIONS.find((p) => p.value === v);

/* ── tracks (areas of interest) ── */

export interface CareerTrack extends Labelled {
  /**
   * IMETS programmes that lead into the track. Only a hint for suggestions —
   * the page keeps the ones that are actually published.
   */
  courses: string[];
}

export const CAREER_TRACKS: CareerTrack[] = [
  { value: "quality", en: "Healthcare quality", ar: "جودة الرعاية الصحية", courses: ["cphq-preparation", "healthcare-quality-management-diploma"] },
  { value: "patient-safety", en: "Patient safety", ar: "سلامة المرضى", courses: ["cphq-preparation", "healthcare-quality-management-diploma"] },
  { value: "infection-control", en: "Infection prevention & control", ar: "مكافحة العدوى", courses: ["infection-control-diploma", "cic-preparation"] },
  { value: "accreditation", en: "Accreditation (JCI, CBAHI, GAHAR)", ar: "الاعتماد (JCI، سباهي، GAHAR)", courses: ["hospital-accreditation-diploma", "cphq-preparation"] },
  { value: "hospital-management", en: "Hospital management", ar: "إدارة المستشفيات", courses: ["hospital-management-diploma", "healthcare-strategic-management-diploma"] },
  { value: "hr", en: "Healthcare HR", ar: "الموارد البشرية الصحية", courses: ["healthcare-hr-management-diploma"] },
  { value: "supply-chain", en: "Supply chain & procurement", ar: "سلاسل الإمداد والمشتريات", courses: ["healthcare-supply-chain-diploma"] },
  { value: "marketing", en: "Healthcare marketing", ar: "التسويق الصحي", courses: ["healthcare-marketing-diploma"] },
  { value: "finance", en: "Healthcare finance", ar: "الإدارة المالية الصحية", courses: ["financial-management-course"] },
  { value: "clinical", en: "Clinical practice", ar: "الممارسة السريرية", courses: [] },
  { value: "pharmacy", en: "Pharmacy", ar: "الصيدلة", courses: [] },
  { value: "nursing", en: "Nursing", ar: "التمريض", courses: ["infection-control-diploma"] },
  { value: "medical-education", en: "Medical education & training", ar: "التعليم والتدريب الطبي", courses: [] },
];
export const trackOf = (v?: string) => CAREER_TRACKS.find((t) => t.value === v);

/* ── education, employment, salary ── */

export const EDUCATION_LEVELS: Labelled[] = [
  { value: "diploma", en: "Diploma", ar: "دبلوم" },
  { value: "bachelor", en: "Bachelor's degree", ar: "بكالوريوس" },
  { value: "master", en: "Master's degree", ar: "ماجستير" },
  { value: "doctorate", en: "Doctorate / fellowship", ar: "دكتوراه / زمالة" },
];
export const educationOf = (v?: string) => EDUCATION_LEVELS.find((e) => e.value === v);

export const EMPLOYMENT_TYPES: Labelled[] = [
  { value: "full_time", en: "Full-time", ar: "دوام كامل" },
  { value: "part_time", en: "Part-time", ar: "دوام جزئي" },
  { value: "contract", en: "Contract", ar: "عقد مؤقت" },
  { value: "locum", en: "Locum", ar: "بديل مؤقت" },
  { value: "remote", en: "Remote", ar: "عن بُعد" },
];
export const employmentOf = (v?: string) => EMPLOYMENT_TYPES.find((e) => e.value === v);

/** schema.org JobPosting `employmentType` values. */
export const SCHEMA_EMPLOYMENT: Record<string, string> = {
  full_time: "FULL_TIME",
  part_time: "PART_TIME",
  contract: "CONTRACTOR",
  locum: "TEMPORARY",
  remote: "FULL_TIME",
};

export const SALARY_CURRENCIES = ["EGP", "SAR", "AED", "KWD", "QAR", "OMR", "BHD", "USD"] as const;

export function formatSalary(
  job: { salaryMin?: number | null; salaryMax?: number | null; salaryCurrency?: string; salaryPeriod?: string },
  locale: string,
): string | null {
  if (job.salaryMin == null && job.salaryMax == null) return null;
  if (!job.salaryCurrency) return null;
  const nf = new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en", { maximumFractionDigits: 0 });
  const range =
    job.salaryMin != null && job.salaryMax != null && job.salaryMin !== job.salaryMax
      ? `${nf.format(job.salaryMin)}–${nf.format(job.salaryMax)}`
      : nf.format((job.salaryMin ?? job.salaryMax)!);
  const per = job.salaryPeriod === "year" ? (locale === "ar" ? "سنويًا" : "/ year") : locale === "ar" ? "شهريًا" : "/ month";
  return `${range} ${job.salaryCurrency} ${per}`;
}

export function formatDate(iso: string | null | undefined, locale: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(locale === "ar" ? "ar-EG" : "en", { day: "numeric", month: "short", year: "numeric" });
}
