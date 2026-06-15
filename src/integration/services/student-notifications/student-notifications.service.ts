import { STUDENT_PORTAL } from "@integration/constants/api/student-portal";
import type { AppNotification } from "@integration/lib/notifications/app-notification";
import { api, fail, toMessage, type Result } from "@integration/services/http/client";
import { normalizeStudentNotification } from "./normalize";
import type {
  GetStudentNotificationsQuery,
  StudentPortalNotificationsResponse,
} from "./types";

export interface StudentNotificationsView {
  items: AppNotification[];
  unreadCount: number;
  meta: StudentPortalNotificationsResponse["meta"];
}

function unwrapNotificationsPayload(
  data:
    | StudentPortalNotificationsResponse
    | { data?: StudentPortalNotificationsResponse },
): StudentPortalNotificationsResponse | null {
  if (!data || typeof data !== "object") return null;

  const topLevel = data as StudentPortalNotificationsResponse;
  if (Array.isArray(topLevel.data)) {
    return topLevel;
  }

  const nested = (data as { data?: StudentPortalNotificationsResponse }).data;
  return nested && Array.isArray(nested.data) ? nested : null;
}

function unwrapUnreadCount(data: unknown): number | null {
  if (!data || typeof data !== "object") return null;
  const row = data as { unreadCount?: number; data?: { unreadCount?: number } };
  if (typeof row.unreadCount === "number") return row.unreadCount;
  if (typeof row.data?.unreadCount === "number") return row.data.unreadCount;
  return null;
}

export async function getStudentNotifications(
  query: GetStudentNotificationsQuery = {},
): Promise<Result<StudentNotificationsView>> {
  const params: Record<string, string | number | boolean> = {};
  if (query.page != null) params.page = query.page;
  if (query.limit != null) params.limit = query.limit;
  if (query.isRead != null) params.isRead = query.isRead;
  if (query.type?.trim()) params.type = query.type.trim();

  const res = await api.get<
    StudentPortalNotificationsResponse | { data?: StudentPortalNotificationsResponse }
  >(STUDENT_PORTAL.NOTIFICATIONS, { params });

  if (!res.ok) {
    return fail(
      typeof res.error === "string" ? res.error : "Failed to load notifications",
    );
  }

  try {
    const raw = unwrapNotificationsPayload(res.data);
    if (!raw) {
      return fail("Invalid notifications response");
    }

    return {
      ok: true,
      data: {
        items: raw.data.map(normalizeStudentNotification),
        unreadCount: raw.unreadCount ?? 0,
        meta: raw.meta ?? {
          total: raw.data.length,
          page: query.page ?? 1,
          limit: query.limit ?? raw.data.length,
          totalPages: 1,
        },
      },
    };
  } catch (err) {
    return fail(toMessage(err, "Failed to load notifications"));
  }
}

export async function getStudentUnreadNotificationCount(): Promise<Result<number>> {
  const res = await api.get<unknown>(STUDENT_PORTAL.NOTIFICATIONS_UNREAD_COUNT);

  if (!res.ok) {
    return fail(
      typeof res.error === "string"
        ? res.error
        : "Failed to load unread notification count",
    );
  }

  const count = unwrapUnreadCount(res.data);
  if (count == null) {
    return fail("Invalid unread count response");
  }

  return { ok: true, data: count };
}

export async function markAllStudentNotificationsRead(): Promise<Result<void>> {
  const res = await api.patch<unknown>(
    STUDENT_PORTAL.NOTIFICATIONS_MARK_ALL_READ,
    {},
  );

  if (!res.ok) {
    return fail(
      typeof res.error === "string"
        ? res.error
        : "Failed to mark notifications as read",
    );
  }

  return { ok: true, data: undefined };
}
