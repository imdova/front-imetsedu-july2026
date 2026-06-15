import { api, ok, type Result } from "@integration/services/http/client";
import { API_ROLES, apiRoleById } from "@integration/constants/api/roles";
import type { StaffRole, CreateRoleInput, UpdateRoleInput } from "./types";

interface StaffRoleRaw {
  _id?: string;
  id?: string;
  title: string;
  department?: string | { _id?: string; id?: string; name?: string };
  description?: string;
  permissions?: Record<string, boolean>;
  createdAt: string;
  updatedAt?: string;
}

function deptId(dept?: string | { _id?: string; id?: string; name?: string }): string {
  if (!dept) return "";
  if (typeof dept === "string") return dept;
  return dept._id ?? dept.id ?? "";
}

function deptName(dept?: string | { _id?: string; id?: string; name?: string }): string {
  if (!dept) return "";
  if (typeof dept === "string") return dept;
  return dept.name ?? "";
}

function normalize(raw: StaffRoleRaw): StaffRole {
  return {
    id: raw._id ?? raw.id ?? "",
    title: raw.title,
    departmentId: deptId(raw.department),
    departmentName: deptName(raw.department),
    description: raw.description ?? "",
    permissions: raw.permissions ?? {},
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export async function listStaffRoles(departmentId?: string): Promise<Result<StaffRole[]>> {
  const params: Record<string, string> | undefined = departmentId ? { department: departmentId } : undefined;
  const result = await api.get<StaffRoleRaw[] | { data: StaffRoleRaw[] }>(API_ROLES, params ? { params } : undefined);
  if (!result.ok) return result;
  const items = Array.isArray(result.data) ? result.data : (result.data.data ?? []);
  return ok(items.map(normalize));
}

export async function getStaffRoleById(id: string): Promise<Result<StaffRole>> {
  const result = await api.get<StaffRoleRaw>(apiRoleById(id));
  if (!result.ok) return result;
  return ok(normalize(result.data));
}

export async function createStaffRole(input: CreateRoleInput): Promise<Result<StaffRole>> {
  const result = await api.post<StaffRoleRaw>(API_ROLES, input);
  if (!result.ok) return result;
  return ok(normalize(result.data));
}

export async function updateStaffRole(id: string, input: UpdateRoleInput): Promise<Result<StaffRole>> {
  const result = await api.patch<StaffRoleRaw>(apiRoleById(id), input);
  if (!result.ok) return result;
  return ok(normalize(result.data));
}

export async function deleteStaffRole(id: string): Promise<Result<void>> {
  return api.delete<void>(apiRoleById(id));
}
