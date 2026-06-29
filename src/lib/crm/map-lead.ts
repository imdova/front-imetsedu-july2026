/**
 * Maps a backend CRM lead (Mongo document shape from `GET /crm/leads`) to the
 * UI `Lead` shape the CRM components consume. Pure + client-safe.
 */
import type {
  Lead,
  LeadActivity,
  ActivityKind,
  FollowUp,
  FollowUpStatus,
  LeadCertificate,
  PaymentPlanSummary,
  PlanInstallment,
  PlanInstallmentStatus,
  PipelineHistoryEntry,
} from "@/lib/db/crm";
import type { LeadPriority } from "@/lib/crm/scoring";

/** Backend per-pipeline stage keys → the UI's merged 5-stage vocabulary. */
export const STAGE_MAP: Record<string, string> = {
  new_inquiries: "new",
  new: "new",
  contacted: "contacted",
  qualified: "contacted",
  waiting_payment: "waiting_payment",
  waiting: "waiting_payment",
  enrolled: "enrolled",
  lost: "lost",
  dead: "dead",
};

function relativeTime(iso?: string): string {
  if (!iso) return "—";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";
  const diff = Date.now() - then;
  const m = Math.round(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d === 1) return "yesterday";
  if (d < 30) return `${d} days ago`;
  return new Date(iso).toLocaleDateString();
}

/** Derive a follow-up's live status from its due date (calendar-day compare,
 * timezone-safe). A `done` follow-up stays done. Falls back to the stored
 * status when no parseable due date is present. */
function followUpStatus(f: any): FollowUpStatus {
  if (f?.status === "done") return "done";
  const due = typeof f?.dueDate === "string" ? f.dueDate.slice(0, 10) : "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(due)) return (f?.status as FollowUpStatus) ?? "upcoming";
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  if (due < today) return "overdue";
  if (due === today) return "today";
  return "upcoming";
}

function activityKind(action: string): ActivityKind {
  const a = action.toLowerCase();
  if (a.includes("stage")) return "stage";
  if (a.includes("creat")) return "form";
  if (a.includes("call")) return "call";
  if (a.includes("whatsapp") || a.includes("whats app")) return "whatsapp";
  if (a.includes("email")) return "email";
  return "note";
}

const PLAN_STATUS: Record<string, PlanInstallmentStatus> = {
  PAID: "PAID",
  SCHEDULED: "UPCOMING",
  UPCOMING: "UPCOMING",
  DUE: "DUE",
};

/** Map one raw payment plan to the UI summary. */
function mapOnePlan(plan: any, raw: any): PaymentPlanSummary {
  const installments: PlanInstallment[] = (plan.installments ?? []).map((it: any, i: number) => ({
    index: it.index ?? i + 1,
    label: it.label ?? (i === 0 ? "First installment" : "Installment"),
    amount: it.amount ?? 0,
    dueDate: it.paidDate ?? formatDate(it.dueDate),
    dueDateISO: it.dueDate,
    status: PLAN_STATUS[it.status] ?? "UPCOMING",
    receiptUrl: (plan.receipts ?? []).find((r: any) => r.scope === it.index)?.previewUrl,
  }));
  const paid = installments.filter((it) => it.status === "PAID").reduce((s, it) => s + it.amount, 0);
  return {
    courseName: plan.courseName ?? raw.coursesOfInterest?.[0] ?? "Enrolled program",
    totalAmount: plan.totalAmount ?? 0,
    currency: (plan.currency as PaymentPlanSummary["currency"]) ?? "EGP",
    paid,
    status: (plan.status as PaymentPlanSummary["status"]) ?? "PENDING",
    method: plan.paymentMethod,
    installments,
  };
}

/** Map every payment plan on the lead (a lead may carry several). */
function mapPaymentPlans(raw: any): PaymentPlanSummary[] {
  const plans = raw?.data?.paymentPlans;
  return Array.isArray(plans) ? plans.filter(Boolean).map((p: any) => mapOnePlan(p, raw)) : [];
}

function formatDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function mapLead(raw: any): Lead {
  const pipelines: any[] = Array.isArray(raw.pipelines) ? raw.pipelines : [];
  const rawStage = pipelines[0]?.stage ?? raw.data?.pipelineStage ?? "new";
  const activities: LeadActivity[] = (raw.activities ?? []).map((a: any) => ({
    id: a._id ?? a.id ?? `${a.action}-${a.performedAt}`,
    kind: activityKind(a.action ?? ""),
    text: a.action ?? "",
    ago: relativeTime(a.performedAt),
    at: a.performedAt ?? a.createdAt ?? undefined,
    notes: a.notes ?? a.note ?? undefined,
  }));
  const pipelineHistory: PipelineHistoryEntry[] = (raw.data?.pipelineHistory ?? []).map((h: any) => ({
    stage: h.stage ?? "",
    at: h.at ?? "",
    pipelineId: h.pipelineId ?? undefined,
    pipelineName: h.pipelineName ?? undefined,
    logData: h.logData ?? undefined,
  }));
  const followUps: FollowUp[] = (raw.data?.followUps ?? []).map((f: any, i: number) => ({
    id: f.id ?? `fu_${i}`,
    note: f.note ?? "",
    date: f.date ?? formatDate(f.dueDate),
    status: followUpStatus(f),
    dueDate: f.dueDate || undefined,
    doneNote: f.doneNote || undefined,
  }));
  const certificates: LeadCertificate[] = (raw.data?.certificates ?? [])
    .map((c: any) => ({
      code: c.certificateCode ?? "—",
      link: c.certificateLink ?? "",
      date: formatDate(c.assignedAt ?? c.createdAt),
      groupId: c.groupId ?? undefined,
    }))
    .filter((c: LeadCertificate) => c.link);

  return {
    id: raw._id ?? raw.id,
    fullName: raw.fullName ?? "—",
    email: raw.email ?? "",
    phone: raw.phone ?? "",
    phoneCountryCode: raw.phoneCountryCode ?? "",
    whatsApp: raw.whatsApp,
    country: raw.country ?? "",
    specialty: raw.specialty ?? raw["6a05e1f537c10d66e58aff55"],
    educationLevel: raw.educationLevel ?? raw["6a0608f837c10d66e58b01da"],
    source: raw.source ?? raw["6a05eda937c10d66e58b0154"] ?? "—",
    gender: raw.gender,
    // The backend populates coursesOfInterest with {_id, titleEn, titleAr};
    // keep ids for the form, expose names for the list column.
    coursesOfInterest: (raw.coursesOfInterest ?? []).map((c: any) =>
      typeof c === "object" && c ? String(c._id ?? c.id ?? "") : String(c),
    ).filter(Boolean),
    courseNames: (raw.coursesOfInterest ?? [])
      .map((c: any) => (typeof c === "object" && c ? (c.titleEn ?? c.titleAr ?? c.title ?? "") : ""))
      .filter(Boolean),
    jobTitle: raw.jobTitle ?? raw.data?.jobTitle,
    counselorId: raw.counselor?._id ?? raw.counselorId ?? "",
    counselorName: raw.counselor?.name ?? raw.counselorName ?? "Unassigned",
    priority: (raw.priority as LeadPriority) ?? "warm",
    score: typeof raw.score === "number" ? raw.score : 0,
    stageKey: STAGE_MAP[rawStage] ?? "new",
    createdAt: relativeTime(raw.createdAt),
    createdAtISO: raw.createdAt,
    pipelineName: pipelines[0]?.title ?? undefined,
    lastActivity: relativeTime(raw.activities?.[raw.activities.length - 1]?.performedAt ?? raw.updatedAt),
    pinnedNote: raw.data?.note || undefined,
    activities,
    followUps,
    paymentPlan: mapPaymentPlans(raw)[0],
    paymentPlans: mapPaymentPlans(raw),
    certificates,
    assignedPipelineIds: pipelines.map((p) => p._id ?? p.id).filter(Boolean),
    pipelines: pipelines
      .map((p) => ({ id: p._id ?? p.id, title: p.title ?? "Pipeline", stage: p.stage ?? "" }))
      .filter((p) => p.id),
    pipelineHistory,
    rawData: raw.data ?? undefined,
  };
}
