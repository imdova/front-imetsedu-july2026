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
      { titleKey: "crmDashboard", href: "/admin/crm", icon: "LayoutDashboard" },
      { titleKey: "leads", href: "/admin/crm/leads", icon: "Target" },
      { titleKey: "pipeline", href: "/admin/crm/pipeline", icon: "KanbanSquare" },
      { titleKey: "allPipelines", href: "/admin/crm/pipelines", icon: "GitBranch" },
      { titleKey: "paymentTracking", href: "/admin/crm/payment-tracking", icon: "Wallet" },
      { titleKey: "invoices", href: "/admin/crm/invoices", icon: "ReceiptText" },
      { titleKey: "crmSettings", href: "/admin/crm/settings", icon: "SlidersHorizontal" },
    ],
  },
  {
    labelKey: "sectionCourses",
    items: [
      { titleKey: "courses", href: "/admin/courses", icon: "GraduationCap" },
      { titleKey: "newCourse", href: "/admin/courses/new", icon: "Plus" },
      { titleKey: "registrations", href: "/admin/courses/registrations", icon: "UserPlus" },
      { titleKey: "courseSettings", href: "/admin/courses/settings", icon: "SlidersHorizontal" },
    ],
  },
  {
    labelKey: "sectionLms",
    items: [
      { titleKey: "lms", href: "/admin/lms", icon: "Play" },
      { titleKey: "lmsSettings", href: "/admin/lms/settings", icon: "SlidersHorizontal" },
    ],
  },
  {
    labelKey: "sectionGroups",
    items: [
      { titleKey: "groups", href: "/admin/groups", icon: "UsersRound" },
      { titleKey: "groupSettings", href: "/admin/groups/settings", icon: "SlidersHorizontal" },
    ],
  },
  {
    labelKey: "sectionAssessment",
    items: [
      { titleKey: "quizzes", href: "/admin/quizzes", icon: "ListChecks" },
      { titleKey: "assignments", href: "/admin/assignments", icon: "ClipboardList" },
      { titleKey: "certificates", href: "/admin/certificates", icon: "Award" },
      { titleKey: "events", href: "/admin/events", icon: "CalendarDays" },
    ],
  },
  {
    labelKey: "sectionUsers",
    items: [
      { titleKey: "users", href: "/admin/users", icon: "UserCog" },
      { titleKey: "roles", href: "/admin/users/roles", icon: "ShieldCheck" },
    ],
  },
  {
    labelKey: "sectionPeople",
    items: [
      { titleKey: "students", href: "/admin/students", icon: "GraduationCap" },
      { titleKey: "instructors", href: "/admin/instructors", icon: "Users" },
    ],
  },
  {
    labelKey: "sectionTransactions",
    items: [
      { titleKey: "transactions", href: "/admin/transactions", icon: "Wallet" },
      { titleKey: "payments", href: "/admin/payments", icon: "CreditCard" },
      { titleKey: "refunds", href: "/admin/refunds", icon: "Undo2" },
    ],
  },
  {
    labelKey: "sectionAdministration",
    items: [
      { titleKey: "notifications", href: "/admin/notifications", icon: "Bell" },
      { titleKey: "whatsapp", href: "/admin/whatsapp-templates", icon: "Mail" },
      { titleKey: "settings", href: "/admin/settings", icon: "Settings" },
      { titleKey: "reports", href: "/admin/reports", icon: "ChartLine" },
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
