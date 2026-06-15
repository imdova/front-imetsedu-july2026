export type UserRole = "admin" | "instructor" | "student";
export type UserStatus = "active" | "pending" | "suspended";

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
  createdAt: string;
  lastLoginAt: string | null;
}
