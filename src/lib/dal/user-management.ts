/** User-management DAL — staff directory, stats, departments, roles (RBAC) and
 * the invitation lifecycle. Everything except the permission *registry*
 * (a frontend catalog, no backend equivalent) is now wired LIVE. */
import { ok, fail, toMessage, api, type Result } from "@integration/lib/api-client";
import * as rolesSvc from "@integration/services/roles";
import * as db from "@/lib/db/user-management";
import type { UmUser, UmStats, UmDepartment, UmRole } from "@/lib/db/user-management";
import type { UserDetail } from "@/lib/db/admin";
import {
  mapStaff, computeUmStats, mapDepartment, mapRole, grantedToPermissions,
} from "@/lib/admin/map-user-mgmt";

async function wrap<T>(fn: () => Promise<T>, msg: string): Promise<Result<T>> {
  try {
    return ok(await fn());
  } catch (err) {
    return fail(toMessage(err, msg));
  }
}

const arr = <T>(x: unknown): T[] => (Array.isArray(x) ? (x as T[]) : ((x as { data?: T[] })?.data ?? []));
const one = <T>(x: unknown): T => ((x as { data?: T })?.data ?? x) as T;

/* ───────────────────────── Staff directory ───────────────────────── */

/** LIVE: staff directory from GET /user-management/staff. */
export const fetchUmUsers = async (): Promise<Result<UmUser[]>> => {
  const res = await api.get<unknown>("/user-management/staff", { params: { limit: 200 } });
  if (!res.ok) return res;
  try {
    return ok(arr<any>(res.data).map(mapStaff));
  } catch (err) {
    return fail(toMessage(err, "Failed to load users"));
  }
};

export const fetchUmStats = async (): Promise<Result<UmStats>> => {
  const res = await api.get<unknown>("/user-management/staff", { params: { limit: 200 } });
  if (!res.ok) return res;
  try {
    return ok(computeUmStats(arr<any>(res.data).map(mapStaff)));
  } catch (err) {
    return fail(toMessage(err, "Failed to load user stats"));
  }
};

/** LIVE: single staff member shaped for the detail page. */
export const fetchUmUser = async (id: string): Promise<Result<UserDetail>> => {
  const res = await api.get<unknown>(`/user-management/staff/${id}`);
  if (!res.ok) return res;
  try {
    const raw = one<any>(res.data);
    const u = mapStaff(raw);
    const detail: UserDetail = {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      department: u.department,
      status: u.status === "pending" ? "invited" : u.status,
      lastActive: u.acceptedAt ?? "—",
      initials: u.initials,
      phone: u.phone || "—",
      joinedAt: u.acceptedAt ?? "—",
      activity: [],
    };
    return ok(detail);
  } catch (err) {
    return fail(toMessage(err, "Failed to load user"));
  }
};

/** LIVE staff lifecycle actions. */
export const activateUmUser = (id: string): Promise<Result<void>> =>
  api.patch<void>(`/user-management/staff/${id}/activate`, {});
export const deactivateUmUser = (id: string): Promise<Result<void>> =>
  api.patch<void>(`/user-management/staff/${id}/deactivate`, {});
export const deleteUmUser = (id: string): Promise<Result<void>> =>
  api.delete<void>(`/user-management/staff/${id}`);

/* ───────────────────────── Departments ───────────────────────── */

/** LIVE: departments from GET /user-management/departments. */
export const fetchUmDepartments = async (): Promise<Result<UmDepartment[]>> => {
  const res = await api.get<unknown>("/user-management/departments");
  if (!res.ok) return res;
  try {
    return ok(arr<any>(res.data).map(mapDepartment));
  } catch (err) {
    return fail(toMessage(err, "Failed to load departments"));
  }
};

export const createUmDepartment = async (input: { name: string }): Promise<Result<UmDepartment>> => {
  const res = await api.post<unknown>("/user-management/departments", input);
  if (!res.ok) return res;
  return ok(mapDepartment(one<any>(res.data)));
};

export const renameUmDepartment = async (id: string, name: string): Promise<Result<UmDepartment>> => {
  const res = await api.patch<unknown>(`/user-management/departments/${id}`, { name });
  if (!res.ok) return res;
  return ok(mapDepartment(one<any>(res.data)));
};

export const deleteUmDepartment = (id: string): Promise<Result<void>> =>
  api.delete<void>(`/user-management/departments/${id}`);

/* ───────────────────────── Roles (RBAC) ───────────────────────── */

/** LIVE: staff roles, mapped to the UI role shape (permissions → granted ids). */
export const fetchUmRoles = async (): Promise<Result<UmRole[]>> => {
  const res = await rolesSvc.listStaffRoles();
  if (!res.ok) return res;
  try {
    return ok(res.data.map(mapRole));
  } catch (err) {
    return fail(toMessage(err, "Failed to load roles"));
  }
};

export const createUmRole = async (input: {
  name: string; department: string; description?: string; granted?: string[];
}): Promise<Result<UmRole>> => {
  const res = await rolesSvc.createStaffRole({
    title: input.name,
    department: input.department,
    description: input.description,
    permissions: input.granted ? grantedToPermissions(input.granted) : {},
  });
  if (!res.ok) return res;
  return ok(mapRole(res.data));
};

export const saveUmRole = async (input: {
  id: string; granted: string[]; name?: string; department?: string; description?: string;
}): Promise<Result<UmRole>> => {
  const res = await rolesSvc.updateStaffRole(input.id, {
    permissions: grantedToPermissions(input.granted),
    ...(input.name ? { title: input.name } : {}),
    ...(input.department ? { department: input.department } : {}),
    ...(input.description !== undefined ? { description: input.description } : {}),
  });
  if (!res.ok) return res;
  return ok(mapRole(res.data));
};

export const deleteUmRole = (id: string): Promise<Result<void>> =>
  rolesSvc.deleteStaffRole(id);

/* ───────────────────────── Invitations ───────────────────────── */

export const inviteUmUser = async (input: {
  name: string; title?: string; email: string; phone?: string; role: string; department: string;
}): Promise<Result<{ email: string }>> => {
  const res = await api.post<unknown>("/user-management/invitations", {
    fullName: input.name,
    email: input.email,
    role: input.role,
    department: input.department,
    ...(input.title ? { title: input.title } : {}),
    ...(input.phone ? { phone: input.phone } : {}),
  });
  if (!res.ok) return res;
  return ok({ email: input.email });
};

export const resendUmInvite = (invitationId: string): Promise<Result<void>> =>
  api.patch<void>(`/user-management/invitations/${invitationId}/resend`, {});
export const cancelUmInvite = (invitationId: string): Promise<Result<void>> =>
  api.patch<void>(`/user-management/invitations/${invitationId}/cancel`, {});
export const deleteUmInvite = (invitationId: string): Promise<Result<void>> =>
  api.delete<void>(`/user-management/invitations/${invitationId}`);

/* ───────────────────────── Registry (frontend catalog) ───────────────────────── */
// No backend endpoint — the permission registry is defined in the frontend.
export const fetchUmRegistry = () => wrap(db.getRegistry, "Failed to load permission registry");
