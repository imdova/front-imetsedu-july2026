/**
 * IMETS Integration — public barrel.
 *
 * Each domain is exported as a namespace to avoid symbol collisions
 * (many service folders export their own `types`). Import like:
 *
 *   import { configureApiClient, courses, leads, auth } from "@imets/integration";
 *   const res = await courses.listCourses();
 */

// Core transport + configuration
export { api, ok, fail, toMessage, configureApiClient } from "@integration/lib/api-client";
export type { Result } from "@integration/lib/api-client";

// Consolidated endpoint catalogs
export * as endpoints from "./endpoints";

// Domain service namespaces
export * as assignments from "./services/assignments";
export * as auth from "./services/auth";
export * as categories from "./services/categories";
export * as certificates from "./services/certificates";
export * as courseVariables from "./services/course-variables";
export * as courses from "./services/courses";
export * as crmSettings from "./services/crm-settings";
export * as dashboard from "./services/dashboard";
export * as departments from "./services/departments";
export * as emailTemplates from "./services/email-templates";
export * as groupCategories from "./services/group-categories";
export * as groupSubCategories from "./services/group-sub-categories";
export * as groups from "./services/groups";
export * as instructors from "./services/instructors";
export * as invitations from "./services/invitations";
export * as invoices from "./services/invoices";
export * as leads from "./services/leads";
export * as lmsCategories from "./services/lms-categories";
export * as lmsCourses from "./services/lms-courses";
export * as lmsSubCategories from "./services/lms-sub-categories";
export * as notifications from "./services/notifications";
export * as payments from "./services/payments";
export * as quizzes from "./services/quizzes";
export * as refunds from "./services/refunds";
export * as roles from "./services/roles";
export * as schedule from "./services/schedule";
export * as studentCertificates from "./services/student-certificates";
export * as studentCourses from "./services/student-courses";
export * as studentDashboard from "./services/student-dashboard";
export * as studentNotifications from "./services/student-notifications";
export * as students from "./services/students";
export * as subCategories from "./services/sub-categories";
export * as tags from "./services/tags";
export * as upload from "./services/upload";
