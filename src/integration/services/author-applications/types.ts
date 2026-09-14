export type AuthorApplicationStatus = "new" | "reviewing" | "accepted" | "rejected";

/** What the public "Write for IMETS" form sends. */
export interface AuthorApplicationInput {
  fullName: string;
  email: string;
  /** International format, e.g. "+201008815007". */
  whatsapp: string;
  nationality: string;
  profession: string;
  jobTitle: string;
  bio: string;
  /** Blog topic names picked from the taxonomy. */
  interests?: string[];
  /** Honeypot — always empty from a real browser. */
  website?: string;
}

/** What the admin list returns. */
export interface AuthorApplicationDto extends Omit<AuthorApplicationInput, "website"> {
  _id: string;
  status: AuthorApplicationStatus;
  interests: string[];
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}
