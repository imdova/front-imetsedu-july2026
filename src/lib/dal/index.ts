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

export const dal = { courses, lookups, dashboard, platform, crm, finance, student, admin, instructor, courseTaxonomy, lms, groups, userManagement, studentsMgmt, notificationsAdmin, siteSettings, auth, upload, quizzes, marketing, landing, emailMarketing, seo, blog };

export type { Result } from "@integration/lib/api-client";
