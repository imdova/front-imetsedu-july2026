/**
 * Student-portal seed: enrolled courses (with a lesson structure for the player),
 * schedule events, grades/transcript, certificates, notifications, billing and a
 * sample timed quiz. Covers FR-STU-1..7 + assessment.
 */
import { respond, delay, clone } from "./delay";

export type LessonType = "video" | "pdf" | "quiz" | "text";
export interface Lesson {
  id: string;
  title: string;
  type: LessonType;
  duration: string;
  completed: boolean;
  videoId?: string;
}
export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}
export interface EnrolledCourse {
  id: string;
  slug: string;
  title: string;
  titleAr: string;
  instructor: string;
  thumbnailUrl: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  modules: Module[];
  category?: string;
  subcategory?: string;
  isFavorite?: boolean;
  materials?: CourseMaterial[];
}

export interface CourseMaterial {
  id: string;
  title: string;
  url: string;
}

export type EventKind = "live-class" | "deadline" | "exam" | "office-hours" | "workshop";
export interface ScheduleEvent {
  id: string;
  title: string;
  kind: EventKind;
  day: string;
  time: string;
  courseCode: string;
  instructor?: string;
  joinUrl?: string;
}

export interface Grade {
  id: string;
  course: string;
  item: string;
  type: "quiz" | "assignment" | "exam";
  score: number;
  max: number;
  status: "graded" | "submitted" | "pending";
  date: string;
}

export interface Certificate {
  id: string;
  code: string;
  course: string;
  issuedAt: string;
  /** Downloadable certificate file URL, when issued. */
  link?: string;
}

export type NotificationType = "grade" | "deadline" | "content" | "announce" | "cert" | "payment";
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  createdAt: string;
  read: boolean;
}

export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
}
export interface Quiz {
  id: string;
  title: string;
  durationMin: number;
  questions: QuizQuestion[];
}

const COVER = (s: string) => `https://images.unsplash.com/${s}?auto=format&fit=crop&w=480&q=70`;

function makeModules(prefix: string, completedCount: number): { modules: Module[]; total: number; done: number } {
  const titles = ["Foundations", "Core Concepts", "Applied Practice", "Capstone"];
  let idx = 0;
  let done = 0;
  const modules = titles.map((mt, m) => ({
    id: `${prefix}-m${m}`,
    title: `Module ${m + 1}: ${mt}`,
    lessons: Array.from({ length: 4 }, (_, l) => {
      idx++;
      const completed = idx <= completedCount;
      if (completed) done++;
      const type: LessonType = l === 3 ? "quiz" : l === 2 ? "pdf" : "video";
      return {
        id: `${prefix}-l${m}-${l}`,
        title: `${type === "quiz" ? "Quiz" : type === "pdf" ? "Reading" : "Lesson"} ${m + 1}.${l + 1}`,
        type,
        duration: type === "video" ? `${8 + l * 3} min` : type === "quiz" ? "10 min" : "5 min",
        completed,
        videoId: type === "video" ? "demo-video-id" : undefined,
      };
    }),
  }));
  return { modules, total: idx, done };
}

const enrolled: EnrolledCourse[] = [
  { slug: "advanced-financial-modeling", title: "Advanced Financial Modeling", titleAr: "النمذجة المالية المتقدمة", instructor: "Dr. Karim El-Sayed", img: "photo-1554224155-6726b3ff858f", completedCount: 10 },
  { slug: "digital-marketing-strategy", title: "Digital Marketing Strategy", titleAr: "استراتيجية التسويق الرقمي", instructor: "Mona Rashad", img: "photo-1460925895917-afdab827c52f", completedCount: 6 },
  { slug: "pmp-certification-prep", title: "PMP Certification Prep", titleAr: "التحضير لشهادة PMP", instructor: "Tarek Mansour", img: "photo-1542626991-cbc4e32524cc", completedCount: 14 },
  { slug: "strategic-human-resources", title: "Strategic Human Resources", titleAr: "الموارد البشرية الاستراتيجية", instructor: "Sara Adel", img: "photo-1573496359142-b8d87734a5a2", completedCount: 2 },
].map((c, i) => {
  const { modules, total, done } = makeModules(`crs${i}`, c.completedCount);
  return {
    id: `enr_${i}`,
    slug: c.slug,
    title: c.title,
    titleAr: c.titleAr,
    instructor: c.instructor,
    thumbnailUrl: COVER(c.img),
    progress: Math.round((done / total) * 100),
    totalLessons: total,
    completedLessons: done,
    modules,
  };
});

const schedule: ScheduleEvent[] = [
  { id: "ev1", title: "Live: Valuation Deep-Dive", kind: "live-class", day: "Mon", time: "18:00", courseCode: "FIN", instructor: "Dr. Karim El-Sayed", joinUrl: "#" },
  { id: "ev2", title: "Assignment 3 due", kind: "deadline", day: "Tue", time: "23:59", courseCode: "MKT" },
  { id: "ev3", title: "Mid-term Exam", kind: "exam", day: "Wed", time: "16:00", courseCode: "PMP" },
  { id: "ev4", title: "Office Hours", kind: "office-hours", day: "Thu", time: "15:00", courseCode: "HR", instructor: "Sara Adel", joinUrl: "#" },
  { id: "ev5", title: "Workshop: Excel for Finance", kind: "workshop", day: "Sat", time: "11:00", courseCode: "FIN", joinUrl: "#" },
  { id: "ev6", title: "Live: Campaign Analytics", kind: "live-class", day: "Sun", time: "19:00", courseCode: "MKT", instructor: "Mona Rashad", joinUrl: "#" },
];

const grades: Grade[] = [
  { id: "g1", course: "Advanced Financial Modeling", item: "Quiz 1.4", type: "quiz", score: 9, max: 10, status: "graded", date: "2 days ago" },
  { id: "g2", course: "Advanced Financial Modeling", item: "Assignment 1", type: "assignment", score: 88, max: 100, status: "graded", date: "1 week ago" },
  { id: "g3", course: "PMP Certification Prep", item: "Quiz 2.4", type: "quiz", score: 8, max: 10, status: "graded", date: "3 days ago" },
  { id: "g4", course: "Digital Marketing Strategy", item: "Assignment 2", type: "assignment", score: 0, max: 100, status: "submitted", date: "yesterday" },
  { id: "g5", course: "PMP Certification Prep", item: "Mid-term", type: "exam", score: 0, max: 100, status: "pending", date: "in 3 days" },
  { id: "g6", course: "Strategic Human Resources", item: "Quiz 1.4", type: "quiz", score: 7, max: 10, status: "graded", date: "5 days ago" },
];

const certificates: Certificate[] = [
  { id: "c1", code: "IMETS-2026-AB12CD", course: "Business Data Analytics", issuedAt: "2026-03-12" },
  { id: "c2", code: "IMETS-2026-EF34GH", course: "Executive Leadership Essentials", issuedAt: "2026-01-28" },
];

let notifications: Notification[] = [
  { id: "n1", type: "grade", title: "New grade posted", description: "Quiz 1.4 — Advanced Financial Modeling: 9/10", createdAt: "2h ago", read: false },
  { id: "n2", type: "deadline", title: "Assignment due soon", description: "Assignment 3 (Digital Marketing) is due tomorrow", createdAt: "5h ago", read: false },
  { id: "n3", type: "content", title: "New lesson available", description: "Module 3 unlocked in PMP Certification Prep", createdAt: "1 day ago", read: false },
  { id: "n4", type: "cert", title: "Certificate issued", description: "Your Business Data Analytics certificate is ready", createdAt: "3 days ago", read: true },
  { id: "n5", type: "payment", title: "Installment reminder", description: "Installment 2 of INV-2026-1004 is due in 5 days", createdAt: "4 days ago", read: true },
  { id: "n6", type: "announce", title: "Term schedule update", description: "Office hours moved to Thursdays at 3 PM", createdAt: "1 week ago", read: true },
];

const quiz: Quiz = {
  id: "qz1",
  title: "Financial Modeling — Quiz 1.4",
  durationMin: 10,
  questions: [
    { id: "q1", text: "Which statement links the income statement and balance sheet?", options: ["Cash flow statement", "Retained earnings", "Depreciation schedule", "Working capital"] },
    { id: "q2", text: "A DCF values a company based on…", options: ["Comparable multiples", "Discounted future cash flows", "Book value", "Dividend history"] },
    { id: "q3", text: "WACC stands for…", options: ["Weighted Average Cost of Capital", "Working Asset Capital Cost", "Weighted Annual Cash Cycle", "Wealth & Capital Coefficient"] },
    { id: "q4", text: "Which is a circular reference risk in models?", options: ["Interest on average debt", "Straight-line depreciation", "Fixed revenue growth", "Static tax rate"] },
    { id: "q5", text: "Sensitivity analysis primarily tests…", options: ["Data formatting", "Assumption impact on outputs", "Print layout", "Cell colors"] },
  ],
};

const dashboard = {
  stats: {
    enrolled: enrolled.length,
    avgProgress: Math.round(enrolled.reduce((s, c) => s + c.progress, 0) / enrolled.length),
    certificates: certificates.length,
    upcoming: schedule.length,
  },
  continueCourse: enrolled[1],
  upcomingEvents: schedule.slice(0, 4),
  recentGrades: grades.filter((g) => g.status === "graded").slice(0, 3),
};

export const getEnrolledCourses = () => respond(enrolled);
export const getEnrolledCourse = async (slug: string) => {
  await delay(200);
  const found = enrolled.find((c) => c.slug === slug);
  return found ? clone(found) : null;
};
export const getSchedule = () => respond(schedule);
export const getGrades = () => respond(grades);
export const getCertificates = () => respond(certificates);
export const getQuiz = () => respond(quiz);
export const getStudentDashboard = () => respond(dashboard);

/* -------------------------------------------------------------------------- */
/*  Assignments, billing detail, transcript, favorites (portal gaps)            */
/* -------------------------------------------------------------------------- */
export type StudentAssignmentStatus = "pending" | "submitted" | "graded";
export interface StudentAssignment {
  id: string; title: string; course: string; dueDate: string;
  status: StudentAssignmentStatus; grade?: number; maxGrade: number; description: string;
}
export interface PaymentMethod { id: string; type: "card" | "bank"; brand: string; last4: string; isDefault: boolean }
export interface InstallmentLine { index: number; amount: number; currency: "EGP"; dueDate: string; status: "PAID" | "DUE" | "SCHEDULED" }
export interface TranscriptItem { item: string; score: number; max: number }
export interface TranscriptRow { course: string; credits: number; items: TranscriptItem[]; average: number }

const studentAssignments: StudentAssignment[] = [
  { id: "sa1", title: "Assignment 1: Valuation Model", course: "Advanced Financial Modeling", dueDate: "Submitted", status: "graded", grade: 88, maxGrade: 100, description: "Build a 3-statement model and a DCF for the provided company. Submit your .xlsx and a one-page summary." },
  { id: "sa2", title: "Assignment 2: Campaign Plan", course: "Digital Marketing Strategy", dueDate: "in 2 days", status: "submitted", grade: undefined, maxGrade: 100, description: "Draft a full-funnel campaign plan with channel mix, budget and KPIs for the brief provided in Module 2." },
  { id: "sa3", title: "Assignment 3: Project Charter", course: "PMP Certification Prep", dueDate: "in 5 days", status: "pending", grade: undefined, maxGrade: 100, description: "Produce a project charter including scope, stakeholders, milestones and a risk register." },
  { id: "sa4", title: "Assignment 1: OD Proposal", course: "Strategic Human Resources", dueDate: "in 9 days", status: "pending", grade: undefined, maxGrade: 100, description: "Write an organizational-development proposal addressing the case study's culture and retention challenges." },
];

const paymentMethods: PaymentMethod[] = [
  { id: "pm1", type: "card", brand: "Visa", last4: "4242", isDefault: true },
  { id: "pm2", type: "card", brand: "Mastercard", last4: "5577", isDefault: false },
  { id: "pm3", type: "bank", brand: "Bank transfer", last4: "8801", isDefault: false },
];

const installmentPlan: InstallmentLine[] = [
  { index: 1, amount: 3300, currency: "EGP", dueDate: "Paid · 1 Mar 2026", status: "PAID" },
  { index: 2, amount: 3300, currency: "EGP", dueDate: "Due · 1 Apr 2026", status: "DUE" },
  { index: 3, amount: 3300, currency: "EGP", dueDate: "1 May 2026", status: "SCHEDULED" },
];

const favorites = enrolled.slice(0, 3);

function buildTranscript(): TranscriptRow[] {
  const byCourse = new Map<string, TranscriptItem[]>();
  grades.filter((g) => g.status === "graded").forEach((g) => {
    const arr = byCourse.get(g.course) ?? [];
    arr.push({ item: g.item, score: g.score, max: g.max });
    byCourse.set(g.course, arr);
  });
  return Array.from(byCourse.entries()).map(([course, items]) => {
    const pct = items.reduce((s, i) => s + (i.score / i.max) * 100, 0) / items.length;
    return { course, credits: 3, items, average: Math.round(pct) };
  });
}

export const getStudentAssignments = () => respond(studentAssignments);
export const getStudentAssignment = async (id: string) => {
  await delay(200);
  const a = studentAssignments.find((x) => x.id === id);
  return a ? clone(a) : null;
};
export const getPaymentMethods = () => respond(paymentMethods);
export const getInstallments = () => respond(installmentPlan);
export const getFavorites = () => respond(favorites);
export const getTranscript = () => respond(buildTranscript());

export const getNotifications = () => respond(notifications);
export const getUnreadCount = async () => {
  await delay(100);
  return notifications.filter((n) => !n.read).length;
};
export async function markAllRead(): Promise<Notification[]> {
  await delay(200);
  notifications = notifications.map((n) => ({ ...n, read: true }));
  return clone(notifications);
}
