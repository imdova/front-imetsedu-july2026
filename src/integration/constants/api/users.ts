import { API_URL } from "./auth";

export const API_USERS_ME = `${API_URL}/users/me`;

export const apiDeleteUser = (id: string) => `/user-management/invitations/${id}`;
export const apiUpdateUserRole = (id: string) => `/users/${id}/role`;

