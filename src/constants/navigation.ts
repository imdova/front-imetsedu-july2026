/**
 * Navigation models per area. Kept as data (not JSX) so sidebars/headers stay
 * pure renderers and links are reusable for breadcrumbs / command palette.
 * `labelKey` / `titleKey` reference the `Nav` message namespace.
 *
 * Areas: public (marketing) · /admin (console) · /staff (CRM/finance/teaching)
 * · /student (portal). Admin pages live under the real `/admin` segment so the
 * public catalog can own `/courses`.
 */
export interface NavItem {
  titleKey: string;
  href: string;
  icon: string; // lucide icon name, resolved in the sidebar
  badge?: string;
  /**
   * If set, the item is only shown when the user has AT LEAST ONE of these
   * permission keys (mirrors old codebase AdminSidebarPanel hasAccess logic).
   */
  requiredPermissions?: string[];
  /**
   * If true, the item is hidden from any user who HAS a staffRole
   * (i.e. it is reserved for super-admins only).
   */
  adminOnly?: boolean;
}

export interface NavSection {
  labelKey: string;
  items: NavItem[];
}

export const ADMIN_NAV: NavSection[] = [
  {
    labelKey: "sectionOverview",
    items: [
      { titleKey: "dashboard", href: "/admin/dashboard", icon: "LayoutDashboard" },
    ],
  },
  {
    labelKey: "sectionCrm",
    items: [
      { titleKey: "crmDashboard", href: "/admin/crm", icon: "LayoutDashboard", requiredPermissions: ["crm.dashboard.view"] },
      { titleKey: "leads", href: "/admin/crm/leads", icon: "Target", requiredPermissions: ["crm.leads.view"] },
      { titleKey: "pipeline", href: "/admin/crm/pipeline", icon: "KanbanSquare", requiredPermissions: ["crm.pipelines.view"] },
      { titleKey: "allPipelines", href: "/admin/crm/pipelines", icon: "GitBranch", requiredPermissions: ["crm.pipelines.view"] },
      { titleKey: "paymentTracking", href: "/admin/crm/payment-tracking", icon: "Wallet", requiredPermissions: ["finance.payment_tracking.view"] },
      { titleKey: "invoices", href: "/admin/crm/invoices", icon: "ReceiptText", requiredPermissions: ["finance.invoices.view"] },
      { titleKey: "crmSettings", href: "/admin/crm/settings", icon: "SlidersHorizontal", adminOnly: true },
    ],
  },
  {
    labelKey: "sectionCourses",
    items: [
      { titleKey: "courses", href: "/admin/courses", icon: "GraduationCap", requiredPermissions: ["lms.courses.view"] },
      { titleKey: "newCourse", href: "/admin/courses/new", icon: "Plus", requiredPermissions: ["lms.courses.create"] },
      { titleKey: "registrations", href: "/admin/courses/registrations", icon: "UserPlus", requiredPermissions: ["lms.courses.view"] },
      { titleKey: "courseSettings", href: "/admin/courses/settings", icon: "SlidersHorizontal", adminOnly: true },
    ],
  },
  {
    labelKey: "sectionLms",
    items: [
      { titleKey: "lms", href: "/admin/lms", icon: "Play", requiredPermissions: ["lms.courses.view"] },
      { titleKey: "lmsSettings", href: "/admin/lms/settings", icon: "SlidersHorizontal", adminOnly: true },
    ],
  },
  {
    labelKey: "sectionGroups",
    items: [
      { titleKey: "groups", href: "/admin/groups", icon: "UsersRound", requiredPermissions: ["crm.groups.view"] },
      { titleKey: "groupSettings", href: "/admin/groups/settings", icon: "SlidersHorizontal", adminOnly: true },
    ],
  },
  {
    labelKey: "sectionAssessment",
    items: [
      { titleKey: "quizzes", href: "/admin/quizzes", icon: "ListChecks", adminOnly: true },
      { titleKey: "assignments", href: "/admin/assignments", icon: "ClipboardList", adminOnly: true },
      { titleKey: "certificates", href: "/admin/certificates", icon: "Award", requiredPermissions: ["lms.certificates.view"] },
      { titleKey: "events", href: "/admin/events", icon: "CalendarDays", adminOnly: true },
    ],
  },
  {
    labelKey: "sectionUsers",
    items: [
      { titleKey: "users", href: "/admin/users", icon: "UserCog", adminOnly: true },
      { titleKey: "roles", href: "/admin/users/roles", icon: "ShieldCheck", adminOnly: true },
    ],
  },
  {
    labelKey: "sectionPeople",
    items: [
      { titleKey: "students", href: "/admin/students", icon: "GraduationCap", requiredPermissions: ["students.directory.view"] },
      { titleKey: "instructors", href: "/admin/instructors", icon: "Users", adminOnly: true },
    ],
  },
  {
    labelKey: "sectionTransactions",
    items: [
      { titleKey: "transactions", href: "/admin/transactions", icon: "Wallet", requiredPermissions: ["finance.refunds.view", "finance.invoices.view"] },
      { titleKey: "payments", href: "/admin/payments", icon: "CreditCard", requiredPermissions: ["finance.invoices.view"] },
      { titleKey: "refunds", href: "/admin/refunds", icon: "Undo2", requiredPermissions: ["finance.refunds.view"] },
    ],
  },
  {
    labelKey: "sectionAdministration",
    items: [
      { titleKey: "notifications", href: "/admin/notifications", icon: "Bell" },
      { titleKey: "whatsapp", href: "/admin/whatsapp-templates", icon: "Mail", adminOnly: true },
      { titleKey: "settings", href: "/admin/settings", icon: "Settings", adminOnly: true },
      { titleKey: "reports", href: "/admin/reports", icon: "ChartLine", adminOnly: true },
    ],
  },
];


export const STUDENT_NAV: NavSection[] = [
  {
    labelKey: "sectionLearning",
    items: [
      { titleKey: "dashboard", href: "/student/dashboard", icon: "LayoutDashboard" },
      { titleKey: "myCourses", href: "/student/courses", icon: "GraduationCap" },
      { titleKey: "assignments", href: "/student/assignments", icon: "ClipboardList" },
      { titleKey: "schedule", href: "/student/schedule", icon: "CalendarDays" },
      { titleKey: "grades", href: "/student/grades", icon: "ListChecks" },
      { titleKey: "transcript", href: "/student/transcript", icon: "FileText" },
    ],
  },
  {
    labelKey: "sectionAccount",
    items: [
      { titleKey: "certificates", href: "/student/certificates", icon: "Award" },
      { titleKey: "favorites", href: "/student/favorites", icon: "Heart" },
      { titleKey: "billing", href: "/student/billing", icon: "ReceiptText" },
      { titleKey: "payments", href: "/student/installments", icon: "Coins" },
      { titleKey: "paymentMethods", href: "/student/payment-methods", icon: "CreditCard" },
      { titleKey: "notifications", href: "/student/notifications", icon: "Bell" },
      { titleKey: "profile", href: "/student/profile", icon: "UserCog" },
      { titleKey: "settings", href: "/student/settings", icon: "Settings" },
    ],
  },
];

export const STAFF_NAV: NavSection[] = [
  {
    labelKey: "sectionCrm",
    items: [
      { titleKey: "crmDashboard", href: "/staff/crm", icon: "LayoutDashboard" },
      { titleKey: "myLeads", href: "/staff/leads", icon: "Target" },
      { titleKey: "pipeline", href: "/staff/pipeline", icon: "KanbanSquare" },
      { titleKey: "followUps", href: "/staff/follow-ups", icon: "CalendarDays" },
    ],
  },
  {
    labelKey: "sectionFinance",
    items: [
      { titleKey: "invoices", href: "/staff/invoices", icon: "ReceiptText" },
      { titleKey: "payments", href: "/staff/payments", icon: "CreditCard" },
      { titleKey: "refunds", href: "/staff/refunds", icon: "Undo2" },
    ],
  },
  {
    labelKey: "sectionWorkspace",
    items: [
      { titleKey: "myGroups", href: "/staff/my-groups", icon: "Users" },
      { titleKey: "notifications", href: "/staff/notifications", icon: "Bell" },
      { titleKey: "profile", href: "/staff/profile", icon: "UserCog" },
      { titleKey: "settings", href: "/staff/settings", icon: "Settings" },
    ],
  },
];

export const INSTRUCTOR_NAV: NavSection[] = [
  {
    labelKey: "sectionTeaching",
    items: [
      { titleKey: "dashboard", href: "/instructor/dashboard", icon: "LayoutDashboard" },
      { titleKey: "myCourses", href: "/instructor/courses", icon: "GraduationCap" },
      { titleKey: "quizzes", href: "/instructor/quizzes", icon: "ListChecks" },
      { titleKey: "events", href: "/instructor/events", icon: "CalendarDays" },
    ],
  },
  {
    labelKey: "sectionAnalytics",
    items: [
      { titleKey: "analytics", href: "/instructor/analytics", icon: "ChartLine" },
      { titleKey: "earnings", href: "/instructor/earnings", icon: "Wallet" },
    ],
  },
  {
    labelKey: "sectionWorkspace",
    items: [
      { titleKey: "profile", href: "/instructor/profile", icon: "UserCog" },
      { titleKey: "settings", href: "/instructor/settings", icon: "Settings" },
    ],
  },
];

/** Public marketing header links. */
export const PUBLIC_NAV: NavItem[] = [
  { titleKey: "navHome", href: "/", icon: "Home" },
  { titleKey: "navCourses", href: "/courses", icon: "GraduationCap" },
  { titleKey: "navInstructors", href: "/instructors", icon: "Users" },
  { titleKey: "navBlog", href: "/blog", icon: "Newspaper" },
  { titleKey: "navContact", href: "/contact", icon: "Mail" },
];

export const BRAND = {
  name: "IMETS",
  fullName: "IMETS School of Business",
} as const;
