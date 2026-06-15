/** Maps backend student docs (`GET /students`) to the UI `SmStudent` shape. */
import type { SmStudent, SmStats, SmPayment, SmGender } from "@/lib/db/students-mgmt";

const initials = (n: string) => n.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");

function payment(v: unknown): SmPayment {
  const s = String(v ?? "").toLowerCase();
  return (["paid", "partial", "pending", "unpaid"] as const).find((p) => p === s) ?? "pending";
}
function gender(v: unknown): SmGender {
  const s = String(v ?? "").toLowerCase();
  return s === "male" ? "male" : s === "female" ? "female" : "unspecified";
}

/** Backend fields can be string | {name|title} | array of those — coerce to a label. */
function label(v: unknown): string | null {
  if (v == null) return null;
  if (typeof v === "string") return v || null;
  if (Array.isArray(v)) return v.length ? label(v[0]) : null;
  if (typeof v === "object") {
    const o = v as Record<string, unknown>;
    return (o.title as string) ?? (o.name as string) ?? (o.fullName as string) ?? null;
  }
  return String(v);
}

export function mapStudent(raw: any): SmStudent {
  const name = raw?.name ?? raw?.fullName ?? "—";
  return {
    id: raw?._id ?? raw?.id,
    name,
    email: raw?.email ?? "",
    phone: raw?.number ?? raw?.phone ?? "",
    country: raw?.country ?? "—",
    gender: gender(raw?.gender),
    specialty: raw?.specialty ?? "—",
    leadSource: label(raw?.leadSource ?? raw?.source) ?? "—",
    salesAgent: label(raw?.salesAgent),
    assignedGroup: label(raw?.assignedGroup),
    payment: payment(raw?.payment),
    totalAmount: typeof raw?.totalAmount === "number" ? raw.totalAmount : null,
    certificates: Array.isArray(raw?.certificates) ? raw.certificates.length : raw?.certificates ?? 0,
    joinedAt: String(raw?.createdAt ?? "").slice(0, 10) || "—",
    initials: initials(name),
  };
}

export function computeSmStats(rows: SmStudent[]): SmStats {
  return {
    total: rows.length,
    inGroups: rows.filter((s) => s.assignedGroup).length,
    newThisMonth: rows.filter((s) => s.joinedAt.startsWith("2026-06")).length,
    certificates: rows.reduce((n, s) => n + s.certificates, 0),
  };
}
