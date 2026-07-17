export type InstructorApplicationStatus =
  | "new"
  | "reviewing"
  | "interview"
  | "accepted"
  | "rejected";

/** What the public form sends. */
export interface InstructorApplicationInput {
  fullName: string;
  email: string;
  phone?: string;
  country?: string;
  expertise: string;
  yearsExperience?: number;
  currentRole?: string;
  linkedIn?: string;
  topics?: string[];
  bio: string;
  cvUrl?: string;
}

/** What the admin list returns. */
export interface InstructorApplicationDto extends InstructorApplicationInput {
  _id: string;
  status: InstructorApplicationStatus;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}
