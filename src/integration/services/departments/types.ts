export interface Department {
  id: string;
  name: string;
  staffCount: number;
  rolesCount: number;
  createdAt: string;
}

export interface CreateDepartmentInput {
  name: string;
}

export interface UpdateDepartmentInput {
  name: string;
}
