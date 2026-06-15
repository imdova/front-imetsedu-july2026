/**
 * Maps a backend CRM lead (Mongo document shape from `GET /crm/leads`) to the
 * UI `Lead` shape the CRM components consume. Pure + client-safe.
 */
import type {
  Lead,
  LeadActivity,
  ActivityKind,
  FollowUp,
  PaymentPlanSummary,
  PlanInstallment,
  PlanInstallmentStatus,
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

function mapPaymentPlan(raw: any): PaymentPlanSummary | undefined {
  const plan = raw?.data?.paymentPlans?.[0];
  if (!plan) return undefined;
  const installments: PlanInstallment[] = (plan.installments ?? []).map((it: any, i: number) => ({
    index: it.index ?? i + 1,
    label: it.label ?? (i === 0 ? "First installment" : "Installment"),
    amount: it.amount ?? 0,
    dueDate: it.paidDate ?? formatDate(it.dueDate),
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
  }));
  const followUps: FollowUp[] = (raw.data?.followUps ?? []).map((f: any, i: number) => ({
    id: f.id ?? `fu_${i}`,
    note: f.note ?? "",
    date: f.date ?? formatDate(f.dueDate),
    status: f.status ?? "upcoming",
  }));

  return {
    id: raw._id ?? raw.id,
    fullName: raw.fullName ?? "—",
    email: raw.email ?? "",
    phone: raw.phone ?? "",
    phoneCountryCode: raw.phoneCountryCode ?? "",
    whatsApp: raw.whatsApp,
    country: raw.country ?? "",
    specialty: raw.specialty,
    educationLevel: raw.educationLevel,
    source: raw.source ?? "—",
    gender: raw.gender,
    coursesOfInterest: raw.coursesOfInterest ?? [],
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
    paymentPlan: mapPaymentPlan(raw),
    assignedPipelineIds: pipelines.map((p) => p._id ?? p.id).filter(Boolean),
    pipelines: pipelines
      .map((p) => ({ id: p._id ?? p.id, title: p.title ?? "Pipeline", stage: p.stage ?? "" }))
      .filter((p) => p.id),
  };
}
