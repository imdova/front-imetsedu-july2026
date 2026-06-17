/** Admin notifications DAL — inbox items, stats, and mutations. LIVE (/notifications). */
import { ok, fail, toMessage, type Result } from "@integration/lib/api-client";
import * as notificationsSvc from "@integration/services/notifications";
import type { AdminNotif, NotifStats } from "@/lib/db/notifications-admin";
import { mapNotification, computeNotifStats } from "@/lib/admin/map-notification";

const arr = <T>(x: unknown): T[] => (Array.isArray(x) ? (x as T[]) : ((x as { data?: T[] })?.data ?? []));

export interface NotifMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface NotifPage {
  items: AdminNotif[];
  unreadCount: number;
  meta: NotifMeta;
}

export const fetchAdminNotifications = async (page = 1, limit = 20): Promise<Result<NotifPage>> => {
  const res = await notificationsSvc.getNotifications(page, limit);
  if (!res.ok) return res as any;
  try {
    const raw = res.data as { data?: unknown[]; unreadCount?: number; meta?: NotifMeta };
    const items = arr<any>(res.data).map(mapNotification);
    const unreadCount = typeof raw?.unreadCount === "number" ? raw.unreadCount : items.filter((n) => !n.read).length;
    const meta: NotifMeta = raw?.meta ?? { total: items.length, page, limit, totalPages: 1 };
    return ok({ items, unreadCount, meta });
  } catch (err) {
    return fail(toMessage(err, "Failed to load notifications"));
  }
};

export const fetchNotifStats = async (): Promise<Result<NotifStats>> => {
  const res = await notificationsSvc.getNotifications(1, 20);
  if (!res.ok) return res as any;
  try {
    const raw = res.data as { data?: unknown[]; unreadCount?: number };
    const rows = arr<any>(res.data).map(mapNotification);
    return ok(computeNotifStats(rows, raw?.unreadCount));
  } catch (err) {
    return fail(toMessage(err, "Failed to load notification stats"));
  }
};

export const fetchUnreadCount = async (): Promise<Result<number>> => {
  const res = await notificationsSvc.getUnreadCount();
  if (!res.ok) return res as any;
  try {
    const d = res.data as any;
    const count = d?.unreadCount ?? d?.count ?? d ?? 0;
    return ok(typeof count === "number" ? count : 0);
  } catch (err) {
    return fail(toMessage(err, "Failed to load unread count"));
  }
};

export const markAllRead = async (): Promise<Result<void>> => {
  const res = await notificationsSvc.markAllNotificationsRead();
  if (!res.ok) return res as any;
  return ok(undefined as void);
};

export const markOneRead = async (id: string): Promise<Result<void>> => {
  const res = await notificationsSvc.markNotificationRead(id);
  if (!res.ok) return res as any;
  return ok(undefined as void);
};

export const deleteNotif = async (id: string): Promise<Result<void>> => {
  const res = await notificationsSvc.deleteNotification(id);
  if (!res.ok) return res as any;
  return ok(undefined as void);
};

export const clearAll = async (): Promise<Result<void>> => {
  const res = await notificationsSvc.clearAllNotifications();
  if (!res.ok) return res as any;
  return ok(undefined as void);
};
