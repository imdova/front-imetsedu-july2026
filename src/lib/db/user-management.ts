/**
 * User-management data module (self-contained): staff directory, invitations,
 * departments, and the RBAC role/permission registry. Backs the admin
 * "Users Management" screens (Users directory · Invite · Roles & Permissions ·
 * Departments). Bilingual labels live inline (like course-taxonomy) so the
 * 50+ permission strings don't bloat the message catalogs.
 */
import { createId } from "@/lib/utils";
import { clone, delay, respond } from "./delay";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */
export type UmUserStatus = "active" | "pending" | "suspended";

export interface UmUser {
  id: string;
  name: string;
  email: string;
  title: string;
  role: string;
  department: string;
  status: UmUserStatus;
  /** ISO date the invitation expires, or null once accepted. */
  expiresAt: string | null;
  acceptedAt: string | null;
  initials: string;
  /** Present for still-pending invitations — needed to resend/cancel. */
  invitationId?: string | null;
  phone?: string;
}

export interface UmStats {
  total: number;
  accepted: number;
  activeStaff: number;
  pendingInvites: number;
}

export interface UmDepartment {
  id: string;
  name: string;
  staff: number;
  roles: number;
  createdAt: string;
}

export type UmInvitationStatus = "pending" | "accepted" | "expired" | "cancelled";

export interface UmInvitation {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: UmInvitationStatus;
  /** ISO date the invite link expires. */
  expiresAt: string | null;
  invitedBy: string;
  createdAt: string;
  initials: string;
}

export type UmRisk = "low" | "medium" | "elevated" | "high";

export interface UmRole {
  id: string;
  name: string;
  custom: boolean;
  users: number;
  risk: UmRisk;
  riskScore: number;
  /** Granted permission ids ("module.perm"). */
  granted: string[];
  updatedBy: string;
  updatedAt: string;
  /** Owning department (present once roles come from the backend). */
  departmentId?: string;
  departmentName?: string;
  description?: string;
}

/** A single toggleable permission within a module. */
export interface UmPermission {
  id: string;
  en: string;
  ar: string;
  /** Optional risk note shown under the label (e.g. "Includes PII"). */
  noteEn?: string;
  noteAr?: string;
}

export interface UmModule {
  key: string;
  en: string;
  ar: string;
  descEn: string;
  descAr: string;
  icon: string; // lucide icon name
  /** Accent color token for the left bar. */
  accent: string;
  permissions: UmPermission[];
}

export interface UmCategory {
  key: string;
  en: string;
  ar: string;
  modules: UmModule[];
}

/* -------------------------------------------------------------------------- */
/*  Permission registry (the catalog every role is scored against)             */
/* -------------------------------------------------------------------------- */
const p = (id: string, en: string, ar: string, noteEn?: string, noteAr?: string): UmPermission => ({ id, en, ar, noteEn, noteAr });

export const PERMISSION_REGISTRY: UmCategory[] = [
  {
    key: "crm",
    en: "CRM",
    ar: "إدارة العلاقات",
    modules: [
      {
        key: "leads", en: "Leads", ar: "العملاء المحتملون",
        descEn: "Inbound prospects, contact info, pipeline stage.",
        descAr: "العملاء الواردون ومعلومات الاتصال ومرحلة المسار.",
        icon: "UserPlus", accent: "#f59e0b",
        permissions: [
          p("crm.leads.view", "View", "عرض"),
          p("crm.leads.create", "Create", "إنشاء"),
          p("crm.leads.edit", "Edit", "تعديل"),
          p("crm.leads.delete", "Delete", "حذف"),
          p("crm.leads.export", "Export", "تصدير", "Includes PII", "يتضمن بيانات شخصية"),
          p("crm.leads.assign", "Assign owner", "تعيين مسؤول"),
          p("crm.leads.import", "Bulk import", "استيراد جماعي"),
          p("crm.leads.note", "Add note / log activity", "إضافة ملاحظة / تسجيل نشاط"),
        ],
      },
      {
        key: "pipelines", en: "Pipelines", ar: "المسارات",
        descEn: "Pipeline definitions, stages, automations.",
        descAr: "تعريفات المسار والمراحل والأتمتة.",
        icon: "GitBranch", accent: "#6366f1",
        permissions: [
          p("crm.pipelines.view", "View", "عرض"),
          p("crm.pipelines.create", "Create", "إنشاء"),
          p("crm.pipelines.edit", "Edit", "تعديل"),
          p("crm.pipelines.delete", "Delete", "حذف"),
          p("crm.pipelines.export", "Export", "تصدير", "Includes PII", "يتضمن بيانات شخصية"),
          p("crm.pipelines.archive", "Archive pipeline", "أرشفة المسار"),
        ],
      },
      {
        key: "groups", en: "Groups", ar: "المجموعات",
        descEn: "Groups, batches, capacity.",
        descAr: "المجموعات والدفعات والسعة.",
        icon: "UsersRound", accent: "#a855f7",
        permissions: [
          p("crm.groups.view", "View", "عرض"),
          p("crm.groups.create", "Create", "إنشاء"),
          p("crm.groups.edit", "Edit", "تعديل"),
          p("crm.groups.delete", "Delete", "حذف"),
          p("crm.groups.export", "Export", "تصدير", "Includes PII", "يتضمن بيانات شخصية"),
          p("crm.groups.assignLms", "Assign LMS course", "تعيين دورة LMS"),
          p("crm.groups.schedule", "Schedule lectures", "جدولة المحاضرات"),
          p("crm.groups.members", "Add / remove members", "إضافة / إزالة الأعضاء"),
          p("crm.groups.transfer", "Transfer members between groups", "نقل الأعضاء بين المجموعات"),
        ],
      },
      {
        key: "crmDashboard", en: "CRM Dashboard", ar: "لوحة العلاقات",
        descEn: "Sales KPIs, funnel, leaderboards.",
        descAr: "مؤشرات المبيعات والقمع ولوحات الصدارة.",
        icon: "BarChart3", accent: "#3b82f6",
        permissions: [
          p("crm.dashboard.view", "View", "عرض"),
          p("crm.dashboard.export", "Export", "تصدير", "PII / financials", "بيانات شخصية / مالية"),
        ],
      },
      {
        key: "shipment", en: "Shipment", ar: "الشحن",
        descEn: "Certificate shipment requests and delivery status.",
        descAr: "طلبات شحن الشهادات وحالة التسليم.",
        icon: "Truck", accent: "#f97316",
        permissions: [
          p("crm.shipment.view", "View", "عرض"),
          p("crm.shipment.create", "Create", "إنشاء"),
          p("crm.shipment.edit", "Edit", "تعديل"),
          p("crm.shipment.delete", "Delete", "حذف"),
        ],
      },
      {
        key: "office", en: "Office", ar: "المكتب",
        descEn: "Message templates, important links, registration sheets, pricing sheet, payment methods.",
        descAr: "قوالب الرسائل والروابط المهمة وشيتات التسجيل وشيت الأسعار وطرق الدفع.",
        icon: "Briefcase", accent: "#14b8a6",
        permissions: [
          p("crm.office.view", "View", "عرض"),
          p("crm.office.create", "Create", "إنشاء"),
          p("crm.office.edit", "Edit", "تعديل"),
          p("crm.office.delete", "Delete", "حذف"),
        ],
      },
      {
        key: "paymentLinks", en: "Payment Links", ar: "روابط الدفع",
        descEn: "PayPal payment links per course & installment.",
        descAr: "روابط دفع PayPal لكل كورس وقسط.",
        icon: "Link2", accent: "#0ea5e9",
        permissions: [
          p("crm.payment_links.view", "View", "عرض"),
          p("crm.payment_links.create", "Create", "إنشاء"),
          p("crm.payment_links.edit", "Edit", "تعديل"),
          p("crm.payment_links.delete", "Delete", "حذف"),
        ],
      },
      {
        key: "commission", en: "Commission", ar: "العمولات",
        descEn: "Sales commission deals, plan and insights.",
        descAr: "عمولات المبيعات والخطة والتحليلات.",
        icon: "Coins", accent: "#eab308",
        permissions: [
          p("crm.commission.view", "View", "عرض"),
          p("crm.commission.create", "Create", "إنشاء"),
          p("crm.commission.edit", "Edit", "تعديل"),
          p("crm.commission.delete", "Delete", "حذف"),
        ],
      },
      {
        key: "rules", en: "Rules & Regulations", ar: "القواعد واللوائح",
        descEn: "Work instructions and policies.",
        descAr: "تعليمات العمل والسياسات.",
        icon: "ScrollText", accent: "#8b5cf6",
        permissions: [
          p("crm.rules.view", "View", "عرض"),
          p("crm.rules.create", "Create", "إنشاء"),
          p("crm.rules.edit", "Edit", "تعديل"),
          p("crm.rules.delete", "Delete", "حذف"),
        ],
      },
    ],
  },
  {
    key: "lms",
    en: "LMS",
    ar: "نظام التعلم",
    modules: [
      {
        key: "lmsCourses", en: "LMS Courses", ar: "دورات LMS",
        descEn: "Course catalogue, modules, lessons.",
        descAr: "كتالوج الدورات والوحدات والدروس.",
        icon: "PlayCircle", accent: "#3b82f6",
        permissions: [
          p("lms.courses.view", "View", "عرض"),
          p("lms.courses.create", "Create", "إنشاء"),
          p("lms.courses.edit", "Edit", "تعديل"),
          p("lms.courses.delete", "Delete", "حذف"),
          p("lms.courses.export", "Export", "تصدير", "Includes PII", "يتضمن بيانات شخصية"),
          p("lms.courses.duplicate", "Duplicate", "تكرار"),
          p("lms.courses.enroll", "Manage enrollments", "إدارة التسجيلات"),
        ],
      },
      {
        key: "certificates", en: "Certificates", ar: "الشهادات",
        descEn: "Certificate templates, issuance, delivery, revocation.",
        descAr: "قوالب الشهادات والإصدار والتسليم والإلغاء.",
        icon: "Award", accent: "#f59e0b",
        permissions: [
          p("lms.certificates.view", "View", "عرض"),
          p("lms.certificates.upload", "upload certificate", "رفع شهادة"),
        ],
      },
    ],
  },
  {
    key: "students",
    en: "STUDENTS",
    ar: "الطلاب",
    modules: [
      {
        key: "studentsDir", en: "Students Directory", ar: "دليل الطلاب",
        descEn: "Enrolled students, contact details, status.",
        descAr: "الطلاب المسجلون وتفاصيل الاتصال والحالة.",
        icon: "GraduationCap", accent: "#a855f7",
        permissions: [
          p("students.directory.view", "View", "عرض"),
          p("students.directory.delete", "Delete", "حذف"),
          p("students.directory.export", "Export", "تصدير", "Includes PII", "يتضمن بيانات شخصية"),
          p("students.directory.resetPw", "Reset student password", "إعادة تعيين كلمة مرور الطالب"),
        ],
      },
    ],
  },
  {
    key: "finance",
    en: "FINANCE",
    ar: "المالية",
    modules: [
      {
        key: "invoices", en: "Invoices", ar: "الفواتير",
        descEn: "Invoice lifecycle, sending, voiding.",
        descAr: "دورة حياة الفاتورة والإرسال والإلغاء.",
        icon: "ReceiptText", accent: "#f59e0b",
        permissions: [
          p("finance.invoices.view", "View", "عرض"),
          p("finance.invoices.create", "Create", "إنشاء"),
          p("finance.invoices.edit", "Edit", "تعديل"),
          p("finance.invoices.delete", "Delete", "حذف"),
          p("finance.invoices.export", "Export", "تصدير", "Includes PII", "يتضمن بيانات شخصية"),
          p("finance.invoices.send", "Send to customer", "إرسال إلى العميل"),
          p("finance.invoices.pdf", "Download PDF", "تنزيل PDF"),
        ],
      },
      {
        key: "refunds", en: "Refunds", ar: "المبالغ المستردة",
        descEn: "Refund requests + approvals.",
        descAr: "طلبات الاسترداد والموافقات.",
        icon: "Undo2", accent: "#ef4444",
        permissions: [
          p("finance.refunds.view", "View", "عرض"),
          p("finance.refunds.change", "change refund status", "تغيير حالة الاسترداد", "Spends real money", "ينفق أموالاً حقيقية"),
        ],
      },
      {
        key: "paymentTracking", en: "Payment Tracking", ar: "تتبع المدفوعات",
        descEn: "Installments, outstanding balances, reminders.",
        descAr: "الأقساط والأرصدة المستحقة والتذكيرات.",
        icon: "Wallet", accent: "#f59e0b",
        permissions: [
          p("finance.payment_tracking.view", "View (own customers)", "عرض (عملائه فقط)"),
          p("finance.payment_tracking.view_all", "View all customers", "عرض جميع العملاء"),
          p("finance.payment_tracking.export", "Export", "تصدير"),
          p("finance.payment_tracking.remind", "Send payment reminder", "إرسال تذكير بالدفع"),
          p("finance.payment_tracking.plan", "Adjust payment plan", "تعديل خطة الدفع"),
        ],
      },
    ],
  },
];

/** Flat list of every permission id — denominator for "X / 51". */
export const ALL_PERMISSION_IDS: string[] = PERMISSION_REGISTRY.flatMap((c) =>
  c.modules.flatMap((m) => m.permissions.map((perm) => perm.id)),
);
export const TOTAL_PERMISSIONS = ALL_PERMISSION_IDS.length;

/* -------------------------------------------------------------------------- */
/*  Seeds                                                                       */
/* -------------------------------------------------------------------------- */
const initialsOf = (n: string) => n.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");

const USER_SEED: Array<[string, string, string, string, string, UmUserStatus, string | null, string | null]> = [
  ["Admin User", "admin@imetsedu.com", "Platform Administrator", "Administrator", "Management", "active", null, "2025-02-14"],
  ["Karim El-Sayed", "karim@imetsedu.com", "Senior Sales Counselor", "Sales Team Leader", "Sales", "active", null, "2025-06-01"],
  ["Mona Rashad", "mona@imetsedu.com", "Marketing Manager", "Marketing Manager", "Marketing", "active", null, "2025-07-19"],
  ["Sara Adel", "sara@imetsedu.com", "Finance Officer", "Finance Officer", "Finance", "active", null, "2025-09-03"],
  ["Yousef Hany", "yousef@imetsedu.com", "Sales Counselor", "sales", "Sales", "pending", "2026-06-16", null],
  ["Huda Salem", "huda@imetsedu.com", "Instructor", "Instructor", "Faculty", "pending", "2026-06-18", null],
];

let users: UmUser[] = USER_SEED.map(([name, email, title, role, department, status, expiresAt, acceptedAt], i) => ({
  id: `umu_${i}`, name, email, title, role, department, status, expiresAt, acceptedAt, initials: initialsOf(name),
}));

let departments: UmDepartment[] = [
  { id: "umd_0", name: "Marketing", staff: 1, roles: 1, createdAt: "2026-06-14" },
  { id: "umd_1", name: "Sales", staff: 2, roles: 2, createdAt: "2026-05-02" },
  { id: "umd_2", name: "Finance", staff: 1, roles: 1, createdAt: "2026-04-21" },
  { id: "umd_3", name: "Management", staff: 1, roles: 1, createdAt: "2026-02-10" },
];

/** "Sales Team Leader" grants — exactly 21 of 51 (matches the reference screen). */
const SALES_LEAD_GRANTS = [
  "leads.view", "leads.create", "leads.edit", "leads.assign", "leads.import", "leads.note",
  "pipelines.view",
  "groups.view",
  "crmDashboard.view",
  "certificates.view", "certificates.upload",
  "studentsDir.view",
  "invoices.view", "invoices.create", "invoices.send", "invoices.pdf",
  "refunds.view", "refunds.change",
  "paymentTracking.view", "paymentTracking.remind", "paymentTracking.plan",
];

let roles: UmRole[] = [
  {
    id: "umr_0", name: "Sales Team Leader", custom: true, users: 0, risk: "elevated", riskScore: 32,
    granted: [...SALES_LEAD_GRANTS], updatedBy: "Admin User", updatedAt: "2026-06-10T18:16:41",
  },
  {
    id: "umr_1", name: "sales", custom: true, users: 0, risk: "low", riskScore: 6,
    granted: ["leads.view", "pipelines.view", "crmDashboard.view"], updatedBy: "Admin User", updatedAt: "2026-06-08T10:02:00",
  },
];

/* -------------------------------------------------------------------------- */
/*  Getters + actions                                                          */
/* -------------------------------------------------------------------------- */
export function getUsers() {
  return respond(users);
}

export function getStats(): Promise<UmStats> {
  const accepted = users.filter((u) => u.status !== "pending").length;
  const activeStaff = users.filter((u) => u.status === "active").length;
  const pendingInvites = users.filter((u) => u.status === "pending").length;
  return respond<UmStats>({ total: users.length, accepted, activeStaff, pendingInvites });
}

export const getDepartments = () => respond(departments);
export const getRoles = () => respond(roles);
export const getRegistry = () => respond(PERMISSION_REGISTRY);

export async function inviteUser(input: {
  name: string; title: string; email: string; phone: string; role: string; department: string;
}): Promise<UmUser> {
  await delay(400);
  const user: UmUser = {
    id: createId("umu"),
    name: input.name, email: input.email, title: input.title || "—",
    role: input.role, department: input.department || "—",
    status: "pending", expiresAt: "2026-06-16", acceptedAt: null, initials: initialsOf(input.name || input.email),
  };
  users = [user, ...users];
  return clone(user);
}

export async function createDepartment(input: { name: string }): Promise<UmDepartment> {
  await delay(300);
  const dept: UmDepartment = { id: createId("umd"), name: input.name, staff: 0, roles: 0, createdAt: "2026-06-14" };
  departments = [dept, ...departments];
  return clone(dept);
}

export async function createRole(input: { name: string }): Promise<UmRole> {
  await delay(300);
  const role: UmRole = {
    id: createId("umr"), name: input.name, custom: true, users: 0, risk: "low", riskScore: 0,
    granted: [], updatedBy: "Admin User", updatedAt: "2026-06-14T12:00:00",
  };
  roles = [role, ...roles];
  return clone(role);
}

export async function saveRole(input: { id: string; granted: string[] }): Promise<UmRole> {
  await delay(350);
  const role = roles.find((r) => r.id === input.id);
  if (!role) throw new Error("Role not found");
  role.granted = [...input.granted];
  role.riskScore = input.granted.length;
  role.risk = input.granted.length >= 30 ? "high" : input.granted.length >= 18 ? "elevated" : input.granted.length >= 8 ? "medium" : "low";
  role.updatedAt = "2026-06-14T12:00:00";
  return clone(role);
}
