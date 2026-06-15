import { ROUTES } from "@integration/constants";
import type {
  AppNotification,
  NotificationType,
} from "@integration/lib/notifications/app-notification";
import type { StudentPortalNotification } from "./types";

function mapNotificationType(apiType?: string): NotificationType {
  const value = apiType?.toLowerCase() ?? "";
  if (value.includes("grade") || value.includes("quiz")) return "grade";
  if (value.includes("deadline") || value.includes("assignment")) {
    return "deadline";
  }
  if (
    value.includes("lesson") ||
    value.includes("content") ||
    value.includes("module")
  ) {
    return "content";
  }
  if (value.includes("cert")) return "cert";
  if (
    value.includes("payment") ||
    value.includes("installment") ||
    value.includes("lead")
  ) {
    return "payment";
  }
  if (value.includes("lms") || value.includes("course")) return "content";
  return "announce";
}

function resolveNotificationCta(
  notification: StudentPortalNotification,
): AppNotification["cta"] {
  const entityType = notification.entityType?.toLowerCase() ?? "";
  const entityId = notification.entityId?.trim() ?? "";

  if (entityType === "lmscourse" && entityId) {
    return {
      label: "Open course",
      href: ROUTES.STUDENT.COURSE_OVERVIEW(entityId),
    };
  }
  if (entityType === "group") {
    return {
      label: "View schedule",
      href: ROUTES.STUDENT.SCHEDULE,
    };
  }
  if (entityType === "lead") {
    return {
      label: "View payments",
      href: ROUTES.STUDENT.INSTALLMENTS,
    };
  }

  return {
    label: "View inbox",
    href: ROUTES.STUDENT.NOTIFICATIONS,
  };
}

function resolveCourseLabel(notification: StudentPortalNotification): string {
  if (notification.entityType?.trim()) {
    return notification.entityType;
  }
  if (notification.type?.trim()) {
    return notification.type.replace(/\./g, " · ");
  }
  return "Update";
}

export function normalizeStudentNotification(
  row: StudentPortalNotification,
): AppNotification {
  return {
    id: row._id,
    type: mapNotificationType(row.type),
    title: row.title?.trim() || "Notification",
    description: row.message?.trim() || row.title?.trim() || "Update",
    course: resolveCourseLabel(row),
    createdAt: row.createdAt ?? new Date().toISOString(),
    read: Boolean(row.isRead),
    cta: resolveNotificationCta(row),
  };
}
