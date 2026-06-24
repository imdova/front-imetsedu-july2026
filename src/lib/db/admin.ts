/**
 * Admin-module seed + actions: instructors, taxonomy (categories/tags), groups,
 * registrations, certificates, people (users/invitations/roles/departments) and
 * assessment (quizzes/assignments). Backs the admin console module screens.
 */
import { createId } from "@/lib/utils";
import { clone, delay, respond } from "./delay";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */
export interface Instructor {
  id: string; name: string; titleEn: string; titleAr: string; email: string;
  experience: number; rating: number; courses: number; status: "active" | "inactive"; initials: string;
}
export interface Category {
  id: string; name: string; nameAr: string; slug: string; subcategories: number; courseCount: number; active: boolean;
}
export interface Tag { id: string; name: string; slug: string; courseCount: number; active: boolean }
export interface Group {
  id: string; title: string; category: string; startDate: string; endDate: string;
  status: "pending" | "inprogress" | "finished"; students: number; capacity: number; revenue: number;
}
export interface Registration {
  id: string; student: string; course: string; group: string; totalFee: number; paid: number;
  progress: number; status: "active" | "completed" | "dropped"; registeredAt: string;
}
export interface AdminCertificate { id: string; code: string; student: string; course: string; issuedAt: string; link?: string }
export interface AdminUser {
  id: string; name: string; email: string; role: string; department: string; status: "active" | "invited" | "suspended"; lastActive: string; initials: string;
}
export interface Invitation { id: string; email: string; role: string; status: "pending" | "accepted" | "cancelled"; sentAt: string }
export interface Role { id: string; title: string; department: string; description: string; members: number; permissions: number }
export interface Department { id: string; name: string; members: number }
export interface AdminQuiz { id: string; title: string; category: string; questions: number; attempts: number; status: "published" | "draft" }
export interface Assignment { id: string; title: string; course: string; dueDate: string; submissions: number; graded: number }

/* -------------------------------------------------------------------------- */
/*  Seeds                                                                       */
/* -------------------------------------------------------------------------- */
const INSTRUCTOR_NAMES = [
  ["Dr. Karim El-Sayed", "Finance, ex-EFG Hermes", "المالية"],
  ["Mona Rashad", "CMO, Growth Strategist", "التسويق"],
  ["Tarek Mansour", "PMP, Agile Coach", "إدارة المشاريع"],
  ["Dr. Layla Hassan", "Leadership & OD", "القيادة"],
  ["Omar Fathy", "Data & Analytics Lead", "تحليل البيانات"],
  ["Sara Adel", "HR Director", "الموارد البشرية"],
];
let instructors: Instructor[] = INSTRUCTOR_NAMES.map(([name, titleEn, titleAr], i) => ({
  id: `ins_${i}`, name, titleEn, titleAr,
  email: `${name.split(" ").pop()!.toLowerCase().replace(/[^a-z]/g, "")}@imetsedu.com`,
  experience: 6 + i, rating: +(4.5 + (i % 5) * 0.1).toFixed(1), courses: 2 + (i % 4),
  status: i === 5 ? "inactive" : "active",
  initials: name.replace("Dr. ", "").split(" ").slice(0, 2).map((p) => p[0]).join(""),
}));

const CAT_DATA = [
  ["Business & Management", "إدارة الأعمال", 3], ["Finance & Accounting", "المالية والمحاسبة", 3],
  ["Marketing & Sales", "التسويق والمبيعات", 3], ["Project Management", "إدارة المشاريع", 2],
  ["Human Resources", "الموارد البشرية", 2],
];
let categories: Category[] = CAT_DATA.map(([name, nameAr, sub], i) => ({
  id: `cat_${i}`, name: name as string, nameAr: nameAr as string,
  slug: (name as string).toLowerCase().replace(/[^a-z]+/g, "-").replace(/^-|-$/g, ""),
  subcategories: sub as number, courseCount: 8 + i * 3, active: true,
}));

let tags: Tag[] = ["In-demand", "Career Switch", "Executive", "Beginner Friendly", "Certified", "Weekend"].map((name, i) => ({
  id: `tag_${i}`, name, slug: name.toLowerCase().replace(/\s+/g, "-"), courseCount: 4 + i * 2, active: i !== 5,
}));

let groups: Group[] = Array.from({ length: 8 }, (_, i) => ({
  id: `grp_${i}`,
  title: `${["Finance", "Marketing", "PMP", "Leadership", "HR", "Analytics", "Strategy", "Operations"][i]} Cohort ${2026}-${i + 1}`,
  category: CAT_DATA[i % CAT_DATA.length][0] as string,
  startDate: `${(i % 6) + 1} Mar 2026`, endDate: `${(i % 6) + 1} Jun 2026`,
  status: (["inprogress", "pending", "finished"] as const)[i % 3],
  students: 12 + i * 2, capacity: 30, revenue: (12 + i * 2) * 9900,
}));

const STUDENT_NAMES = ["Ahmed Al-Otaibi", "Layla Habib", "Omar Mansour", "Fatima Saleh", "Yousef Rashad", "Mariam Awad", "Khalid Hassan", "Nour Fathy", "Hassan Adel", "Sara Salim"];
let registrations: Registration[] = Array.from({ length: 12 }, (_, i) => {
  const fee = [9900, 8400, 6200, 12000][i % 4];
  const status = (["active", "completed", "dropped"] as const)[i % 3];
  return {
    id: `reg_${i}`, student: STUDENT_NAMES[i % STUDENT_NAMES.length],
    course: ["Advanced Financial Modeling", "Digital Marketing Strategy", "PMP Certification Prep", "Strategic HR"][i % 4],
    group: groups[i % groups.length].title, totalFee: fee,
    paid: status === "completed" ? fee : status === "dropped" ? Math.round(fee / 3) : Math.round(fee / 2),
    progress: status === "completed" ? 100 : status === "dropped" ? 15 : 40 + (i % 5) * 10,
    status, registeredAt: `${(i % 20) + 1} days ago`,
  };
});

let certificates: AdminCertificate[] = Array.from({ length: 9 }, (_, i) => ({
  id: `crt_${i}`, code: `IMETS-2026-${(1000 + i * 37).toString(36).toUpperCase().slice(0, 6)}`,
  student: STUDENT_NAMES[i % STUDENT_NAMES.length],
  course: ["Business Data Analytics", "Executive Leadership Essentials", "Advanced Financial Modeling"][i % 3],
  issuedAt: `2026-0${(i % 6) + 1}-12`,
}));

const STAFF = [
  ["Admin User", "admin@imetsedu.com", "Administrator", "Management", "active"],
  ["Karim El-Sayed", "karim@imetsedu.com", "Counselor", "Sales", "active"],
  ["Mona Rashad", "mona@imetsedu.com", "Manager", "Sales", "active"],
  ["Sara Adel", "sara@imetsedu.com", "Finance Officer", "Finance", "active"],
  ["Tarek Mansour", "tarek@imetsedu.com", "Instructor", "Faculty", "active"],
  ["Nour Fathy", "nour@imetsedu.com", "Counselor", "Sales", "suspended"],
];
let users: AdminUser[] = STAFF.map(([name, email, role, department, status], i) => ({
  id: `usr_${i}`, name: name as string, email: email as string, role: role as string,
  department: department as string, status: status as AdminUser["status"],
  lastActive: ["1h ago", "yesterday", "3 days ago", "1 week ago"][i % 4],
  initials: (name as string).split(" ").slice(0, 2).map((p) => p[0]).join(""),
}));

let invitations: Invitation[] = [
  { id: "inv_0", email: "yousef@imetsedu.com", role: "Counselor", status: "pending", sentAt: "2 days ago" },
  { id: "inv_1", email: "huda@imetsedu.com", role: "Instructor", status: "pending", sentAt: "5 days ago" },
  { id: "inv_2", email: "bilal@imetsedu.com", role: "Finance Officer", status: "accepted", sentAt: "1 week ago" },
];

let roles: Role[] = [
  { id: "rol_0", title: "Administrator", department: "Management", description: "Full platform access", members: 1, permissions: 42 },
  { id: "rol_1", title: "Sales Manager", department: "Sales", description: "Pipeline oversight & team KPIs", members: 1, permissions: 24 },
  { id: "rol_2", title: "Counselor", department: "Sales", description: "Works assigned leads to enrolment", members: 2, permissions: 14 },
  { id: "rol_3", title: "Finance Officer", department: "Finance", description: "Invoicing, payments, refunds", members: 1, permissions: 12 },
  { id: "rol_4", title: "Instructor", department: "Faculty", description: "Course delivery & grading", members: 1, permissions: 10 },
];

let departments: Department[] = [
  { id: "dep_0", name: "Management", members: 1 }, { id: "dep_1", name: "Sales", members: 3 },
  { id: "dep_2", name: "Finance", members: 1 }, { id: "dep_3", name: "Faculty", members: 1 },
];

let quizzes: AdminQuiz[] = Array.from({ length: 8 }, (_, i) => ({
  id: `qz_${i}`, title: `${["Finance", "Marketing", "PMP", "HR"][i % 4]} — Quiz ${i + 1}`,
  category: ["Finance", "Marketing", "Project Management", "HR"][i % 4],
  questions: 5 + (i % 6), attempts: 12 + i * 7, status: i % 4 === 3 ? "draft" : "published",
}));

let assignments: Assignment[] = Array.from({ length: 7 }, (_, i) => {
  const subs = 8 + i * 3;
  return {
    id: `asg_${i}`, title: `Assignment ${i + 1}: ${["Valuation Model", "Campaign Plan", "Project Charter", "OD Proposal"][i % 4]}`,
    course: ["Advanced Financial Modeling", "Digital Marketing Strategy", "PMP Certification Prep", "Strategic HR"][i % 4],
    dueDate: `${(i % 14) + 3} days`, submissions: subs, graded: Math.round(subs * (0.4 + (i % 5) * 0.12)),
  };
});

/* -------------------------------------------------------------------------- */
/*  Getters + actions                                                          */
/* -------------------------------------------------------------------------- */
export const getInstructors = () => respond(instructors);
export const getCategories = () => respond(categories);
export const getTags = () => respond(tags);
export const getGroups = () => respond(groups);
export const getRegistrations = () => respond(registrations);
export const getCertificates = () => respond(certificates);
export const getUsers = () => respond(users);
export const getInvitations = () => respond(invitations);
export const getRoles = () => respond(roles);
export const getDepartments = () => respond(departments);
export const getQuizzes = () => respond(quizzes);
export const getAssignments = () => respond(assignments);

export async function createInstructor(input: { name: string; titleEn: string; titleAr: string; email: string }): Promise<Instructor> {
  await delay(400);
  const ins: Instructor = {
    id: createId("ins"), name: input.name, titleEn: input.titleEn, titleAr: input.titleAr, email: input.email,
    experience: 1, rating: 0, courses: 0, status: "active",
    initials: input.name.split(" ").slice(0, 2).map((p) => p[0]).join(""),
  };
  instructors = [ins, ...instructors];
  return clone(ins);
}
export async function createCategory(input: { name: string; nameAr: string }): Promise<Category> {
  await delay(300);
  const cat: Category = {
    id: createId("cat"), name: input.name, nameAr: input.nameAr,
    slug: input.name.toLowerCase().replace(/[^a-z]+/g, "-").replace(/^-|-$/g, ""),
    subcategories: 0, courseCount: 0, active: true,
  };
  categories = [cat, ...categories];
  return clone(cat);
}
export async function createTag(input: { name: string }): Promise<Tag> {
  await delay(250);
  const tag: Tag = { id: createId("tag"), name: input.name, slug: input.name.toLowerCase().replace(/\s+/g, "-"), courseCount: 0, active: true };
  tags = [tag, ...tags];
  return clone(tag);
}
export async function inviteUser(input: { email: string; role: string }): Promise<Invitation> {
  await delay(350);
  const inv: Invitation = { id: createId("inv"), email: input.email, role: input.role, status: "pending", sentAt: "just now" };
  invitations = [inv, ...invitations];
  return clone(inv);
}
/* -------------------------------------------------------------------------- */
/*  Detail views: assignment submissions, group roster, quiz questions          */
/* -------------------------------------------------------------------------- */
export interface Submission {
  id: string; studentName: string; initials: string; submittedAt: string;
  status: "submitted" | "graded"; grade?: number; fileName: string;
}
export interface AssignmentDetail extends Assignment { maxGrade: number; submissionsList: Submission[] }

export interface GroupStudent {
  id: string; name: string; initials: string; fee: number; paid: number; progress: number; completed: boolean;
}
export interface GroupScheduleSlot { day: string; startTime: string; endTime: string; zoomLink: string }
export interface GroupDetail extends Group { schedule: GroupScheduleSlot[]; roster: GroupStudent[] }

export interface QuizQuestionFull { id: string; text: string; options: string[]; correctIndex: number }
export interface QuizDetail extends AdminQuiz { maxGrade: number; questionsList: QuizQuestionFull[] }

const initialsOf = (n: string) => n.split(" ").slice(0, 2).map((p) => p[0]).join("");

export async function getAssignmentById(id: string): Promise<AssignmentDetail | null> {
  await delay(200);
  const a = assignments.find((x) => x.id === id);
  if (!a) return null;
  const submissionsList: Submission[] = Array.from({ length: a.submissions }, (_, i) => {
    const name = STUDENT_NAMES[i % STUDENT_NAMES.length];
    const graded = i < a.graded;
    return {
      id: `sub_${id}_${i}`, studentName: name, initials: initialsOf(name),
      submittedAt: `${(i % 6) + 1} days ago`, status: graded ? "graded" : "submitted",
      grade: graded ? 70 + ((i * 7) % 30) : undefined, fileName: `submission-${i + 1}.pdf`,
    };
  });
  return clone({ ...a, maxGrade: 100, submissionsList });
}

export async function getGroupById(id: string): Promise<GroupDetail | null> {
  await delay(200);
  const g = groups.find((x) => x.id === id);
  if (!g) return null;
  const fee = 9900;
  const roster: GroupStudent[] = Array.from({ length: g.students }, (_, i) => {
    const name = STUDENT_NAMES[i % STUDENT_NAMES.length];
    const progress = (i * 13) % 101;
    return {
      id: `gs_${id}_${i}`, name, initials: initialsOf(name), fee,
      paid: progress >= 100 ? fee : Math.round(fee * (0.3 + (i % 4) * 0.2)),
      progress, completed: progress >= 100,
    };
  });
  const schedule: GroupScheduleSlot[] = [
    { day: "Monday", startTime: "18:00", endTime: "20:00", zoomLink: "https://zoom.us/j/000" },
    { day: "Wednesday", startTime: "18:00", endTime: "20:00", zoomLink: "https://zoom.us/j/000" },
  ];
  return clone({ ...g, schedule, roster });
}

const QBANK = [
  { text: "Which statement links the income statement and balance sheet?", options: ["Cash flow statement", "Retained earnings", "Depreciation schedule", "Working capital"], correctIndex: 1 },
  { text: "A DCF values a company based on…", options: ["Comparable multiples", "Discounted future cash flows", "Book value", "Dividend history"], correctIndex: 1 },
  { text: "WACC stands for…", options: ["Weighted Average Cost of Capital", "Working Asset Capital Cost", "Weighted Annual Cash Cycle", "Wealth & Capital Coefficient"], correctIndex: 0 },
  { text: "Which is a circular-reference risk in models?", options: ["Interest on average debt", "Straight-line depreciation", "Fixed revenue growth", "Static tax rate"], correctIndex: 0 },
  { text: "Sensitivity analysis primarily tests…", options: ["Data formatting", "Assumption impact on outputs", "Print layout", "Cell colors"], correctIndex: 1 },
  { text: "Net present value is positive when…", options: ["IRR < discount rate", "IRR > discount rate", "Payback > 5 years", "Revenue is flat"], correctIndex: 1 },
];

export async function getQuizById(id: string): Promise<QuizDetail | null> {
  await delay(200);
  const q = quizzes.find((x) => x.id === id);
  if (!q) return null;
  const questionsList: QuizQuestionFull[] = Array.from({ length: q.questions }, (_, i) => ({
    id: `qq_${id}_${i}`, ...QBANK[i % QBANK.length],
  }));
  return clone({ ...q, maxGrade: 100, questionsList });
}

export async function issueCertificate(input: { student: string; course: string }): Promise<AdminCertificate> {
  await delay(350);
  const crt: AdminCertificate = {
    id: createId("crt"), code: `IMETS-2026-${createId("").slice(0, 6).toUpperCase()}`,
    student: input.student, course: input.course, issuedAt: "2026-06-14",
  };
  certificates = [crt, ...certificates];
  return clone(crt);
}

/* ──────────────────────────────────────────────────────────────────────────
 * Admin sub-modules: Students directory · Transactions · Events ·
 * Notifications broadcast · WhatsApp templates · LMS content.
 * ────────────────────────────────────────────────────────────────────────── */

export type AdminStudentStatus = "active" | "inactive" | "suspended";
export interface AdminStudent {
  id: string;
  name: string;
  email: string;
  phone: string;
  enrolled: number;
  status: AdminStudentStatus;
  joinedAt: string;
  totalSpent: number;
}
export interface AdminStudentCourse { title: string; progress: number; status: "inprogress" | "completed" | "dropped" }
export interface AdminStudentPayment { id: string; amount: number; date: string; status: "completed" | "pending" | "failed" }
export interface AdminStudentDetail extends AdminStudent {
  courses: AdminStudentCourse[];
  payments: AdminStudentPayment[];
  certificates: { code: string; course: string; issuedAt: string }[];
}

const students: AdminStudent[] = [
  { id: "stu_1", name: "Yara Mahmoud", email: "yara.m@example.com", phone: "+20 100 222 1188", enrolled: 4, status: "active", joinedAt: "2025-11-02", totalSpent: 18400 },
  { id: "stu_2", name: "Hassan Ali", email: "hassan.ali@example.com", phone: "+20 111 555 7723", enrolled: 2, status: "active", joinedAt: "2026-01-14", totalSpent: 7600 },
  { id: "stu_3", name: "Nour El-Din", email: "nour.eldin@example.com", phone: "+966 50 884 2210", enrolled: 6, status: "active", joinedAt: "2025-08-21", totalSpent: 31200 },
  { id: "stu_4", name: "Salma Adel", email: "salma.adel@example.com", phone: "+20 122 909 4471", enrolled: 1, status: "inactive", joinedAt: "2026-03-30", totalSpent: 2400 },
  { id: "stu_5", name: "Omar Khaled", email: "omar.k@example.com", phone: "+971 55 330 1190", enrolled: 3, status: "suspended", joinedAt: "2025-12-09", totalSpent: 11800 },
  { id: "stu_6", name: "Mariam Fawzy", email: "mariam.f@example.com", phone: "+20 106 778 2235", enrolled: 5, status: "active", joinedAt: "2025-10-17", totalSpent: 24600 },
];

export const getStudents = () => respond(students);

export async function getStudentById(id: string): Promise<AdminStudentDetail | null> {
  await delay(200);
  const s = students.find((x) => x.id === id);
  if (!s) return null;
  const detail: AdminStudentDetail = {
    ...s,
    courses: ([
      { title: "Financial Modeling Masterclass", progress: 82, status: "inprogress" },
      { title: "Corporate Finance Foundations", progress: 100, status: "completed" },
      { title: "Investment Analysis & Valuation", progress: 35, status: "inprogress" },
    ] as AdminStudentCourse[]).slice(0, Math.max(1, Math.min(3, s.enrolled))),
    payments: [
      { id: "pay_a", amount: 4800, date: "2026-05-12", status: "completed" },
      { id: "pay_b", amount: 4800, date: "2026-04-12", status: "completed" },
      { id: "pay_c", amount: 4800, date: "2026-06-12", status: "pending" },
    ],
    certificates: [{ code: "IMETS-2026-CF0231", course: "Corporate Finance Foundations", issuedAt: "2026-03-01" }],
  };
  return clone(detail);
}

export type TransactionType = "payment" | "refund" | "payout";
export type TransactionStatus = "completed" | "pending" | "failed";
export interface Transaction {
  id: string;
  reference: string;
  party: string;
  detail: string;
  amount: number;
  method: string;
  type: TransactionType;
  status: TransactionStatus;
  date: string;
}

const transactions: Transaction[] = [
  { id: "txn_1", reference: "TXN-90231", party: "Yara Mahmoud", detail: "Financial Modeling Masterclass", amount: 4800, method: "Visa •• 4471", type: "payment", status: "completed", date: "2026-06-12" },
  { id: "txn_2", reference: "TXN-90232", party: "Hassan Ali", detail: "Corporate Finance Foundations", amount: 3800, method: "Mada •• 8820", type: "payment", status: "completed", date: "2026-06-11" },
  { id: "txn_3", reference: "TXN-90233", party: "Omar Khaled", detail: "Refund — withdrawal", amount: -2400, method: "Bank transfer", type: "refund", status: "pending", date: "2026-06-10" },
  { id: "txn_4", reference: "TXN-90234", party: "Dr. Karim El-Sayed", detail: "Instructor payout — May", amount: -78600, method: "Bank transfer", type: "payout", status: "completed", date: "2026-06-01" },
  { id: "txn_5", reference: "TXN-90235", party: "Salma Adel", detail: "Budgeting for Startups", amount: 2400, method: "Visa •• 1190", type: "payment", status: "failed", date: "2026-06-09" },
  { id: "txn_6", reference: "TXN-90236", party: "Mariam Fawzy", detail: "Investment Analysis & Valuation", amount: 5200, method: "Mastercard •• 2235", type: "payment", status: "completed", date: "2026-06-08" },
];

export type PayoutStatus = "paid" | "pending" | "processing";
export interface InstructorPayout {
  id: string;
  instructor: string;
  period: string;
  courses: number;
  amount: number;
  method: string;
  status: PayoutStatus;
  date: string;
}

const payouts: InstructorPayout[] = [
  { id: "pyt_1", instructor: "Dr. Karim El-Sayed", period: "May 2026", courses: 4, amount: 78600, method: "Bank transfer", status: "paid", date: "2026-06-01" },
  { id: "pyt_2", instructor: "Mona Rashad", period: "May 2026", courses: 3, amount: 52400, method: "Bank transfer", status: "paid", date: "2026-06-01" },
  { id: "pyt_3", instructor: "Tarek Mansour", period: "May 2026", courses: 2, amount: 34900, method: "Bank transfer", status: "processing", date: "2026-06-14" },
  { id: "pyt_4", instructor: "Dr. Layla Hassan", period: "May 2026", courses: 2, amount: 41200, method: "Bank transfer", status: "pending", date: "2026-07-01" },
];

export const getTransactions = () => respond(transactions);
export const getPayouts = () => respond(payouts);

export type AdminEventType = "webinar" | "workshop" | "orientation";
export type AdminEventStatus = "scheduled" | "live" | "completed" | "cancelled";
export interface AdminEvent {
  id: string;
  title: string;
  type: AdminEventType;
  host: string;
  date: string;
  time: string;
  registered: number;
  capacity: number;
  status: AdminEventStatus;
}

const events: AdminEvent[] = [
  { id: "aev_1", title: "Financial Modeling — Live Q&A", type: "webinar", host: "Dr. Karim El-Sayed", date: "2026-06-18", time: "18:00", registered: 86, capacity: 120, status: "scheduled" },
  { id: "aev_2", title: "New Cohort Orientation — June", type: "orientation", host: "Admissions Team", date: "2026-06-20", time: "12:00", registered: 240, capacity: 300, status: "scheduled" },
  { id: "aev_3", title: "Advanced Excel Workshop", type: "workshop", host: "Omar Fathy", date: "2026-06-28", time: "17:00", registered: 38, capacity: 40, status: "scheduled" },
  { id: "aev_4", title: "Intro to Investment Analysis", type: "webinar", host: "Tarek Mansour", date: "2026-06-05", time: "19:00", registered: 210, capacity: 250, status: "completed" },
  { id: "aev_5", title: "Branding Bootcamp", type: "workshop", host: "Mona Rashad", date: "2026-05-22", time: "16:00", registered: 64, capacity: 60, status: "cancelled" },
];

export const getEvents = () => respond(events);

export type NotificationChannel = "email" | "sms" | "whatsapp" | "in_app";
export type BroadcastStatus = "sent" | "scheduled" | "draft";
export interface AdminBroadcast {
  id: string;
  title: string;
  channel: NotificationChannel;
  audience: string;
  reach: number;
  status: BroadcastStatus;
  sentAt: string;
}

const broadcasts: AdminBroadcast[] = [
  { id: "brd_1", title: "June cohort starts Monday", channel: "email", audience: "Enrolled — June", reach: 240, status: "sent", sentAt: "2026-06-12" },
  { id: "brd_2", title: "Installment due reminder", channel: "whatsapp", audience: "Outstanding balance", reach: 86, status: "sent", sentAt: "2026-06-10" },
  { id: "brd_3", title: "New course: Investment Analysis", channel: "email", audience: "All learners", reach: 18400, status: "scheduled", sentAt: "2026-06-16" },
  { id: "brd_4", title: "Webinar invite — Live Q&A", channel: "in_app", audience: "Finance track", reach: 1240, status: "draft", sentAt: "—" },
  { id: "brd_5", title: "Certificate ready to download", channel: "sms", audience: "Recent graduates", reach: 312, status: "sent", sentAt: "2026-06-08" },
];

export const getBroadcasts = () => respond(broadcasts);

export type TemplateCategory = "marketing" | "transactional" | "reminder";
export type TemplateStatus = "approved" | "pending" | "rejected";
export interface WhatsappTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  language: "en" | "ar";
  body: string;
  status: TemplateStatus;
}

const whatsappTemplates: WhatsappTemplate[] = [
  { id: "wt_1", name: "enrolment_confirmation", category: "transactional", language: "en", body: "Hi {{1}}, your enrolment in {{2}} is confirmed. Your cohort starts {{3}}.", status: "approved" },
  { id: "wt_2", name: "installment_reminder", category: "reminder", language: "en", body: "Hi {{1}}, a payment of {{2}} for {{3}} is due on {{4}}. Pay now: {{5}}", status: "approved" },
  { id: "wt_3", name: "enrolment_confirmation_ar", category: "transactional", language: "ar", body: "مرحبًا {{1}}، تم تأكيد تسجيلك في {{2}}. تبدأ دفعتك في {{3}}.", status: "approved" },
  { id: "wt_4", name: "welcome_offer", category: "marketing", language: "en", body: "Welcome {{1}}! Enjoy 15% off your first program at IMETS. Code: {{2}}", status: "pending" },
  { id: "wt_5", name: "abandoned_checkout", category: "marketing", language: "en", body: "Still thinking about {{1}}, {{2}}? Your seat is held for 24h.", status: "rejected" },
];

export const getWhatsappTemplates = () => respond(whatsappTemplates);

export interface LmsCourseContent {
  id: string;
  course: string;
  modules: number;
  lessons: number;
  quizzes: number;
  resources: number;
  published: boolean;
  updatedAt: string;
}

const lmsContent: LmsCourseContent[] = [
  { id: "lms_1", course: "Financial Modeling Masterclass", modules: 8, lessons: 64, quizzes: 8, resources: 32, published: true, updatedAt: "2026-06-10" },
  { id: "lms_2", course: "Corporate Finance Foundations", modules: 6, lessons: 48, quizzes: 6, resources: 24, published: true, updatedAt: "2026-06-04" },
  { id: "lms_3", course: "Investment Analysis & Valuation", modules: 7, lessons: 52, quizzes: 7, resources: 28, published: true, updatedAt: "2026-05-29" },
  { id: "lms_4", course: "Budgeting for Startups", modules: 4, lessons: 26, quizzes: 4, resources: 14, published: false, updatedAt: "2026-06-12" },
];

export const getLmsContent = () => respond(lmsContent);

export interface InstructorCourseRow { title: string; students: number; rating: number; status: "published" | "draft" }
export interface InstructorDetail extends Instructor {
  bio: string;
  joinedAt: string;
  totalStudents: number;
  courseList: InstructorCourseRow[];
}

export async function getInstructorById(id: string): Promise<InstructorDetail | null> {
  await delay(200);
  const ins = instructors.find((x) => x.id === id);
  if (!ins) return null;
  const courseList: InstructorCourseRow[] = ([
    { title: "Financial Modeling Masterclass", students: 412, rating: 4.9, status: "published" },
    { title: "Corporate Finance Foundations", students: 318, rating: 4.7, status: "published" },
    { title: "Investment Analysis & Valuation", students: 264, rating: 4.8, status: "draft" },
  ] as InstructorCourseRow[]).slice(0, Math.max(1, Math.min(3, ins.courses)));
  return clone({
    ...ins,
    bio: `${ins.titleEn} with ${ins.experience} years of industry experience, teaching practitioner-led programs at IMETS Medical School.`,
    joinedAt: "2024-09-01",
    totalStudents: courseList.reduce((s, c) => s + c.students, 0),
    courseList,
  });
}

export interface UserActivity { action: string; at: string }
export interface UserDetail extends AdminUser {
  phone: string;
  joinedAt: string;
  activity: UserActivity[];
}

export async function getUserById(id: string): Promise<UserDetail | null> {
  await delay(200);
  const u = users.find((x) => x.id === id);
  if (!u) return null;
  return clone({
    ...u,
    phone: "+20 100 000 0000",
    joinedAt: "2025-02-14",
    activity: [
      { action: "Signed in", at: "2026-06-14 09:12" },
      { action: "Updated a lead stage", at: "2026-06-13 16:40" },
      { action: "Issued a certificate", at: "2026-06-12 11:05" },
      { action: "Created an invoice", at: "2026-06-10 14:22" },
    ],
  });
}
