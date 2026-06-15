import type { LucideIcon } from "lucide-react";
import {
  Award,
  BadgeCheck,
  BookOpen,
  Clock,
  CreditCard,
  Megaphone,
} from "lucide-react";

export type NotificationType =
  | "grade"
  | "deadline"
  | "content"
  | "announce"
  | "cert"
  | "payment";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  course: string;
  createdAt: string;
  read: boolean;
  cta: { label: string; href: string };
}

export const NOTIFICATION_TYPE_ORDER: NotificationType[] = [
  "grade",
  "deadline",
  "content",
  "announce",
  "cert",
  "payment",
];

export interface NotificationTypeMeta {
  label: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  accentBorder: string;
  chipActive: string;
}

export const NOTIFICATION_TYPE_META: Record<
  NotificationType,
  NotificationTypeMeta
> = {
  grade: {
    label: "Results",
    icon: BadgeCheck,
    iconBg: "bg-success-soft",
    iconColor: "text-success-fg",
    accentBorder: "border-l-success-fg",
    chipActive: "bg-success-soft text-success-fg border-success-fg/30",
  },
  deadline: {
    label: "Deadlines",
    icon: Clock,
    iconBg: "bg-warning-soft",
    iconColor: "text-warning-fg",
    accentBorder: "border-l-warning-fg",
    chipActive: "bg-warning-soft text-warning-fg border-warning-fg/30",
  },
  content: {
    label: "Lessons",
    icon: BookOpen,
    iconBg: "bg-surface-primary",
    iconColor: "text-admin-primary",
    accentBorder: "border-l-admin-primary",
    chipActive: "bg-surface-primary text-admin-primary border-admin-primary/30",
  },
  announce: {
    label: "Announcements",
    icon: Megaphone,
    iconBg: "bg-violet-100",
    iconColor: "text-violet-700",
    accentBorder: "border-l-violet-600",
    chipActive: "bg-violet-100 text-violet-800 border-violet-300",
  },
  cert: {
    label: "Certificates",
    icon: Award,
    iconBg: "bg-teal-50",
    iconColor: "text-teal-700",
    accentBorder: "border-l-teal-600",
    chipActive: "bg-teal-50 text-teal-800 border-teal-300",
  },
  payment: {
    label: "Billing",
    icon: CreditCard,
    iconBg: "bg-danger-soft",
    iconColor: "text-danger-fg",
    accentBorder: "border-l-danger-fg",
    chipActive: "bg-danger-soft text-danger-fg border-danger-fg/30",
  },
};

export type NotificationFilter = "all" | NotificationType;

export type NotificationGroupKey = "today" | "week" | "earlier";

export const NOTIFICATION_GROUP_LABELS: Record<NotificationGroupKey, string> = {
  today: "Today",
  week: "Earlier this week",
  earlier: "Earlier",
};
