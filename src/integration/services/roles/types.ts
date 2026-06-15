export interface StaffRole {
  id: string;
  title: string;
  departmentId: string;
  departmentName: string;
  description: string;
  permissions: Record<string, boolean>;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateRoleInput {
  title: string;
  department: string;
  description?: string;
  permissions?: Record<string, boolean>;
}

export interface UpdateRoleInput {
  title?: string;
  department?: string;
  description?: string;
  permissions?: Record<string, boolean>;
}
