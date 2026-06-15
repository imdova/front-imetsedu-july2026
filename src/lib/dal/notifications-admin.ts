/** Admin notifications DAL — inbox items + KPI stats. LIVE (GET /notifications). */
import { ok, fail, toMessage, type Result } from "@integration/lib/api-client";
import * as notificationsSvc from "@integration/services/notifications";
import type { AdminNotif, NotifStats } from "@/lib/db/notifications-admin";
import { mapNotification, computeNotifStats } from "@/lib/admin/map-notification";

const arr = <T>(x: unknown): T[] => (Array.isArray(x) ? (x as T[]) : ((x as { data?: T[] })?.data ?? []));

export const fetchAdminNotifications = async (): Promise<Result<AdminNotif[]>> => {
  const res = await notificationsSvc.getNotifications(1, 100);
  if (!res.ok) return res;
  try {
    return ok(arr<any>(res.data).map(mapNotification));
  } catch (err) {
    return fail(toMessage(err, "Failed to load notifications"));
  }
};

export const fetchNotifStats = async (): Promise<Result<NotifStats>> => {
  const res = await notificationsSvc.getNotifications(1, 100);
  if (!res.ok) return res;
  try {
    const data = res.data as { data?: unknown[]; unreadCount?: number };
    const rows = arr<any>(res.data).map(mapNotification);
    return ok(computeNotifStats(rows, data?.unreadCount));
  } catch (err) {
    return fail(toMessage(err, "Failed to load notification stats"));
  }
};
