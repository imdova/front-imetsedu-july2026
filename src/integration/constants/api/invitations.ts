export const API_INVITATIONS = "/user-management/invitations";
export const API_ACCEPT_INVITATION = "/user-management/invitations/accept";
export const apiCancelInvitation = (id: string) => `/user-management/invitations/${id}/cancel`;
export const apiResendInvitation = (id: string) => `/user-management/invitations/${id}/resend`;
