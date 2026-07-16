/**
 * Shipping destinations for certificate dispatch: the 22 Arab League states and
 * their first-level administrative divisions.
 *
 * Country names/flags are derived from `@/constants/countries` rather than
 * redeclared, so there is exactly one spelling of "United Arab Emirates" in the
 * app. Only the code list and the division names live here.
 *
 * Ordering is deliberate: Egypt first (home market and the form default), then
 * the GCC, the Levant, and the rest of the league — not alphabetical, because
 * the list is a pick-list for staff, not a reference table.
 */
import { countries } from "@/constants/countries";

export interface Courier {
  value: string;
  label: string;
}

/** Carriers IMETS ships with. Values match the backend `ShipmentCourier` enum. */
export const COURIERS: Courier[] = [
  { value: "aramex", label: "Aramex" },
  { value: "dhl", label: "DHL" },
  { value: "egypt-post", label: "Egypt Post" },
];

export const DEFAULT_COURIER = "aramex";
export const DEFAULT_COUNTRY = "EG";

/** Arab League member states, in pick-list order (Egypt first). */
export const ARAB_COUNTRY_CODES = [
  "EG", "SA", "AE", "KW", "QA", "BH", "OM",
  "JO", "LB", "PS", "SY", "IQ", "YE",
  "SD", "LY", "TN", "DZ", "MA", "MR", "SO", "DJ", "KM",
] as const;

export type ArabCountryCode = (typeof ARAB_COUNTRY_CODES)[number];

/**
 * First-level divisions per country: governorates (EG, JO, LB, SY, PS, YE, TN…),
 * emirates (AE), regions (SA, OM, MA), wilayas (DZ, MR), districts (KM) and
 * so on. Names are the common English transliterations staff will recognise.
 */
export const STATES_BY_COUNTRY: Record<string, string[]> = {
  EG: [
    "Cairo", "Giza", "Alexandria", "Qalyubia", "Port Said", "Suez", "Damietta",
    "Dakahlia", "Sharqia", "Gharbia", "Monufia", "Beheira", "Kafr El Sheikh",
    "Ismailia", "Faiyum", "Beni Suef", "Minya", "Asyut", "Sohag", "Qena",
    "Luxor", "Aswan", "Red Sea", "New Valley", "Matrouh", "North Sinai", "South Sinai",
  ],
  SA: [
    "Riyadh", "Makkah", "Madinah", "Eastern Province", "Asir", "Tabuk", "Hail",
    "Northern Borders", "Jazan", "Najran", "Al Bahah", "Al Jouf", "Qassim",
  ],
  AE: ["Abu Dhabi", "Dubai", "Sharjah", "Ajman", "Umm Al Quwain", "Ras Al Khaimah", "Fujairah"],
  KW: ["Al Asimah", "Hawalli", "Farwaniya", "Mubarak Al-Kabeer", "Ahmadi", "Jahra"],
  QA: ["Doha", "Al Rayyan", "Al Wakrah", "Al Khor", "Al Shamal", "Al Daayen", "Umm Salal", "Al Shahaniya"],
  BH: ["Capital", "Muharraq", "Northern", "Southern"],
  OM: [
    "Muscat", "Dhofar", "Musandam", "Al Buraimi", "Ad Dakhiliyah", "Al Batinah North",
    "Al Batinah South", "Ash Sharqiyah North", "Ash Sharqiyah South", "Ad Dhahirah", "Al Wusta",
  ],
  JO: [
    "Amman", "Irbid", "Zarqa", "Balqa", "Madaba", "Mafraq", "Jerash", "Ajloun",
    "Karak", "Tafilah", "Ma'an", "Aqaba",
  ],
  LB: ["Beirut", "Mount Lebanon", "North", "Akkar", "Beqaa", "Baalbek-Hermel", "South", "Nabatieh"],
  PS: [
    "Jerusalem", "Ramallah and Al-Bireh", "Bethlehem", "Hebron", "Nablus", "Jenin",
    "Tulkarm", "Qalqilya", "Salfit", "Tubas", "Jericho", "Gaza", "North Gaza",
    "Deir al-Balah", "Khan Yunis", "Rafah",
  ],
  SY: [
    "Damascus", "Rif Dimashq", "Aleppo", "Homs", "Hama", "Latakia", "Tartus",
    "Idlib", "Deir ez-Zor", "Raqqa", "Hasakah", "Daraa", "As-Suwayda", "Quneitra",
  ],
  IQ: [
    "Baghdad", "Basra", "Nineveh", "Erbil", "Sulaymaniyah", "Duhok", "Kirkuk",
    "Anbar", "Babil", "Diyala", "Karbala", "Maysan", "Muthanna", "Najaf",
    "Dhi Qar", "Salah al-Din", "Wasit", "Halabja",
  ],
  YE: [
    "Sana'a", "Aden", "Taiz", "Hodeidah", "Ibb", "Hadhramaut", "Dhamar", "Hajjah",
    "Al Mahwit", "Amran", "Lahij", "Abyan", "Shabwah", "Al Bayda", "Al Dhale'e",
    "Al Jawf", "Marib", "Raymah", "Sa'dah", "Socotra", "Al Mahrah",
  ],
  SD: [
    "Khartoum", "Gezira", "White Nile", "Blue Nile", "Northern", "River Nile",
    "Kassala", "Gedaref", "Red Sea", "Sennar", "North Kordofan", "South Kordofan",
    "West Kordofan", "North Darfur", "South Darfur", "West Darfur", "East Darfur", "Central Darfur",
  ],
  LY: [
    "Tripoli", "Benghazi", "Misrata", "Zawiya", "Sabha", "Sirte", "Tobruk",
    "Al Bayda", "Derna", "Ajdabiya", "Zliten", "Khoms", "Gharyan", "Nalut",
    "Ghat", "Murzuq", "Ubari", "Jufra", "Kufra", "Bani Walid", "Sabratha", "Zuwara",
  ],
  TN: [
    "Tunis", "Ariana", "Ben Arous", "Manouba", "Nabeul", "Zaghouan", "Bizerte",
    "Béja", "Jendouba", "Kef", "Siliana", "Sousse", "Monastir", "Mahdia",
    "Sfax", "Kairouan", "Kasserine", "Sidi Bouzid", "Gabès", "Medenine",
    "Tataouine", "Gafsa", "Tozeur", "Kebili",
  ],
  DZ: [
    "Algiers", "Oran", "Constantine", "Annaba", "Blida", "Batna", "Sétif", "Djelfa",
    "Sidi Bel Abbès", "Biskra", "Tébessa", "Tlemcen", "Béjaïa", "Tizi Ouzou",
    "Skikda", "Chlef", "Mostaganem", "Bordj Bou Arréridj", "Médéa", "Tiaret",
    "Béchar", "Ouargla", "Ghardaïa", "Laghouat", "M'Sila", "Mascara", "Jijel",
    "Relizane", "Guelma", "Aïn Defla", "Boumerdès", "Bouira", "El Oued", "Khenchela",
    "Souk Ahras", "Tipaza", "Mila", "Naâma", "Aïn Témouchent", "Tissemsilt",
    "El Bayadh", "Tindouf", "Adrar", "Illizi", "Tamanrasset", "El Tarf", "Saïda",
    "Oum El Bouaghi", "Timimoun", "Bordj Badji Mokhtar", "Ouled Djellal",
    "Béni Abbès", "In Salah", "In Guezzam", "Touggourt", "Djanet", "El M'Ghair", "El Meniaa",
  ],
  MA: [
    "Casablanca-Settat", "Rabat-Salé-Kénitra", "Marrakesh-Safi", "Fès-Meknès",
    "Tangier-Tetouan-Al Hoceima", "Oriental", "Béni Mellal-Khénifra", "Souss-Massa",
    "Drâa-Tafilalet", "Guelmim-Oued Noun", "Laâyoune-Sakia El Hamra", "Dakhla-Oued Ed-Dahab",
  ],
  MR: [
    "Nouakchott-Nord", "Nouakchott-Ouest", "Nouakchott-Sud", "Adrar", "Assaba",
    "Brakna", "Dakhlet Nouadhibou", "Gorgol", "Guidimaka", "Hodh Ech Chargui",
    "Hodh El Gharbi", "Inchiri", "Tagant", "Tiris Zemmour", "Trarza",
  ],
  SO: [
    "Banaadir", "Woqooyi Galbeed", "Bari", "Bay", "Togdheer", "Lower Shabelle",
    "Middle Shabelle", "Lower Juba", "Middle Juba", "Gedo", "Hiiraan", "Galguduud",
    "Mudug", "Nugal", "Sanaag", "Sool", "Awdal", "Bakool",
  ],
  DJ: ["Djibouti", "Ali Sabieh", "Arta", "Dikhil", "Obock", "Tadjourah"],
  KM: ["Grande Comore", "Anjouan", "Mohéli"],
};

/** Arab League countries as pick-list options, Egypt first. */
export const ARAB_COUNTRIES = ARAB_COUNTRY_CODES.map((code) => {
  const c = countries.find((x) => x.code === code);
  return { code, name: c?.name ?? code, flag: c?.flag ?? "" };
});

/** Display name for a stored country code (falls back to the raw code). */
export const countryName = (code: string): string =>
  ARAB_COUNTRIES.find((c) => c.code === code)?.name ?? code;

/** Display label for a stored courier value (falls back to the raw value). */
export const courierLabel = (value: string): string =>
  COURIERS.find((c) => c.value === value)?.label ?? value;

/** Divisions for a country code; empty when we have no list for it. */
export const statesFor = (code: string): string[] => STATES_BY_COUNTRY[code] ?? [];

/** Partner hospitals staff often ship certificates to — pre-fills country & state. */
export interface ShipmentPartnerPreset {
  recipient: string;
  country: ArabCountryCode;
  state: string;
}

export const SHIPMENT_PARTNER_PRESETS: ShipmentPartnerPreset[] = [
  { recipient: "King Faisal Specialist Hospital", country: "SA", state: "Riyadh" },
  { recipient: "Cleveland Clinic Abu Dhabi", country: "AE", state: "Abu Dhabi" },
  { recipient: "Jordan University Hospital", country: "JO", state: "Amman" },
  { recipient: "Mediclinic Middle East", country: "AE", state: "Dubai" },
];
