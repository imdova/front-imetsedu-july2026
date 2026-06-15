/**
 * Lookup seed data for dependent dropdowns and search-selects in the course
 * form: categories -> subcategories, instructors, and tags.
 */
import type { CategoryLookup, InstructorLookup, LookupItem } from "@/types";
import { respond } from "./delay";

export const categories: CategoryLookup[] = [
  {
    id: "cat_business",
    label: "Business & Management",
    labelAr: "إدارة الأعمال",
    subcategories: [
      { id: "sub_strategy", label: "Strategy", labelAr: "الاستراتيجية" },
      { id: "sub_leadership", label: "Leadership", labelAr: "القيادة" },
      { id: "sub_ops", label: "Operations", labelAr: "العمليات" },
    ],
  },
  {
    id: "cat_finance",
    label: "Finance & Accounting",
    labelAr: "المالية والمحاسبة",
    subcategories: [
      { id: "sub_fin_modeling", label: "Financial Modeling", labelAr: "النمذجة المالية" },
      { id: "sub_accounting", label: "Accounting", labelAr: "المحاسبة" },
      { id: "sub_investment", label: "Investment", labelAr: "الاستثمار" },
    ],
  },
  {
    id: "cat_marketing",
    label: "Marketing & Sales",
    labelAr: "التسويق والمبيعات",
    subcategories: [
      { id: "sub_digital", label: "Digital Marketing", labelAr: "التسويق الرقمي" },
      { id: "sub_brand", label: "Branding", labelAr: "العلامة التجارية" },
      { id: "sub_sales", label: "Sales", labelAr: "المبيعات" },
    ],
  },
  {
    id: "cat_pm",
    label: "Project Management",
    labelAr: "إدارة المشاريع",
    subcategories: [
      { id: "sub_agile", label: "Agile & Scrum", labelAr: "أجايل وسكرم" },
      { id: "sub_pmp", label: "PMP", labelAr: "PMP" },
    ],
  },
  {
    id: "cat_hr",
    label: "Human Resources",
    labelAr: "الموارد البشرية",
    subcategories: [
      { id: "sub_talent", label: "Talent Management", labelAr: "إدارة المواهب" },
      { id: "sub_orgdev", label: "Org Development", labelAr: "التطوير المؤسسي" },
    ],
  },
];

export const instructors: InstructorLookup[] = [
  { id: "ins_1", label: "Dr. Karim El-Sayed", title: "Finance, ex-EFG Hermes" },
  { id: "ins_2", label: "Mona Rashad", title: "CMO, Growth Strategist" },
  { id: "ins_3", label: "Tarek Mansour", title: "PMP, Agile Coach" },
  { id: "ins_4", label: "Dr. Layla Hassan", title: "Leadership & OD" },
  { id: "ins_5", label: "Omar Fathy", title: "Data & Analytics Lead" },
  { id: "ins_6", label: "Sara Adel", title: "HR Director" },
];

export const tags: LookupItem[] = [
  { id: "tag_inperson", label: "In-demand" },
  { id: "tag_career", label: "Career Switch" },
  { id: "tag_exec", label: "Executive" },
  { id: "tag_beginner", label: "Beginner Friendly" },
  { id: "tag_certified", label: "Certified" },
  { id: "tag_arabic", label: "Arabic" },
  { id: "tag_weekend", label: "Weekend" },
];

export const getCategories = () => respond(categories);
export const getInstructors = () => respond(instructors);
export const getTags = () => respond(tags);
