import { api, type Result } from "@integration/services/http/client";

/**
 * Fetch all notifications for the current user with pagination.
 */
export function getNotifications(page: number = 1, limit: number = 20): Promise<Result<any>> {
  return api.get<any>(`/notifications?page=${page}&limit=${limit}`);
}

/**
 * Get unread notification count.
 */
export function getUnreadCount(): Promise<Result<any>> {
  return api.get<any>("/notifications/unread-count");
}

/**
 * Mark all notifications as read.
 */
export function markAllNotificationsRead(): Promise<Result<any>> {
  return api.patch<any>("/notifications/read-all", {});
}

/**
 * Mark a single notification as read by ID.
 */
export function markNotificationRead(id: string): Promise<Result<any>> {
  return api.patch<any>(`/notifications/${id}/read`, {});
}

/**
 * Clear all notifications for the current user.
 */
export function clearAllNotifications(): Promise<Result<any>> {
  return api.delete<any>("/notifications/clear-all");
}

/**
 * Delete a single notification by ID.
 */
export function deleteNotification(id: string): Promise<Result<any>> {
  return api.delete<any>(`/notifications/${id}`);
}
