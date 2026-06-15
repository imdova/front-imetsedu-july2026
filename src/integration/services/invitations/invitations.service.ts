import { api, ok, type Result } from "@integration/services/http/client";
import {
  API_INVITATIONS,
  API_ACCEPT_INVITATION,
  apiCancelInvitation,
  apiResendInvitation,
} from "@integration/constants/api/invitations";
import { apiDeleteUser, apiUpdateUserRole } from "@integration/constants/api/users";
import type { Invitation, InvitationStatus, SendInvitationInput } from "./types";

interface InvitationRaw {
  _id: string;
  fullName: string;
  title?: string;
  email: string;
  phone?: string;
  role: { _id: string; title: string } | null;
  department: { _id: string; name: string } | null;
  inviteToken: string;
  expiresAt: string;
  status: InvitationStatus;
  createdAt: string;
  updatedAt: string;
}

function normalize(raw: InvitationRaw): Invitation {
  return {
    id: raw._id,
    fullName: raw.fullName,
    title: raw.title,
    email: raw.email,
    phone: raw.phone,
    role: raw.role,
    department: raw.department,
    inviteToken: raw.inviteToken,
    expiresAt: raw.expiresAt,
    status: raw.status,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export async function listInvitations(status?: InvitationStatus): Promise<Result<Invitation[]>> {
  const params: Record<string, string> | undefined = status ? { status } : undefined;
  const result = await api.get<InvitationRaw[] | { data: InvitationRaw[] }>(
    API_INVITATIONS,
    params ? { params } : undefined,
  );
  if (!result.ok) return result;
  const items = Array.isArray(result.data) ? result.data : (result.data.data ?? []);
  return ok(items.map(normalize));
}

export function sendInvitation(input: SendInvitationInput): Promise<Result<Invitation>> {
  return api.post<Invitation>(API_INVITATIONS, input);
}

export function cancelInvitation(id: string): Promise<Result<void>> {
  return api.patch<void>(apiCancelInvitation(id));
}

export function resendInvitation(id: string): Promise<Result<void>> {
  return api.patch<void>(apiResendInvitation(id));
}

export function acceptInvitation(token: string, password: string): Promise<Result<void>> {
  return api.post<void>(API_ACCEPT_INVITATION, { token, password }, { requireAuth: false });
}

export function deleteUser(id: string): Promise<Result<void>> {
  return api.delete<void>(apiDeleteUser(id));
}

export function updateUserRole(id: string, role: string): Promise<Result<void>> {
  return api.patch<void>(apiUpdateUserRole(id), { role });
}
