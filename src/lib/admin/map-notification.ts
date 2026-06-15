/** Maps backend notifications (`GET /notifications`) to the UI `AdminNotif`. */
import type { AdminNotif, NotifCategory, NotifStats } from "@/lib/db/notifications-admin";

function categoryOf(entityType?: string, type?: string): NotifCategory {
  const e = String(entityType ?? "").toLowerCase();
  const t = String(type ?? "").toLowerCase();
  if (e === "lead" || t.startsWith("lead")) return "leads";
  if (e === "group" || t.includes("enroll") || t.includes("group")) return "enrollments";
  if (e === "invoice" || t.includes("invoice")) return "invoices";
  if (e === "payment" || t.includes("payment")) return "payments";
  if (e === "refund" || t.includes("refund")) return "refunds";
  return "system";
}

function fmtAt(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function mapNotification(raw: any): AdminNotif {
  const entityType = raw?.entityType ?? "";
  const category = categoryOf(entityType, raw?.type);
  const e = String(entityType).toLowerCase();
  const icon: AdminNotif["icon"] = e === "lead" ? "lead" : e === "group" ? "group" : "bell";

  let actionLabel: string | undefined;
  let actionHref: string | undefined;
  if (e === "lead") { actionLabel = "View Lead"; actionHref = "/admin/crm/leads"; }
  else if (e === "group" && raw?.entityId) { actionLabel = "View Group"; actionHref = `/admin/groups/${raw.entityId}`; }

  return {
    id: raw?._id ?? raw?.id,
    title: raw?.title ?? "—",
    body: raw?.message ?? "",
    category,
    tag: entityType || "System",
    icon,
    read: !!raw?.isRead,
    urgent: !!raw?.metadata?.urgent,
    archived: !!raw?.isArchived,
    at: fmtAt(raw?.createdAt),
    actionLabel,
    actionHref,
  };
}

export function computeNotifStats(rows: AdminNotif[], unreadCount?: number): NotifStats {
  const active = rows.filter((n) => !n.archived);
  return {
    total: active.length,
    unread: typeof unreadCount === "number" ? unreadCount : active.filter((n) => !n.read).length,
    urgent: active.filter((n) => n.urgent).length,
    archived: rows.filter((n) => n.archived).length,
  };
}
