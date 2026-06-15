export type InvitationStatus = "pending" | "accepted" | "cancelled" | "expired";

export interface InvitationRole {
  _id: string;
  title: string;
}

export interface InvitationDepartment {
  _id: string;
  name: string;
}

export interface Invitation {
  id: string;
  fullName: string;
  title?: string;
  email: string;
  phone?: string;
  role: InvitationRole | null;
  department: InvitationDepartment | null;
  inviteToken: string;
  expiresAt: string;
  status: InvitationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SendInvitationInput {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  role: string;
  department: string;
}
