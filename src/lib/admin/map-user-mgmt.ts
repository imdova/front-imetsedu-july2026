/** Maps backend user-management docs (staff, departments, roles) to the UI shapes. */
import type { UmUser, UmUserStatus, UmStats, UmDepartment, UmRole, UmRisk } from "@/lib/db/user-management";
import type { StaffRole } from "@integration/services/roles";

const initials = (n: string) => n.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");

function status(raw: any): UmUserStatus {
  if (raw?.isActive === false) return "suspended";
  // A staff record tied to an unaccepted invitation is still pending.
  if (raw?.invitationId && raw?.invitationAccepted === false) return "pending";
  return "active";
}

export function mapStaff(raw: any): UmUser {
  const name = raw?.name ?? "—";
  return {
    id: raw?._id ?? raw?.id,
    name,
    email: raw?.email ?? "",
    title: raw?.staffRole?.title ?? raw?.professionalTitle ?? raw?.role ?? "—",
    role: raw?.staffRole?.title ?? raw?.role ?? "—",
    department: raw?.department?.name ?? "—",
    status: status(raw),
    expiresAt: raw?.invitation?.expiresAt ? String(raw.invitation.expiresAt).slice(0, 10) : null,
    acceptedAt: String(raw?.createdAt ?? "").slice(0, 10) || null,
    initials: initials(name),
    invitationId: raw?.invitationId ?? raw?.invitation?._id ?? raw?.invitation?.id ?? null,
    phone: raw?.phone ?? "",
  };
}

/** Derive a coarse risk band from the count of granted permissions. */
function riskFromCount(n: number): { risk: UmRisk; score: number } {
  const risk: UmRisk = n >= 30 ? "high" : n >= 18 ? "elevated" : n >= 8 ? "medium" : "low";
  return { risk, score: n };
}

/** Map a backend StaffRole to the UI UmRole (permissions object → granted ids). */
export function mapRole(raw: StaffRole): UmRole {
  const granted = Object.entries(raw.permissions ?? {}).filter(([, on]) => on).map(([id]) => id);
  const { risk, score } = riskFromCount(granted.length);
  return {
    id: raw.id,
    name: raw.title,
    custom: true,
    users: 0,
    risk,
    riskScore: score,
    granted,
    updatedBy: "—",
    updatedAt: (raw.updatedAt ?? raw.createdAt ?? "").replace("T", " ").slice(0, 19),
    departmentId: raw.departmentId || undefined,
    departmentName: raw.departmentName || undefined,
    description: raw.description || undefined,
  };
}

/** Convert a granted-id list back into the backend permissions object. */
export function grantedToPermissions(granted: string[]): Record<string, boolean> {
  return Object.fromEntries(granted.map((id) => [id, true]));
}

export function computeUmStats(rows: UmUser[]): UmStats {
  const active = rows.filter((u) => u.status === "active");
  return {
    total: rows.length,
    accepted: rows.filter((u) => u.status !== "pending").length,
    activeStaff: active.length,
    pendingInvites: rows.filter((u) => u.status === "pending").length,
  };
}

export function mapDepartment(raw: any): UmDepartment {
  return {
    id: raw?._id ?? raw?.id,
    name: raw?.name ?? "—",
    staff: raw?.staffCount ?? 0,
    roles: raw?.rolesCount ?? 0,
    createdAt: String(raw?.createdAt ?? "").slice(0, 10) || "—",
  };
}
