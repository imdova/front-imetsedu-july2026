import { LoginFormValues } from "@integration/lib/validations/login.schema";
import { SignupFormValues } from "@integration/lib/validations/signup.schema";

export interface LoginResponse {
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: "user" | "admin";
  };
  access_token: string;
  refresh_token: string;
}

export type StaffRolePermissions = Record<string, boolean>;

export interface StaffRole {
  _id: string;
  title: string;
  permissions: StaffRolePermissions;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  access_token: string;
  refresh_token: string;
  staffRole?: StaffRole | null;
  avatarUrl?: string;
}

export type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated";

export interface AuthState {
  user: User | null;
  status: AuthStatus;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (data: LoginFormValues) => Promise<void>;
  signup: (data: SignupFormValues) => Promise<void>;
  logout: () => Promise<void>;
}