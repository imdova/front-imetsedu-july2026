/**
 * LMS Management mock data — the academy's online catalog: courses, curriculum
 * (modules → lessons/quizzes), assigned groups and per-course stats. Reached
 * via lib/dal/lms.ts only.
 */
import { respond, delay, clone } from "./delay";

export interface LmsCourse {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  createdAt: string;
  groups: number;
  enrollment: number;
  revenue: number;
  active: boolean;
  lessons: number;
}

export interface LmsStats {
  activeCourses: number;
  totalLessons: number;
  avgCompletion: number;
}

export type CurriculumItemType = "lesson" | "quiz";
export type VideoSource = "youtube" | "vdocipher";
export interface CurriculumItem {
  id: string;
  type: CurriculumItemType;
  title: string;
  videoSource?: VideoSource;
  videoUrl?: string;
}
export interface CurriculumModule {
  id: string;
  title: string;
  items: CurriculumItem[];
}

export type AssignedGroupStatus = "upcoming" | "active" | "completed";
export interface LmsAssignedGroup {
  id: string;
  name: string;
  code: string;
  intakePeriod: string;
  studentCount: number;
  avgProgress: number;
  status: AssignedGroupStatus;
}

export interface LmsMaterial {
  id: string;
  name: string;
  category: string;
  size: string;
  uploadDate: string;
  targetGroup: string;
}

export interface LmsCourseDetail extends LmsCourse {
  totalEnrolled: number;
  modules: CurriculumModule[];
  assignedGroups: LmsAssignedGroup[];
  /** Raw assigned group ids + enrolled student ids (joined in the page). */
  assignedGroupIds: string[];
  studentIds: string[];
  materials: LmsMaterial[];
  rating: number;
  ratingCount: number;
  avgProgress: number;
  quizPassRate: number;
}

const courses: LmsCourse[] = [
  { id: "lms_fm", name: "Financial Modeling Masterclass", category: "Finance & Accounting", subcategory: "Financial Modeling", createdAt: "Jun 13, 2026", groups: 3, enrollment: 412, revenue: 246000, active: true, lessons: 64 },
  { id: "lms_cphq", name: "CPHQ Preparation", category: "Healthcare", subcategory: "Healthcare Quality", createdAt: "Jun 13, 2026", groups: 2, enrollment: 318, revenue: 158400, active: true, lessons: 48 },
  { id: "lms_cic", name: "CIC Preparation", category: "Healthcare", subcategory: "Infection Control", createdAt: "Jun 10, 2026", groups: 1, enrollment: 0, revenue: 0, active: false, lessons: 0 },
];

const groupsByCourse: Record<string, LmsAssignedGroup[]> = {
  lms_fm: [
    { id: "g_g42", name: "cphq - g42", code: "#732168", intakePeriod: "Jun 2026 - Jun 2026", studentCount: 0, avgProgress: 0, status: "upcoming" },
  ],
};

export interface LmsCategory { id: string; name: string; createdAt: string; courses: number }
export interface LmsSubcategory extends LmsCategory { parentId: string; parentName: string }

const lmsCategories: LmsCategory[] = [
  { id: "lc_biz", name: "Business", createdAt: "6/10/2026", courses: 0 },
  { id: "lc_health", name: "Healthcare", createdAt: "6/6/2026", courses: 2 },
];

const lmsSubcategories: LmsSubcategory[] = [
  { id: "ls_hm", name: "Hospital Management", parentId: "lc_health", parentName: "Healthcare", createdAt: "6/10/2026", courses: 0 },
  { id: "ls_ic", name: "Infection Control", parentId: "lc_health", parentName: "Healthcare", createdAt: "6/10/2026", courses: 0 },
  { id: "ls_q", name: "Quality", parentId: "lc_health", parentName: "Healthcare", createdAt: "6/6/2026", courses: 2 },
];

export const getLmsCourses = () => respond(courses);
export const getLmsCategories = () => respond(lmsCategories);
export const getLmsSubcategories = () => respond(lmsSubcategories);

export async function getLmsStats(): Promise<LmsStats> {
  const active = courses.filter((c) => c.active);
  return respond({
    activeCourses: active.length,
    totalLessons: courses.reduce((s, c) => s + c.lessons, 0),
    avgCompletion: 0,
  });
}

export async function getLmsCourse(id: string): Promise<LmsCourseDetail | null> {
  await delay(200);
  const c = courses.find((x) => x.id === id);
  if (!c) return null;
  const modules: CurriculumModule[] = c.lessons > 0
    ? [{
        id: "mod_1",
        title: "Module 1",
        items: [{ id: "les_1", type: "lesson", title: "Lesson 1", videoSource: "youtube", videoUrl: "" }],
      }]
    : [];
  return clone({
    ...c,
    totalEnrolled: c.enrollment,
    modules,
    assignedGroups: groupsByCourse[c.id] ?? [],
    assignedGroupIds: [],
    studentIds: [],
    materials: [],
    rating: 0,
    ratingCount: 5,
    avgProgress: 0,
    quizPassRate: 0,
  });
}
