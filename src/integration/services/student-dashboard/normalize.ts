import { ROUTES } from "@integration/constants";
import type {
  StudentDashboardApiResponse,
  StudentDashboardCourseRef,
  StudentDashboardDueItem,
  StudentDashboardNextInstallment,
  StudentDashboardNotification,
  StudentDashboardTodaySession,
} from "./types";
import type {
  DashboardContinueLearning,
  DashboardCourseSummary,
  DashboardDueSoonItem,
  DashboardLiveSession,
  DashboardPaymentAlert,
  DashboardRecentUpdate,
  DashboardTodayFocus,
  DashboardUrgentDeadline,
  StudentDashboardView,
} from "./view-models";

function unwrapDashboardPayload(
  data: StudentDashboardApiResponse | { data?: StudentDashboardApiResponse },
): StudentDashboardApiResponse | null {
  if (!data || typeof data !== "object") return null;
  if ("greeting" in data || "courses" in data || "continueLearning" in data) {
    return data as StudentDashboardApiResponse;
  }
  const nested = (data as { data?: StudentDashboardApiResponse }).data;
  return nested && typeof nested === "object" ? nested : null;
}

function formatRelativeTime(iso?: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const diffMs = date.getTime() - Date.now();
  const absMs = Math.abs(diffMs);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  const minutes = Math.round(absMs / (1000 * 60));
  if (minutes < 60) {
    return rtf.format(Math.round(diffMs / (1000 * 60)), "minute");
  }
  const hours = Math.round(absMs / (1000 * 60 * 60));
  if (hours < 24) {
    return rtf.format(Math.round(diffMs / (1000 * 60 * 60)), "hour");
  }
  const days = Math.round(absMs / (1000 * 60 * 60 * 24));
  if (days < 7) {
    return rtf.format(Math.round(diffMs / (1000 * 60 * 60 * 24)), "day");
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatDueLabel(dueDate?: string, fallback?: string): string {
  if (fallback?.trim()) return fallback.trim();
  if (!dueDate) return "Due soon";

  const date = new Date(dueDate);
  if (Number.isNaN(date.getTime())) return "Due soon";

  const diffHours = (date.getTime() - Date.now()) / (1000 * 60 * 60);
  if (diffHours < 0) return "Overdue";
  if (diffHours < 24) return `Due in ${Math.max(1, Math.round(diffHours))} hours`;
  if (diffHours < 48) return "Due tomorrow";
  return `Due ${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
}

function formatMoney(amount?: number | string, currency = "USD"): string {
  if (amount == null || amount === "") return "";
  const numeric = typeof amount === "number" ? amount : Number(amount);
  if (Number.isFinite(numeric)) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(numeric);
  }
  return String(amount);
}

function normalizeCourseSummary(
  course: StudentDashboardCourseRef,
): DashboardCourseSummary {
  return {
    id: course._id,
    title: course.title,
    progress: course.isCompleted ? 100 : (course.progress ?? 0),
  };
}

function normalizeContinueLearning(
  course: StudentDashboardCourseRef | null | undefined,
): DashboardContinueLearning | null {
  if (!course?._id) return null;
  return {
    id: course._id,
    title: course.title,
    categoryLabel: course.category?.name ?? "Course",
    progress: course.isCompleted ? 100 : (course.progress ?? 0),
    thumbnailUrl: course.thumbnail?.[0],
  };
}

function normalizePaymentAlert(
  next: StudentDashboardNextInstallment | null | undefined,
): DashboardPaymentAlert {
  if (!next) {
    return { show: false, amount: "", dueLabel: "", installmentLabel: "" };
  }

  const amount = formatMoney(next.amount, next.currency);
  const dueDate = next.dueDate ? new Date(next.dueDate) : null;
  const dueLabel =
    next.label?.trim() ||
    (dueDate && !Number.isNaN(dueDate.getTime())
      ? `Due ${dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
      : "Due soon");

  const installmentLabel =
    next.title?.trim() ||
    (next.index && next.total
      ? `Installment ${next.index} of ${next.total}`
      : "Upcoming payment");

  if (!amount && !next.dueDate && !next.title) {
    return { show: false, amount: "", dueLabel: "", installmentLabel: "" };
  }

  return {
    show: true,
    amount: amount || "Payment due",
    dueLabel,
    installmentLabel,
  };
}

function normalizeLiveSession(
  session: StudentDashboardTodaySession,
  index: number,
): DashboardLiveSession | null {
  const title = session.title?.trim();
  if (!title) return null;

  const start = session.startTime ? new Date(session.startTime) : null;
  const timeLabel =
    session.timeLabel?.trim() ||
    (start && !Number.isNaN(start.getTime())
      ? `Today, ${start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`
      : "Today");

  const startsIn =
    session.startsIn?.trim() ||
    (start && !Number.isNaN(start.getTime())
      ? formatRelativeTime(session.startTime)
      : "soon");

  return {
    id: session._id ?? `live-${index}`,
    title,
    startsIn,
    timeLabel,
    zoomLink: session.zoomLink,
  };
}

function normalizeDueItem(
  item: StudentDashboardDueItem,
  index: number,
): DashboardDueSoonItem | null {
  const title = item.title?.trim();
  if (!title) return null;

  const dueLabel = formatDueLabel(item.dueDate, item.dueLabel);
  const urgent =
    item.urgent ??
    (item.dueDate
      ? new Date(item.dueDate).getTime() - Date.now() < 24 * 60 * 60 * 1000
      : false);

  return {
    id: item._id ?? `due-${index}`,
    title,
    dueLabel,
    urgent,
    href: item._id
      ? ROUTES.STUDENT.ASSIGNMENT_DETAIL(item._id)
      : ROUTES.STUDENT.ASSIGNMENTS,
  };
}

function normalizeTodayFocus(
  sessions: StudentDashboardTodaySession[] | undefined,
  dueSoon: StudentDashboardDueItem[] | undefined,
): DashboardTodayFocus {
  const liveSession =
    sessions?.map(normalizeLiveSession).find((row) => row != null) ?? null;

  const firstDue = dueSoon?.map(normalizeDueItem).find((row) => row != null);
  const urgentDeadline: DashboardUrgentDeadline | null = firstDue
    ? {
        id: firstDue.id,
        title: firstDue.title,
        dueLabel: firstDue.dueLabel,
        courseName:
          dueSoon?.[0]?.courseName?.trim() ||
          dueSoon?.[0]?.courseTitle?.trim() ||
          "Course",
        href: firstDue.href,
      }
    : null;

  return { liveSession, urgentDeadline };
}

function notificationUpdateType(
  type?: string,
): DashboardRecentUpdate["type"] {
  const normalized = type?.toLowerCase() ?? "";
  if (normalized.includes("grade") || normalized.includes("quiz")) {
    return "grade";
  }
  if (normalized.includes("announce") || normalized.includes("course")) {
    return "announcement";
  }
  return "notification";
}

function normalizeRecentUpdate(
  item: StudentDashboardNotification,
): DashboardRecentUpdate {
  return {
    id: item._id,
    type: notificationUpdateType(item.type),
    text: item.message?.trim() || item.title?.trim() || "Update",
    time: formatRelativeTime(item.createdAt),
  };
}

export function normalizeStudentDashboard(
  data: StudentDashboardApiResponse | { data?: StudentDashboardApiResponse },
): StudentDashboardView {
  const raw = unwrapDashboardPayload(data);
  if (!raw) {
    throw new Error("Invalid dashboard response");
  }

  const dueSoon =
    raw.dueSoon
      ?.map(normalizeDueItem)
      .filter((row): row is DashboardDueSoonItem => row != null) ?? [];

  return {
    greeting: raw.greeting?.trim() || "Welcome back",
    continueLearning: normalizeContinueLearning(raw.continueLearning),
    paymentAlert: normalizePaymentAlert(raw.nextInstallment),
    todayFocus: normalizeTodayFocus(raw.todaySessions, raw.dueSoon),
    dueSoon,
    courses:
      raw.courses?.map(normalizeCourseSummary) ??
      [],
    recentUpdates:
      raw.recentNotifications?.map(normalizeRecentUpdate) ?? [],
    unreadNotificationCount: raw.unreadNotificationCount ?? 0,
  };
}
