import type {
  StudentCertificateRecord,
  StudentCertificatesApiResponse,
} from "./types";
import type {
  StudentCertificateItem,
  StudentCertificatesView,
} from "./view-models";

function unwrapCertificatesPayload(
  payload:
    | StudentCertificatesApiResponse
    | { data?: StudentCertificatesApiResponse | StudentCertificateRecord[] },
): StudentCertificatesApiResponse {
  if (!payload || typeof payload !== "object") return { data: [] };

  if ("kpis" in payload || Array.isArray((payload as StudentCertificatesApiResponse).data)) {
    return payload as StudentCertificatesApiResponse;
  }

  const nested = (
    payload as { data?: StudentCertificatesApiResponse | StudentCertificateRecord[] }
  ).data;

  if (Array.isArray(nested)) return { data: nested };
  if (nested && typeof nested === "object") {
    return nested as StudentCertificatesApiResponse;
  }

  return { data: [] };
}

function formatIssuedDate(value?: string): string {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";

  return date
    .toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    })
    .toUpperCase();
}

function isIssuedThisMonth(value?: string): boolean {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;

  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth()
  );
}

function getCertificateTitle(certificate: StudentCertificateRecord): string {
  const lms = certificate.lmsId;
  if (lms && typeof lms === "object" && lms.title?.trim()) {
    return lms.title.trim();
  }

  const group = certificate.groupId;
  if (group && typeof group === "object" && group.title?.trim()) {
    return group.title.trim();
  }

  return certificate.certificateCode
    ? `Certificate ${certificate.certificateCode}`
    : "IMETS Certificate";
}

function normalizeCertificate(
  certificate: StudentCertificateRecord,
  index: number,
): StudentCertificateItem {
  const code = certificate.certificateCode?.trim() || `CERT-${index + 1}`;

  return {
    id: certificate._id || code,
    title: getCertificateTitle(certificate),
    issuedDate: formatIssuedDate(certificate.createdAt ?? certificate.updatedAt),
    certificateId: code,
    lmsId:
      typeof certificate.lmsId === "string"
        ? certificate.lmsId
        : certificate.lmsId?._id,
    groupId:
      typeof certificate.groupId === "string"
        ? certificate.groupId
        : certificate.groupId?._id,
    certificateLink: certificate.certificateLink,
    verifyUrl: `/certificates/verify/${encodeURIComponent(code)}`,
    recipientName: certificate.studentName,
    status: "completed",
  };
}

export function normalizeStudentCertificates(
  payload:
    | StudentCertificatesApiResponse
    | { data?: StudentCertificatesApiResponse | StudentCertificateRecord[] },
): StudentCertificatesView {
  const unwrapped = unwrapCertificatesPayload(payload);
  const records = Array.isArray(unwrapped.data) ? unwrapped.data : [];
  const certificates = records.map(normalizeCertificate);
  const latest = unwrapped.kpis?.latestAchievement;
  const latestRecord =
    (latest?.certificateCode
      ? certificates.find((cert) => cert.certificateId === latest.certificateCode)
      : null) ?? certificates[0] ?? null;

  return {
    totalEarned: unwrapped.kpis?.totalCertificates ?? certificates.length,
    addedThisMonth: records.filter((record) =>
      isIssuedThisMonth(record.createdAt ?? record.updatedAt),
    ).length,
    latestAchievement: latestRecord
      ? {
          title: latestRecord.title,
          issuedDate: latest?.issuedAt
            ? formatIssuedDate(latest.issuedAt)
            : latestRecord.issuedDate,
        }
      : null,
    certificates,
  };
}
