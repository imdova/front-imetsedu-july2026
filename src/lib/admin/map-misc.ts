/**
 * Defensive mappers for admin domains that are currently empty in the backend
 * (instructors, certificates, refunds) — so they go live cleanly the moment
 * rows exist. Pure + client-safe.
 */
import type { Instructor, AdminCertificate } from "@/lib/db/admin";
import type { Refund, RefundStatus, Currency } from "@/lib/db/finance";

const initials = (n: string) => n.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");

function fmtDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? (iso || "—") : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function mapInstructor(raw: any): Instructor {
  const name = raw?.name ?? (`${raw?.firstName ?? ""} ${raw?.lastName ?? ""}`.trim() || "—");
  return {
    id: raw?._id ?? raw?.id,
    name,
    titleEn: raw?.professionalTitleEn ?? raw?.professionalTitle ?? raw?.titleEn ?? "",
    titleAr: raw?.professionalTitleAr ?? raw?.titleAr ?? "",
    email: raw?.email ?? "",
    experience: raw?.yearsOfExperience ?? 0,
    rating: raw?.rating ?? 0,
    courses: Array.isArray(raw?.courses) ? raw.courses.length : raw?.coursesCount ?? 0,
    status: raw?.isActive === false ? "inactive" : "active",
    initials: initials(name),
  };
}

export function mapAdminCertificate(raw: any): AdminCertificate {
  return {
    id: raw?._id ?? raw?.id,
    code: raw?.code ?? raw?.certificateCode ?? raw?.verificationCode ?? "—",
    student: raw?.student?.name ?? raw?.student?.fullName ?? raw?.studentName ?? raw?.leadId?.fullName ?? "—",
    course: raw?.course?.titleEn ?? raw?.course?.name ?? raw?.courseName ?? raw?.lmsId?.title ?? raw?.groupId?.title ?? "—",
    issuedAt: fmtDate(raw?.issuedAt ?? raw?.createdAt),
    link: raw?.certificateLink ?? raw?.link ?? undefined,
  };
}

const REFUND_STATUS: Record<string, RefundStatus> = {
  pending: "requested",
  requested: "requested",
  approved: "approved",
  processing: "processed",
  processed: "processed",
  rejected: "rejected",
  dispute: "requested",
};

export function mapRefund(raw: any): Refund {
  return {
    id: raw?._id ?? raw?.id,
    number: raw?.refundNumber ?? raw?.number ?? "—",
    studentName: raw?.student?.fullName ?? raw?.studentName ?? raw?.fullName ?? "—",
    invoiceNumber: raw?.invoiceNumber ?? raw?.invoice?.invoiceNumber ?? "—",
    amount: raw?.amount ?? 0,
    currency: (raw?.currency ?? "EGP") as Currency,
    status: REFUND_STATUS[String(raw?.status ?? "").toLowerCase()] ?? "requested",
    reason: raw?.reason ?? "—",
    date: fmtDate(raw?.date ?? raw?.createdAt),
  };
}
