/**
 * Auth DAL — thin pass-through to the integration auth service. Unlike the
 * other DAL domains (which still serve dummy data), auth talks to the real
 * backend at NEXT_PUBLIC_API_URL from the first phase of integration.
 */
import * as authSvc from "@integration/services/auth";

export const login = (email: string, password: string) => authSvc.login(email, password);
export const register = (input: Parameters<typeof authSvc.register>[0]) => authSvc.register(input);
export const getProfile = (accessToken?: string) => authSvc.getProfile(accessToken);
export const updateProfile = (input: Parameters<typeof authSvc.updateProfile>[0]) =>
  authSvc.updateProfile(input);
export const refresh = (refreshToken: string) => authSvc.refresh(refreshToken);
export const changePassword = (currentPassword: string, newPassword: string) =>
  authSvc.changePassword(currentPassword, newPassword);
export const forgotPassword = (email: string) => authSvc.forgotPassword(email);
export const resetPassword = (token: string, newPassword: string) => authSvc.resetPassword(token, newPassword);
