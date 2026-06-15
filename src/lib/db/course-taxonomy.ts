/**
 * Course taxonomy mock data — the four tabs of Course Settings: categories,
 * sub-categories, tags and course variables. Self-contained so the existing
 * lookups/admin category seeds stay untouched. UI reaches this via the DAL.
 */
import { respond } from "./delay";

export interface TaxonomyRow {
  id: string;
  nameEn: string;
  nameAr: string;
  rank: number;
  createdAt: string;
  createdTime: string;
  courses: number;
  active: boolean;
}

export interface CourseSubcategory extends TaxonomyRow {
  parentId: string;
  parentName: string;
  slug?: string;
}

const categories: TaxonomyRow[] = [
  { id: "cat_health", nameEn: "Healthcare", nameAr: "رعاية صحية", rank: 0, createdAt: "6/7/2026", createdTime: "10:59 PM", courses: 9, active: true },
  { id: "cat_tech", nameEn: "Technology and AI", nameAr: "تكنولوجيا وذكاء اصطناعي", rank: 0, createdAt: "6/7/2026", createdTime: "10:58 PM", courses: 0, active: true },
  { id: "cat_biz", nameEn: "Business Administration", nameAr: "إدارة الأعمال", rank: 0, createdAt: "6/6/2026", createdTime: "06:54 PM", courses: 1, active: true },
];

const subcategories: CourseSubcategory[] = [
  { id: "sub_hm", nameEn: "Healthcare Management", nameAr: "الإدارة الصحية", parentId: "cat_health", parentName: "Healthcare", rank: 0, createdAt: "6/8/2026", createdTime: "05:13 PM", courses: 5, active: true },
  { id: "sub_ic", nameEn: "Infection Control", nameAr: "مكافحة العدوى", parentId: "cat_health", parentName: "Healthcare", rank: 0, createdAt: "6/8/2026", createdTime: "05:13 PM", courses: 2, active: true },
  { id: "sub_hq", nameEn: "Healthcare Quality", nameAr: "إدارة الجودة الصحية", parentId: "cat_health", parentName: "Healthcare", rank: 1, createdAt: "6/6/2026", createdTime: "06:55 PM", courses: 3, active: true },
];

const tags: TaxonomyRow[] = [
  { id: "tag_demand", nameEn: "In-demand", nameAr: "مطلوب", rank: 0, createdAt: "6/6/2026", createdTime: "06:50 PM", courses: 6, active: true },
  { id: "tag_new", nameEn: "New", nameAr: "جديد", rank: 1, createdAt: "6/6/2026", createdTime: "06:51 PM", courses: 3, active: true },
  { id: "tag_bestseller", nameEn: "Bestseller", nameAr: "الأكثر مبيعًا", rank: 2, createdAt: "6/6/2026", createdTime: "06:52 PM", courses: 4, active: false },
];

/** Each option carries both an Arabic and an English label. */
export interface VariableOption {
  ar: string;
  en: string;
}
export interface CourseVariable {
  id: string;
  nameEn: string;
  nameAr: string;
  options: VariableOption[];
}

const variables: CourseVariable[] = [
  { id: "language", nameEn: "Language", nameAr: "اللغة", options: [
    { ar: "الإنجليزية", en: "English" }, { ar: "العربية", en: "Arabic" }, { ar: "ثنائي اللغة", en: "Bilingual" },
  ] },
  { id: "attendance", nameEn: "Attendance Mode", nameAr: "طريقة الحضور", options: [
    { ar: "أونلاين | زووم", en: "Online | Zoom" }, { ar: "أوفلاين", en: "Offline" },
  ] },
  { id: "program", nameEn: "Program type", nameAr: "نوع البرنامج", options: [
    { ar: "دبلومة", en: "Diploma" }, { ar: "شهادة", en: "Certificate" }, { ar: "ورشة عمل", en: "Workshop" }, { ar: "معسكر", en: "Bootcamp" },
  ] },
  { id: "difficulty", nameEn: "Difficulty Level", nameAr: "مستوى الصعوبة", options: [
    { ar: "مبتدئ", en: "Beginner" }, { ar: "متوسط", en: "Intermediate" }, { ar: "متقدم", en: "Advanced" },
  ] },
];

export const getCourseCategories = () => respond(categories);
export const getCourseSubcategories = () => respond(subcategories);
export const getCourseTags = () => respond(tags);
export const getCourseVariables = () => respond(variables);
