/**
 * Maps a backend course-registration row (`GET /courses/registrations`) to the
 * UI `Registration` shape. Pure + client-safe. (Backend rows are derived from
 * group enrolments; field names are best-effort per the data dictionary.)
 */
import type { Registration } from "@/lib/db/admin";

function fmtDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? (iso || "—") : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function status(raw: any): Registration["status"] {
  if (raw?.isCompleted || raw?.progress >= 100) return "completed";
  const s = String(raw?.groupStatus ?? raw?.status ?? "").toLowerCase();
  if (s === "completed" || s === "finished") return "completed";
  if (s === "dropped" || s === "cancelled") return "dropped";
  return "active";
}

export function mapRegistration(raw: any): Registration {
  return {
    id: raw?._id ?? raw?.id ?? raw?.studentId ?? `${raw?.studentName}-${raw?.groupId}`,
    student: raw?.studentName ?? raw?.student?.fullName ?? raw?.fullName ?? "—",
    course: raw?.courseTitle ?? raw?.course?.titleEn ?? raw?.courseName ?? "—",
    group: raw?.groupTitle ?? raw?.group?.title ?? raw?.groupName ?? "—",
    totalFee: raw?.totalFee ?? 0,
    paid: raw?.paidAmount ?? raw?.paid ?? 0,
    progress: raw?.progress ?? 0,
    status: status(raw),
    registeredAt: fmtDate(raw?.registeredAt ?? raw?.createdAt),
  };
}
