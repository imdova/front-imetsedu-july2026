/**
 * Data Access Layer barrel. UI code imports domain functions from here, e.g.
 *   import { dal } from "@/lib/dal";
 *   const res = await dal.courses.fetchCourses();
 */
import * as courses from "./courses";
import * as lookups from "./lookups";
import * as dashboard from "./dashboard";
import * as platform from "./platform";
import * as crm from "./crm";
import * as finance from "./finance";
import * as student from "./student";
import * as admin from "./admin";
import * as instructor from "./instructor";
import * as courseTaxonomy from "./course-taxonomy";
import * as lms from "./lms";
import * as groups from "./groups";
import * as userManagement from "./user-management";
import * as studentsMgmt from "./students-mgmt";
import * as notificationsAdmin from "./notifications-admin";
import * as siteSettings from "./site-settings";
import * as auth from "./auth";
import * as upload from "./upload";
import * as quizzes from "./quizzes";
import * as marketing from "./marketing";
import * as landing from "./landing";
import * as emailMarketing from "./email-marketing";
import * as seo from "./seo";
import * as blog from "./blog";
import * as messageTemplates from "./message-templates";
import * as pricing from "./pricing";
import * as paymentMethods from "./payment-methods";
import * as importantLinks from "./important-links";
import * as instructorApplications from "./instructor-applications";
import * as crmRules from "./crm-rules";
import * as paymentLinks from "./payment-links";
import * as shipments from "./shipments";
import * as freeCourses from "./free-courses";
import * as registrationSheets from "./registration-sheets";
import * as commission from "./commission";
import * as studentReviews from "./student-reviews";
import * as invoiceTemplate from "./invoice-template";
import * as transactionalEmail from "./transactional-email";

export const dal = { courses, lookups, dashboard, platform, crm, finance, student, admin, instructor, courseTaxonomy, lms, groups, userManagement, studentsMgmt, notificationsAdmin, siteSettings, auth, upload, quizzes, marketing, landing, emailMarketing, seo, blog, messageTemplates, pricing, paymentMethods, importantLinks, instructorApplications, crmRules, paymentLinks, shipments, freeCourses, registrationSheets, commission, studentReviews, invoiceTemplate, transactionalEmail };

export type { Result } from "@integration/lib/api-client";
