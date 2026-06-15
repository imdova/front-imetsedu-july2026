/**
 * Admin-modules DAL — instructors, taxonomy, groups, registrations,
 * certificates, people (users/roles/departments/invitations) and assessment.
 */
import { ok, fail, toMessage, api, type Result } from "@integration/lib/api-client";
import * as coursesSvc from "@integration/services/courses";
import * as certificatesSvc from "@integration/services/certificates";
import * as studentsSvc from "@integration/services/students";
import * as db from "@/lib/db/admin";
import { mapRegistration } from "@/lib/courses/map-registration";
import { mapInstructor, mapAdminCertificate } from "@/lib/admin/map-misc";

const toArr = <T>(x: unknown): T[] => (Array.isArray(x) ? (x as T[]) : ((x as { data?: T[] })?.data ?? []));

async function wrap<T>(fn: () => Promise<T>, msg: string): Promise<Result<T>> {
  try {
    return ok(await fn());
  } catch (err) {
    return fail(toMessage(err, msg));
  }
}

/** LIVE: instructors from GET /instructors (public). */
export const fetchInstructors = async (): Promise<Result<db.Instructor[]>> => {
  const res = await api.get<unknown>("/instructors", { params: { limit: 200 }, requireAuth: false });
  if (!res.ok) return res;
  try {
    return ok(toArr<any>(res.data).map(mapInstructor));
  } catch (err) {
    return fail(toMessage(err, "Failed to load instructors"));
  }
};
export const fetchCategories = () => wrap(db.getCategories, "Failed to load categories");
export const fetchTags = () => wrap(db.getTags, "Failed to load tags");
export const fetchGroups = () => wrap(db.getGroups, "Failed to load groups");

/** LIVE: course registrations from GET /courses/registrations, mapped. */
export const fetchRegistrations = async (): Promise<Result<db.Registration[]>> => {
  const res = await coursesSvc.listCourseRegistrations({ limit: 200 });
  if (!res.ok) return res;
  try {
    const rows: unknown[] = (res.data as { data?: unknown[] })?.data ?? [];
    return ok(rows.map(mapRegistration));
  } catch (err) {
    return fail(toMessage(err, "Failed to load registrations"));
  }
};
/** LIVE: certificates from GET /certificates. */
export const fetchCertificates = async (): Promise<Result<db.AdminCertificate[]>> => {
  const res = await certificatesSvc.listCertificates({ limit: 200 });
  if (!res.ok) return res;
  try {
    return ok(toArr<any>(res.data).map(mapAdminCertificate));
  } catch (err) {
    return fail(toMessage(err, "Failed to load certificates"));
  }
};
export const fetchUsers = () => wrap(db.getUsers, "Failed to load users");
export const fetchInvitations = () => wrap(db.getInvitations, "Failed to load invitations");
export const fetchRoles = () => wrap(db.getRoles, "Failed to load roles");
export const fetchDepartments = () => wrap(db.getDepartments, "Failed to load departments");
export const fetchQuizzes = () => wrap(db.getQuizzes, "Failed to load quizzes");
export const fetchAssignments = () => wrap(db.getAssignments, "Failed to load assignments");
export const fetchAssignment = (id: string) => wrap(() => db.getAssignmentById(id), "Failed to load assignment");
export const fetchGroup = (id: string) => wrap(() => db.getGroupById(id), "Failed to load group");
export const fetchQuiz = (id: string) => wrap(() => db.getQuizById(id), "Failed to load quiz");
/** LIVE: students directory from GET /students, mapped to the admin UI shape. */
const mapStudent = (raw: any): db.AdminStudent => ({
  id: raw?._id ?? raw?.id ?? "",
  name: raw?.name ?? (`${raw?.firstName ?? ""} ${raw?.lastName ?? ""}`.trim() || "—"),
  email: raw?.email ?? "",
  phone: raw?.phone ?? raw?.number ?? "—",
  enrolled: Array.isArray(raw?.groups) ? raw.groups.length : (raw?.enrolledCount ?? raw?.coursesCount ?? 0),
  status: raw?.isActive === false ? "inactive" : "active",
  joinedAt: String(raw?.createdAt ?? "").slice(0, 10) || "—",
  totalSpent: raw?.totalSpent ?? 0,
});
export const fetchStudents = async (): Promise<Result<db.AdminStudent[]>> => {
  const res = await studentsSvc.getStudents();
  if (!res.ok) return res;
  try {
    return ok(toArr<any>(res.data).map(mapStudent));
  } catch (err) {
    return fail(toMessage(err, "Failed to load students"));
  }
};
export const fetchStudent = (id: string) => wrap(() => db.getStudentById(id), "Failed to load student");
// No backend endpoint for these yet — return empty so no seed/dummy data is
// shown. They go live the moment the backend exposes the routes.
export const fetchTransactions = (): Promise<Result<db.Transaction[]>> => Promise.resolve(ok([]));
export const fetchPayouts = (): Promise<Result<db.InstructorPayout[]>> => Promise.resolve(ok([]));
export const fetchEvents = (): Promise<Result<db.AdminEvent[]>> => Promise.resolve(ok([]));
export const fetchBroadcasts = () => wrap(db.getBroadcasts, "Failed to load notifications");
export const fetchWhatsappTemplates = (): Promise<Result<db.WhatsappTemplate[]>> => Promise.resolve(ok([]));
export const fetchLmsContent = () => wrap(db.getLmsContent, "Failed to load LMS content");
export const fetchInstructor = (id: string) => wrap(() => db.getInstructorById(id), "Failed to load instructor");
export const fetchUser = (id: string) => wrap(() => db.getUserById(id), "Failed to load user");

export const createInstructor = (i: Parameters<typeof db.createInstructor>[0]) => wrap(() => db.createInstructor(i), "Failed to create instructor");
export const createCategory = (i: Parameters<typeof db.createCategory>[0]) => wrap(() => db.createCategory(i), "Failed to create category");
export const createTag = (i: Parameters<typeof db.createTag>[0]) => wrap(() => db.createTag(i), "Failed to create tag");
export const inviteUser = (i: Parameters<typeof db.inviteUser>[0]) => wrap(() => db.inviteUser(i), "Failed to invite user");
export const issueCertificate = (i: Parameters<typeof db.issueCertificate>[0]) => wrap(() => db.issueCertificate(i), "Failed to issue certificate");

/** LIVE: issue a certificate for a lead (POST /certificates). The backend
 * resolves studentName/userId from the lead; only leadId + link are required. */
export const createCertificate = async (input: {
  leadId: string; certificateLink: string; groupId?: string; lmsId?: string;
}): Promise<Result<db.AdminCertificate>> => {
  const res = await certificatesSvc.createCertificate(input);
  if (!res.ok) return res;
  try {
    return ok(mapAdminCertificate(res.data));
  } catch (err) {
    return fail(toMessage(err, "Failed to issue certificate"));
  }
};

/** LIVE: delete a certificate (DELETE /certificates/:id). */
export const deleteCertificate = (id: string): Promise<Result<void>> =>
  certificatesSvc.deleteCertificate(id);
