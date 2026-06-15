/**
 * In-memory course store + CRUD. The seed matches the `CourseRow` view type the
 * admin table renders. `createCourse` accepts the full `CourseFormData` (the
 * shape produced by the Add-New-Course form) and projects it down to a row.
 */
import type { CourseFormData, CourseRow, Difficulty } from "@/types";
import { createId, deriveDiscount } from "@/lib/utils";
import { clone, delay, respond } from "./delay";

const COVER = (seed: string) =>
  `https://images.unsplash.com/${seed}?auto=format&fit=crop&w=480&q=70`;

let courses: CourseRow[] = [
  {
    id: "crs_fin_modeling",
    slug: "advanced-financial-modeling",
    titleEn: "Advanced Financial Modeling",
    titleAr: "النمذجة المالية المتقدمة",
    category: "Finance & Accounting",
    difficulty: "Advanced",
    priceEGP: 14000,
    salePriceEGP: 9900,
    students: 1284,
    lectures: 42,
    rating: 4.8,
    status: "published",
    isFeatured: true,
    isBestseller: true,
    isTopRated: true,
    thumbnailUrl: COVER("photo-1554224155-6726b3ff858f"),
    updatedAt: "2026-05-28T10:00:00.000Z",
  },
  {
    id: "crs_digital_marketing",
    slug: "digital-marketing-strategy",
    titleEn: "Digital Marketing Strategy",
    titleAr: "استراتيجية التسويق الرقمي",
    category: "Marketing & Sales",
    difficulty: "Intermediate",
    priceEGP: 8500,
    salePriceEGP: 6200,
    students: 2310,
    lectures: 36,
    rating: 4.7,
    status: "published",
    isFeatured: true,
    isBestseller: true,
    isTopRated: false,
    thumbnailUrl: COVER("photo-1460925895917-afdab827c52f"),
    updatedAt: "2026-06-01T09:30:00.000Z",
  },
  {
    id: "crs_pmp",
    slug: "pmp-certification-prep",
    titleEn: "PMP Certification Prep",
    titleAr: "التحضير لشهادة PMP",
    category: "Project Management",
    difficulty: "Advanced",
    priceEGP: 12000,
    salePriceEGP: 8400,
    students: 1750,
    lectures: 58,
    rating: 4.9,
    status: "published",
    isFeatured: false,
    isBestseller: true,
    isTopRated: true,
    thumbnailUrl: COVER("photo-1542626991-cbc4e32524cc"),
    updatedAt: "2026-05-20T14:10:00.000Z",
  },
  {
    id: "crs_leadership",
    slug: "executive-leadership-essentials",
    titleEn: "Executive Leadership Essentials",
    titleAr: "أساسيات القيادة التنفيذية",
    category: "Business & Management",
    difficulty: "Intermediate",
    priceEGP: 10500,
    salePriceEGP: 0,
    students: 940,
    lectures: 28,
    rating: 4.6,
    status: "published",
    isFeatured: true,
    isBestseller: false,
    isTopRated: false,
    thumbnailUrl: COVER("photo-1521737604893-d14cc237f11d"),
    updatedAt: "2026-06-05T08:00:00.000Z",
  },
  {
    id: "crs_data_analytics",
    slug: "business-data-analytics",
    titleEn: "Business Data Analytics",
    titleAr: "تحليلات بيانات الأعمال",
    category: "Business & Management",
    difficulty: "Beginner",
    priceEGP: 9000,
    salePriceEGP: 6900,
    students: 1620,
    lectures: 40,
    rating: 4.5,
    status: "draft",
    isFeatured: false,
    isBestseller: false,
    isTopRated: false,
    thumbnailUrl: COVER("photo-1551288049-bebda4e38f71"),
    updatedAt: "2026-06-08T16:45:00.000Z",
  },
  {
    id: "crs_hr",
    slug: "strategic-human-resources",
    titleEn: "Strategic Human Resources",
    titleAr: "الموارد البشرية الاستراتيجية",
    category: "Human Resources",
    difficulty: "Intermediate",
    priceEGP: 7800,
    salePriceEGP: 5500,
    students: 720,
    lectures: 24,
    rating: 4.4,
    status: "published",
    isFeatured: false,
    isBestseller: false,
    isTopRated: false,
    thumbnailUrl: COVER("photo-1573496359142-b8d87734a5a2"),
    updatedAt: "2026-05-30T11:20:00.000Z",
  },
  {
    id: "crs_agile",
    slug: "agile-scrum-mastery",
    titleEn: "Agile & Scrum Mastery",
    titleAr: "إتقان أجايل وسكرم",
    category: "Project Management",
    difficulty: "Beginner",
    priceEGP: 6500,
    salePriceEGP: 4900,
    students: 1380,
    lectures: 30,
    rating: 4.7,
    status: "published",
    isFeatured: false,
    isBestseller: true,
    isTopRated: false,
    thumbnailUrl: COVER("photo-1531403009284-440f080d1e12"),
    updatedAt: "2026-06-10T13:00:00.000Z",
  },
  {
    id: "crs_investment",
    slug: "investment-portfolio-management",
    titleEn: "Investment & Portfolio Management",
    titleAr: "إدارة الاستثمار والمحافظ",
    category: "Finance & Accounting",
    difficulty: "Advanced",
    priceEGP: 13500,
    salePriceEGP: 0,
    students: 610,
    lectures: 46,
    rating: 4.8,
    status: "draft",
    isFeatured: false,
    isBestseller: false,
    isTopRated: true,
    thumbnailUrl: COVER("photo-1611974789855-9c2a0a7236a3"),
    updatedAt: "2026-06-11T07:30:00.000Z",
  },
];

const CATEGORY_LABELS: Record<string, string> = {
  cat_business: "Business & Management",
  cat_finance: "Finance & Accounting",
  cat_marketing: "Marketing & Sales",
  cat_pm: "Project Management",
  cat_hr: "Human Resources",
};

export interface ListCoursesParams {
  search?: string;
  status?: "all" | "published" | "draft";
  category?: string;
}

export async function getCourses(
  params: ListCoursesParams = {},
): Promise<CourseRow[]> {
  await delay();
  let rows = clone(courses);

  if (params.search) {
    const q = params.search.toLowerCase();
    rows = rows.filter(
      (c) =>
        c.titleEn.toLowerCase().includes(q) ||
        c.titleAr.includes(params.search ?? "") ||
        c.category.toLowerCase().includes(q),
    );
  }
  if (params.status && params.status !== "all") {
    rows = rows.filter((c) => c.status === params.status);
  }
  if (params.category && params.category !== "all") {
    rows = rows.filter((c) => c.category === params.category);
  }
  return rows;
}

export async function getCourseById(id: string): Promise<CourseRow | null> {
  await delay(200);
  const found = courses.find((c) => c.id === id);
  return found ? clone(found) : null;
}

/** Project a full course form payload into the table row + persist it. */
export async function createCourse(
  data: CourseFormData,
): Promise<CourseRow> {
  await delay(500);
  const price = data.pricing?.egp?.price ?? data.priceEGP ?? 0;
  const salePrice = data.pricing?.egp?.salePrice ?? data.salePriceEGP ?? 0;

  const row: CourseRow = {
    id: createId("crs"),
    slug: data.slug,
    titleEn: data.titleEn,
    titleAr: data.titleAr,
    category: CATEGORY_LABELS[data.category] ?? data.category,
    difficulty: data.difficulty as Difficulty,
    priceEGP: price,
    salePriceEGP: salePrice,
    students: data.students ?? 0,
    lectures:
      data.lectures ??
      data.modules.reduce((acc, m) => acc + m.lessons.length, 0),
    rating: 0,
    status: data.status,
    isFeatured: data.isFeatured,
    isBestseller: data.isBestseller,
    isTopRated: data.isTopRated,
    thumbnailUrl: data.image || COVER("photo-1516321318423-f06f85e504b3"),
    updatedAt: new Date().toISOString(),
  };
  // discount is derived for any downstream consumers
  void deriveDiscount(price, salePrice);
  courses = [row, ...courses];
  return clone(row);
}

export async function updateCourse(
  id: string,
  patch: Partial<CourseRow>,
): Promise<CourseRow | null> {
  await delay(400);
  const idx = courses.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  courses[idx] = { ...courses[idx], ...patch, updatedAt: new Date().toISOString() };
  return clone(courses[idx]);
}

export async function deleteCourse(id: string): Promise<boolean> {
  await delay(300);
  const before = courses.length;
  courses = courses.filter((c) => c.id !== id);
  return courses.length < before;
}

function uniqueSlug(base: string): string {
  let slug = `${base}-copy`;
  let n = 2;
  while (courses.some((c) => c.slug === slug)) {
    slug = `${base}-copy-${n++}`;
  }
  return slug;
}

/** Clone a course as a new draft with zero enrollments. */
export async function duplicateCourse(id: string): Promise<CourseRow | null> {
  await delay(400);
  const source = courses.find((c) => c.id === id);
  if (!source) return null;

  const copy: CourseRow = {
    ...clone(source),
    id: createId("crs"),
    slug: uniqueSlug(source.slug),
    titleEn: `${source.titleEn} (Copy)`,
    titleAr: `${source.titleAr} (نسخة)`,
    status: "draft",
    students: 0,
    rating: 0,
    updatedAt: new Date().toISOString(),
  };
  courses = [copy, ...courses];
  return clone(copy);
}
