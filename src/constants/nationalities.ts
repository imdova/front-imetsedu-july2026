/** Nationality options for lead / student forms (MENA-first). Stored in the API `country` field. */
export interface NationalityOption {
  value: string;
  en: string;
  ar: string;
}

export const NATIONALITIES: NationalityOption[] = [
  { value: "Egyptian", en: "Egyptian", ar: "مصري" },
  { value: "Saudi", en: "Saudi", ar: "سعودي" },
  { value: "Emirati", en: "Emirati", ar: "إماراتي" },
  { value: "Qatari", en: "Qatari", ar: "قطري" },
  { value: "Kuwaiti", en: "Kuwaiti", ar: "كويتي" },
  { value: "Omani", en: "Omani", ar: "عُماني" },
  { value: "Bahraini", en: "Bahraini", ar: "بحريني" },
  { value: "Jordanian", en: "Jordanian", ar: "أردني" },
  { value: "Lebanese", en: "Lebanese", ar: "لبناني" },
  { value: "Iraqi", en: "Iraqi", ar: "عراقي" },
  { value: "Syrian", en: "Syrian", ar: "سوري" },
  { value: "Palestinian", en: "Palestinian", ar: "فلسطيني" },
  { value: "Yemeni", en: "Yemeni", ar: "يمني" },
  { value: "Sudanese", en: "Sudanese", ar: "سوداني" },
  { value: "Libyan", en: "Libyan", ar: "ليبي" },
  { value: "Tunisian", en: "Tunisian", ar: "تونسي" },
  { value: "Algerian", en: "Algerian", ar: "جزائري" },
  { value: "Moroccan", en: "Moroccan", ar: "مغربي" },
  { value: "Mauritanian", en: "Mauritanian", ar: "موريتاني" },
  { value: "Somali", en: "Somali", ar: "صومالي" },
  { value: "American", en: "American", ar: "أمريكي" },
  { value: "British", en: "British", ar: "بريطاني" },
  { value: "Canadian", en: "Canadian", ar: "كندي" },
  { value: "French", en: "French", ar: "فرنسي" },
  { value: "German", en: "German", ar: "ألماني" },
  { value: "Italian", en: "Italian", ar: "إيطالي" },
  { value: "Spanish", en: "Spanish", ar: "إسباني" },
  { value: "Dutch", en: "Dutch", ar: "هولندي" },
  { value: "Swedish", en: "Swedish", ar: "سويدي" },
  { value: "Turkish", en: "Turkish", ar: "تركي" },
  { value: "Iranian", en: "Iranian", ar: "إيراني" },
  { value: "Indian", en: "Indian", ar: "هندي" },
  { value: "Pakistani", en: "Pakistani", ar: "باكستاني" },
  { value: "Bangladeshi", en: "Bangladeshi", ar: "بنغلاديشي" },
  { value: "Filipino", en: "Filipino", ar: "فلبيني" },
  { value: "Indonesian", en: "Indonesian", ar: "إندونيسي" },
  { value: "Malaysian", en: "Malaysian", ar: "ماليزي" },
  { value: "Chinese", en: "Chinese", ar: "صيني" },
  { value: "Japanese", en: "Japanese", ar: "ياباني" },
  { value: "South Korean", en: "South Korean", ar: "كوري جنوبي" },
  { value: "Australian", en: "Australian", ar: "أسترالي" },
  { value: "New Zealander", en: "New Zealander", ar: "نيوزيلندي" },
  { value: "Nigerian", en: "Nigerian", ar: "نيجيري" },
  { value: "Kenyan", en: "Kenyan", ar: "كيني" },
  { value: "Ethiopian", en: "Ethiopian", ar: "إثيوبي" },
  { value: "Ghanaian", en: "Ghanaian", ar: "غاني" },
  { value: "South African", en: "South African", ar: "جنوب أفريقي" },
  { value: "Brazilian", en: "Brazilian", ar: "برازيلي" },
  { value: "Mexican", en: "Mexican", ar: "مكسيكي" },
  { value: "Russian", en: "Russian", ar: "روسي" },
  { value: "Ukrainian", en: "Ukrainian", ar: "أوكراني" },
  { value: "Greek", en: "Greek", ar: "يوناني" },
  { value: "Other", en: "Other", ar: "أخرى" },
];

const ISO_TO_NATIONALITY: Record<string, string> = {
  EG: "Egyptian",
  SA: "Saudi",
  AE: "Emirati",
  QA: "Qatari",
  KW: "Kuwaiti",
  OM: "Omani",
  BH: "Bahraini",
  JO: "Jordanian",
  LB: "Lebanese",
  IQ: "Iraqi",
  SD: "Sudanese",
  US: "American",
  GB: "British",
};

const COUNTRY_NAME_TO_NATIONALITY: Record<string, string> = {
  Egypt: "Egyptian",
  "Saudi Arabia": "Saudi",
  "United Arab Emirates": "Emirati",
  Qatar: "Qatari",
  Kuwait: "Kuwaiti",
  Oman: "Omani",
  Bahrain: "Bahraini",
  Jordan: "Jordanian",
  Lebanon: "Lebanese",
  Iraq: "Iraqi",
  Sudan: "Sudanese",
  "United States": "American",
  "United Kingdom": "British",
};

export function nationalityLabel(option: NationalityOption, locale: string): string {
  return locale === "ar" ? option.ar : option.en;
}

/** Map legacy ISO codes / country names to a nationality value for the dropdown. */
export function normalizeNationality(value?: string): string {
  if (!value) return "";
  if (NATIONALITIES.some((n) => n.value === value)) return value;
  const fromIso = ISO_TO_NATIONALITY[value.toUpperCase()];
  if (fromIso) return fromIso;
  const fromName = COUNTRY_NAME_TO_NATIONALITY[value];
  if (fromName) return fromName;
  return value;
}
