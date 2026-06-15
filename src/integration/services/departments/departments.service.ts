import { api, ok, type Result } from "@integration/services/http/client";
import { API_DEPARTMENTS, apiDepartmentById } from "@integration/constants/api/departments";
import type { Department, CreateDepartmentInput, UpdateDepartmentInput } from "./types";

interface DepartmentRaw {
  _id?: string;
  id?: string;
  name: string;
  staffCount?: number;
  rolesCount?: number;
  createdAt: string;
}

function normalize(raw: DepartmentRaw): Department {
  return {
    id: raw._id ?? raw.id ?? "",
    name: raw.name,
    staffCount: raw.staffCount ?? 0,
    rolesCount: raw.rolesCount ?? 0,
    createdAt: raw.createdAt,
  };
}

export async function listDepartments(): Promise<Result<Department[]>> {
  const result = await api.get<DepartmentRaw[] | { data: DepartmentRaw[] }>(API_DEPARTMENTS);
  if (!result.ok) return result;
  const items = Array.isArray(result.data) ? result.data : (result.data.data ?? []);
  return ok(items.map(normalize));
}

export async function getDepartmentById(id: string): Promise<Result<Department>> {
  const result = await api.get<DepartmentRaw>(apiDepartmentById(id));
  if (!result.ok) return result;
  return ok(normalize(result.data));
}

export async function createDepartment(input: CreateDepartmentInput): Promise<Result<Department>> {
  const result = await api.post<DepartmentRaw>(API_DEPARTMENTS, input);
  if (!result.ok) return result;
  return ok(normalize(result.data));
}

export async function updateDepartment(id: string, input: UpdateDepartmentInput): Promise<Result<Department>> {
  const result = await api.patch<DepartmentRaw>(apiDepartmentById(id), input);
  if (!result.ok) return result;
  return ok(normalize(result.data));
}

export async function deleteDepartment(id: string): Promise<Result<void>> {
  return api.delete<void>(apiDepartmentById(id));
}
