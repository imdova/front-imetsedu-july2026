/**
 * Admin notifications inbox (self-contained): platform-wide signals from leads,
 * enrollments, payments, invoices, refunds and the system. Backs the admin
 * "Admin notifications" screen.
 */
import { respond } from "./delay";

export type NotifCategory = "leads" | "enrollments" | "payments" | "invoices" | "refunds" | "system";

export interface AdminNotif {
  id: string;
  title: string;
  body: string;
  category: NotifCategory;
  tag: string;
  icon: "lead" | "group" | "bell";
  read: boolean;
  urgent: boolean;
  archived: boolean;
  at: string; // display timestamp
  actionLabel?: string;
  actionHref?: string;
}

export interface NotifStats {
  total: number;
  unread: number;
  urgent: number;
  archived: number;
}

const notifications: AdminNotif[] = [
  { id: "ntf_0", title: "Student Added to Group", body: 'Student "Mostafa" added to group "cphq - g42"', category: "enrollments", tag: "Group", icon: "group", read: false, urgent: false, archived: false, at: "Jun 14, 2026, 03:06 PM", actionLabel: "View Group", actionHref: "/admin/groups/grp_g42" },
  { id: "ntf_1", title: "Lead Updated", body: 'Lead "Mostafa" updated', category: "leads", tag: "Lead", icon: "lead", read: false, urgent: false, archived: false, at: "Jun 14, 2026, 03:06 PM", actionLabel: "View Lead", actionHref: "/admin/crm/leads" },
  { id: "ntf_2", title: "Lead Stage Changed", body: 'Lead "Mostafa" stage changed to enrolled', category: "leads", tag: "Lead", icon: "lead", read: false, urgent: false, archived: false, at: "Jun 14, 2026, 03:06 PM", actionLabel: "View Lead", actionHref: "/admin/crm/leads" },
  { id: "ntf_3", title: "LMS course created", body: 'LMS course "ffffffffff" created', category: "system", tag: "LmsCourse", icon: "bell", read: false, urgent: false, archived: false, at: "Jun 14, 2026, 02:41 PM" },
  { id: "ntf_4", title: "Installment Updated", body: "Installment 1 updated", category: "system", tag: "Lead", icon: "bell", read: false, urgent: false, archived: false, at: "Jun 14, 2026, 01:28 PM", actionLabel: "View Lead", actionHref: "/admin/crm/leads" },
  { id: "ntf_5", title: "Lead Updated", body: 'Lead "Mostafa" updated', category: "leads", tag: "Lead", icon: "lead", read: false, urgent: false, archived: false, at: "Jun 14, 2026, 01:27 PM", actionLabel: "View Lead", actionHref: "/admin/crm/leads" },
  { id: "ntf_6", title: "Invoice Created", body: 'Invoice "INV-2026-0002" created for installment 2', category: "invoices", tag: "Invoice", icon: "bell", read: false, urgent: false, archived: false, at: "Jun 14, 2026, 01:27 PM" },
  { id: "ntf_7", title: "Invoice Created", body: 'Invoice "INV-2026-0001" created for installment 1', category: "invoices", tag: "Invoice", icon: "bell", read: false, urgent: false, archived: false, at: "Jun 14, 2026, 01:27 PM" },
  { id: "ntf_8", title: "Group Created", body: 'Group "cphq - g42" created', category: "enrollments", tag: "Group", icon: "group", read: false, urgent: false, archived: false, at: "Jun 14, 2026, 01:27 PM", actionLabel: "View Group", actionHref: "/admin/groups/grp_g42" },
  { id: "ntf_9", title: "Lead Created", body: 'New lead "Mostafa" created', category: "leads", tag: "Lead", icon: "lead", read: false, urgent: false, archived: false, at: "Jun 14, 2026, 01:26 PM", actionLabel: "View Lead", actionHref: "/admin/crm/leads" },
];

export const getNotifications = () => respond(notifications);

export function getStats(): Promise<NotifStats> {
  return respond<NotifStats>({
    total: notifications.filter((n) => !n.archived).length,
    unread: notifications.filter((n) => !n.read && !n.archived).length,
    urgent: notifications.filter((n) => n.urgent && !n.archived).length,
    archived: notifications.filter((n) => n.archived).length,
  });
}
