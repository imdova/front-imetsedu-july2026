/**
 * CRM Data Access Layer — leads, pipeline, counselors, dashboard stats. The UI
 * imports from here only; swap the `db.*` calls for the integration `leads` /
 * `crm` services to go live (Result shape is already identical).
 */
import { ok, fail, toMessage, api, type Result } from "@integration/lib/api-client";
import * as leadsSvc from "@integration/services/leads";
import * as crmSettingsSvc from "@integration/services/crm-settings";
import * as invoicesSvc from "@integration/services/invoices";
import * as db from "@/lib/db/crm";
import { mapLead, STAGE_MAP } from "@/lib/crm/map-lead";
import { mapCrmStats } from "@/lib/crm/map-stats";

const arr = <T>(x: unknown): T[] =>
  Array.isArray(x) ? (x as T[]) : ((x as { data?: T[] })?.data ?? []);

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("") || "?";

/** Canonical UI stage key → a likely backend key (fallback when the pipeline
 * can't be resolved). The pipeline's own stages take precedence below. */
const REVERSE_STAGE: Record<string, string> = {
  new: "new_inquiries",
  contacted: "contacted",
  waiting_payment: "waiting_payment",
  enrolled: "enrolled",
  lost: "lost",
};

async function wrap<T>(fn: () => Promise<T>, msg: string): Promise<Result<T>> {
  try {
    return ok(await fn());
  } catch (err) {
    return fail(toMessage(err, msg));
  }
}

/** LIVE: leads from GET /crm/leads. Server-supported filters (search, stage,
 * priority, source, counselor, pipeline, dateRange) are pushed to the API per
 * the backend QueryLeadDto; specialty / country / course are filtered client-side
 * since the backend has no query support for them. */
export const fetchLeads = async (filters: db.LeadFilters = {}): Promise<Result<db.Lead[]>> => {
  const f = (v?: string) => (v && v !== "all" ? v : undefined);
  const res = await leadsSvc.listLeads({
    limit: 200,
    search: f(filters.search),
    stage: filters.stage && filters.stage !== "all" ? (REVERSE_STAGE[filters.stage] ?? filters.stage) : undefined,
    priority: f(filters.priority),
    counselor: f(filters.counselorId),
    pipeline: f(filters.pipeline),
    dateRange: f(filters.dateRange),
  });
  if (!res.ok) return res;
  try {
    let rows = (Array.isArray(res.data?.data) ? res.data.data : []).map(mapLead);
    // Client-side narrowing for fields the backend can't query (or that it
    // enum-validates, like `source`, which would reject custom CRM sources).
    if (f(filters.source)) rows = rows.filter((r) => r.source === filters.source);
    if (f(filters.specialty)) rows = rows.filter((r) => r.specialty === filters.specialty);
    if (f(filters.country)) rows = rows.filter((r) => r.country === filters.country);
    if (f(filters.courseId)) rows = rows.filter((r) => r.coursesOfInterest.includes(filters.courseId!));
    return ok(rows);
  } catch (err) {
    return fail(toMessage(err, "Failed to map leads"));
  }
};

/** LIVE: download the filtered leads as an Excel file (GET /crm/leads/export). */
export const exportLeads = () => leadsSvc.exportLeads();

/* ── Bulk actions on selected leads ───────────────────────────────────── */

/** LIVE: assign many leads to one counselor (POST /crm/leads/assign-counselor). */
export const bulkAssignCounselor = (leadIds: string[], counselorId: string) =>
  leadsSvc.assignCounselor(counselorId, leadIds);

/** LIVE: move many leads to a pipeline stage (PATCH /crm/leads/bulk-stage). The
 * canonical UI stage key is mapped to a backend stage key. */
export const bulkSetStage = (leadIds: string[], stageKey: string) =>
  leadsSvc.bulkChangeStage(leadIds, REVERSE_STAGE[stageKey] ?? stageKey);

/** LIVE: move many leads to a different pipeline (PATCH /crm/leads/bulk-pipeline). */
export const bulkMovePipeline = (leadIds: string[], pipelineId: string) =>
  leadsSvc.bulkMovePipeline(leadIds, pipelineId);

/** LIVE: delete many leads (DELETE /crm/leads/:id per id). Returns the count
 * actually removed so the UI can report partial failures. */
export const bulkDeleteLeads = async (leadIds: string[]): Promise<Result<number>> => {
  const results = await Promise.all(leadIds.map((id) => leadsSvc.deleteLead(id)));
  const removed = results.filter((r) => r.ok).length;
  if (removed === 0 && results[0] && !results[0].ok) return results[0];
  return ok(removed);
};
/** LIVE: single lead from the backend (GET /crm/leads/:id), mapped. */
export const fetchLead = async (id: string): Promise<Result<db.Lead | null>> => {
  const res = await leadsSvc.getLeadById(id);
  if (!res.ok) return res;
  try {
    return ok(res.data ? mapLead(res.data) : null);
  } catch (err) {
    return fail(toMessage(err, "Failed to map lead"));
  }
};
/** LIVE: duplicate check via GET /crm/leads/check-phone/:phone. When a match is
 * found, the lead is fetched so the UI can show its name + deep-link. */
export const checkPhone = async (
  phone: string,
): Promise<Result<db.Lead | null>> => {
  const local = phone.replace(/\D/g, "");
  if (!local) return ok(null);
  const res = await leadsSvc.checkLeadPhone(local);
  if (!res.ok) return res;
  if (!res.data?.exists || !res.data.leadId) return ok(null);
  const leadRes = await leadsSvc.getLeadById(res.data.leadId);
  if (!leadRes.ok) return ok(null);
  try {
    return ok(leadRes.data ? mapLead(leadRes.data) : null);
  } catch {
    return ok(null);
  }
};

/** LIVE: create a lead via POST /crm/leads. Maps the UI input to the backend
 * DTO (lead temperature → priority, target pipeline → pipeline). */
export const createLead = async (
  input: db.CreateLeadInput,
): Promise<Result<db.Lead>> => {
  const res = await leadsSvc.createLead({
    fullName: input.fullName || undefined,
    email: input.email || undefined,
    phone: input.phone || undefined,
    phoneCountryCode: input.phoneCountryCode || undefined,
    whatsApp: input.whatsApp || undefined,
    whatsAppCountryCode: input.whatsAppCountryCode || undefined,
    country: input.country || undefined,
    specialty: input.specialty || undefined,
    educationLevel: input.educationLevel || undefined,
    source: input.source || undefined,
    dateOfBirth: input.dateOfBirth || undefined,
    gender: input.gender,
    coursesOfInterest: input.coursesOfInterest?.length ? input.coursesOfInterest : undefined,
    jobTitle: input.jobTitle || undefined,
    counselor: input.counselorId || undefined,
    priority: input.leadType,
    pipeline: input.targetPipeline || undefined,
    data: input.jobTitle ? { jobTitle: input.jobTitle } : undefined,
  });
  if (!res.ok) return res;
  try {
    return ok(mapLead(res.data));
  } catch (err) {
    return fail(toMessage(err, "Failed to create lead"));
  }
};

/** LIVE: full edit of a lead's fields via PATCH /crm/leads/:id (UpdateLeadDto is
 * a partial of CreateLeadDto, so the same field mapping applies). */
export const updateLead = async (
  id: string,
  input: db.CreateLeadInput,
): Promise<Result<db.Lead>> => {
  const res = await leadsSvc.updateLead(id, {
    fullName: input.fullName || undefined,
    email: input.email || undefined,
    phone: input.phone || undefined,
    phoneCountryCode: input.phoneCountryCode || undefined,
    whatsApp: input.whatsApp || undefined,
    whatsAppCountryCode: input.whatsAppCountryCode || undefined,
    country: input.country || undefined,
    specialty: input.specialty || undefined,
    educationLevel: input.educationLevel || undefined,
    source: input.source || undefined,
    dateOfBirth: input.dateOfBirth || undefined,
    gender: input.gender,
    coursesOfInterest: input.coursesOfInterest?.length ? input.coursesOfInterest : undefined,
    jobTitle: input.jobTitle || undefined,
    counselor: input.counselorId || undefined,
    priority: input.leadType,
    data: input.jobTitle ? { jobTitle: input.jobTitle } : undefined,
  });
  if (!res.ok) return res;
  try {
    return ok(mapLead(res.data));
  } catch (err) {
    return fail(toMessage(err, "Failed to update lead"));
  }
};
/** LIVE: patch top-level lead fields and/or merge into `lead.data` (notes,
 * follow-ups, job title) via PATCH /crm/leads/:id. Existing `data` is read first
 * so a partial `dataPatch` doesn't clobber sibling keys. Returns the mapped lead. */
export const updateLeadFields = async (
  id: string,
  patch: { jobTitle?: string; dataPatch?: Record<string, unknown> },
): Promise<Result<db.Lead>> => {
  let data: Record<string, unknown> | undefined;
  if (patch.dataPatch) {
    const cur = await leadsSvc.getLeadById(id);
    const existing = (cur.ok && (cur.data as { data?: Record<string, unknown> })?.data) || {};
    data = { ...existing, ...patch.dataPatch };
  }
  const res = await leadsSvc.updateLead(id, {
    ...(patch.jobTitle !== undefined ? { jobTitle: patch.jobTitle, data: { ...(data ?? {}), jobTitle: patch.jobTitle } } : {}),
    ...(data && patch.jobTitle === undefined ? { data } : {}),
  });
  if (!res.ok) return res;
  try {
    return ok(mapLead(res.data));
  } catch (err) {
    return fail(toMessage(err, "Failed to update lead"));
  }
};

/** LIVE: assign a completion certificate to a lead (POST /crm/leads/:id/certificate).
 * The backend generates a code, stores it on `lead.data.certificates`, and logs an
 * activity. Re-reads the lead so the issued-certificates list reflects the new entry. */
export const assignCertificate = async (
  leadId: string,
  input: { groupId?: string; lmsId?: string; certificateLink: string },
): Promise<Result<db.Lead>> => {
  const res = await leadsSvc.assignCertificateToLead(leadId, input);
  if (!res.ok) return res;
  const leadRes = await leadsSvc.getLeadById(leadId);
  if (!leadRes.ok) return leadRes;
  try {
    return ok(mapLead(leadRes.data));
  } catch (err) {
    return fail(toMessage(err, "Failed to assign certificate"));
  }
};

/** LIVE: add or update ONE payment plan in `lead.data.paymentPlans` without
 * disturbing the others. Reads the lead's current raw plans first, then writes
 * the full array back (so a lead can carry several plans). Pass `index` to edit
 * an existing plan, omit it to append a new one. */
export const savePaymentPlan = async (
  leadId: string,
  plan: Record<string, unknown>,
  index?: number,
): Promise<Result<db.Lead>> => {
  const cur = await leadsSvc.getLeadById(leadId);
  const data = (cur.ok && (cur.data as { data?: Record<string, unknown> })?.data) || {};
  const plans: unknown[] = Array.isArray((data as { paymentPlans?: unknown[] }).paymentPlans)
    ? [...(data as { paymentPlans: unknown[] }).paymentPlans]
    : [];
  const isEdit = typeof index === "number" && index >= 0 && index < plans.length;
  const planIndex = isEdit ? (index as number) : plans.length;
  if (isEdit) plans[planIndex] = plan;
  else plans.push(plan);
  const res = await leadsSvc.updateLead(leadId, { data: { ...data, paymentPlans: plans } } as never);
  if (!res.ok) return res;
  // Editing an existing plan only writes the lead's own `data.paymentPlans`;
  // each installment also has its own invoice doc (auto-created by the
  // backend when the plan was first made) that this won't touch, so push
  // the edited due date into each installment's invoice too — same compound
  // id format the invoices list/detail endpoints already use
  // (leadId-planIndex-installmentIndex, installmentIndex 0-based).
  // `amount` isn't accepted by this endpoint for installment invoices (the
  // backend DTO rejects it outright: "property amount should not exist"),
  // so only the due date can be kept in sync this way.
  if (isEdit) {
    const installments = (plan as { installments?: { index: number; dueDate: string }[] }).installments ?? [];
    const invoiceResults = await Promise.all(
      installments.map((inst) => {
        const invoiceId = `${leadId}-${planIndex}-${inst.index - 1}`;
        return invoicesSvc.updateInvoice(invoiceId, {
          dueDate: inst.dueDate,
        }).then((r) => ({ invoiceId, r }));
      }),
    );
    for (const { invoiceId, r } of invoiceResults) {
      if (!r.ok) console.error(`Failed to sync invoice ${invoiceId}:`, r.error);
    }
  }
  try {
    return ok(mapLead(res.data));
  } catch (err) {
    return fail(toMessage(err, "Failed to save payment plan"));
  }
};

/** LIVE: mark a single installment as PAID and attach a receipt URL.
 * Adds/updates an entry in plan.receipts (scope = installment.index),
 * sets the installment status to PAID, and recalculates the plan status. */
export const markInstallmentPaid = async (
  leadId: string,
  planIndex: number,
  installmentIndex: number,
  receipt: { url: string; name: string; size: number; type: string },
): Promise<Result<db.Lead>> => {
  const cur = await leadsSvc.getLeadById(leadId);
  if (!cur.ok) return cur;
  const data: any = (cur.data as any)?.data ?? {};
  const plans: any[] = Array.isArray(data.paymentPlans) ? [...data.paymentPlans] : [];
  if (planIndex < 0 || planIndex >= plans.length) return fail("Plan not found");

  const plan = { ...plans[planIndex] };

  plan.installments = (plan.installments ?? []).map((inst: any) =>
    inst.index === installmentIndex
      ? { ...inst, status: "PAID", paidDate: new Date().toISOString() }
      : inst,
  );

  const receipts: any[] = Array.isArray(plan.receipts) ? [...plan.receipts] : [];
  const existingIdx = receipts.findIndex((r: any) => r.scope === installmentIndex);
  const entry = {
    id: `receipt-${Date.now()}`,
    scope: installmentIndex,
    previewUrl: receipt.url,
    name: receipt.name,
    size: receipt.size,
    type: receipt.type,
    attachedAt: new Date().toISOString(),
  };
  if (existingIdx >= 0) receipts[existingIdx] = entry;
  else receipts.push(entry);
  plan.receipts = receipts;

  const allPaid = plan.installments.every((inst: any) => inst.status === "PAID");
  const anyPaid = plan.installments.some((inst: any) => inst.status === "PAID");
  plan.status = allPaid ? "PAID" : anyPaid ? "PARTIAL" : "PENDING";

  plans[planIndex] = plan;
  const res = await leadsSvc.updateLead(leadId, { data: { ...data, paymentPlans: plans } } as never);
  if (!res.ok) return res;
  try {
    return ok(mapLead(res.data));
  } catch (err) {
    return fail(toMessage(err, "Failed to mark installment paid"));
  }
};

/** LIVE: remove ONE payment plan (by index) from `lead.data.paymentPlans`. */
export const deletePaymentPlan = async (
  leadId: string,
  index: number,
): Promise<Result<db.Lead>> => {
  const cur = await leadsSvc.getLeadById(leadId);
  const data = (cur.ok && (cur.data as { data?: Record<string, unknown> })?.data) || {};
  const plans: unknown[] = Array.isArray((data as { paymentPlans?: unknown[] }).paymentPlans)
    ? [...(data as { paymentPlans: unknown[] }).paymentPlans]
    : [];
  if (index < 0 || index >= plans.length) return fail("Payment plan not found");
  plans.splice(index, 1);
  const res = await leadsSvc.updateLead(leadId, { data: { ...data, paymentPlans: plans } } as never);
  if (!res.ok) return res;
  try {
    return ok(mapLead(res.data));
  } catch (err) {
    return fail(toMessage(err, "Failed to delete payment plan"));
  }
};

/** LIVE: append a note/activity to the lead's timeline (POST /crm/leads/:id/activities).
 * The backend keeps every entry and stamps `performedAt`, so notes accumulate in the
 * Activity timeline rather than overwriting a single field. Returns the mapped lead. */
export const addLeadActivity = async (
  id: string,
  action: string,
  note?: string,
): Promise<Result<db.Lead>> => {
  const res = await leadsSvc.addLeadActivity(id, { action, note });
  if (!res.ok) return res;
  try {
    return ok(mapLead(res.data));
  } catch (err) {
    return fail(toMessage(err, "Failed to add note"));
  }
};

/** LIVE: replace the lead's pipeline membership (PATCH /crm/leads/add-to-pipelines),
 * then re-read the lead so the UI reflects the server's canonical state. */
export const setLeadPipelines = async (
  leadId: string,
  pipelineIds: string[],
): Promise<Result<db.Lead>> => {
  const res = await leadsSvc.updateLeadPipelines([leadId], pipelineIds);
  if (!res.ok) return res;
  const leadRes = await leadsSvc.getLeadById(leadId);
  if (!leadRes.ok) return leadRes;
  try {
    return ok(leadRes.data ? mapLead(leadRes.data) : (null as never));
  } catch (err) {
    return fail(toMessage(err, "Failed to reload lead"));
  }
};

/** LIVE: move a lead to a stage via PATCH /crm/leads/:id/stage. Resolves the
 * lead's pipeline and maps the canonical UI stage to that pipeline's own key. */
export const updateLeadStage = async (
  id: string,
  stageKey: string,
  logData?: db.PipelineHistoryEntry["logData"],
  existingHistory?: db.PipelineHistoryEntry[],
): Promise<Result<db.Lead | null>> => {
  const leadRes = await leadsSvc.getLeadById(id);
  if (!leadRes.ok) return leadRes;
  const pipelineId: string | undefined = leadRes.data?.pipelines?.[0]?._id;
  const pipelineName: string | undefined = leadRes.data?.pipelines?.[0]?.title;
  if (!pipelineId) return fail("Lead is not assigned to a pipeline");

  // Prefer a stage key that actually exists in this pipeline.
  let backendStage = REVERSE_STAGE[stageKey] ?? stageKey;
  const pRes = await leadsSvc.getPipelineById(pipelineId);
  if (pRes.ok) {
    const stages: Array<{ key: string }> = pRes.data?.stages ?? [];
    const match = stages.find((s) => (STAGE_MAP[s.key] ?? s.key) === stageKey);
    if (match) backendStage = match.key;
  }

  const history = existingHistory ?? (leadRes.data?.data?.pipelineHistory as db.PipelineHistoryEntry[] | undefined) ?? [];
  const updatedHistory: db.PipelineHistoryEntry[] = [
    ...history.filter((h) => h.pipelineId !== pipelineId || h.stage !== backendStage),
    { stage: backendStage, at: new Date().toISOString(), pipelineId, pipelineName, logData: logData ?? {} },
  ];
  const data = { contactChannel: null, contactOutcome: null, notes: null, note: null, pipelineHistory: updatedHistory };

  const res = await leadsSvc.updateLeadStage(id, { stage: backendStage, pipelineId, data });
  if (!res.ok) return res;
  try {
    return ok(res.data ? mapLead(res.data) : null);
  } catch (err) {
    return fail(toMessage(err, "Failed to map lead"));
  }
};
export const fetchPipeline = () => wrap(db.getPipeline, "Failed to load pipeline");

/** LIVE: counselors are staff from GET /user-management/staff. */
export const fetchCounselors = async (): Promise<Result<db.Counselor[]>> => {
  const res = await api.get<unknown>("/user-management/staff", { params: { limit: 200 } });
  if (!res.ok) return res;
  try {
    const rows = arr<{ _id?: string; id?: string; name?: string; fullName?: string; firstName?: string; lastName?: string }>(res.data);
    return ok(
      rows
        .map((r) => {
          const id = r._id ?? r.id ?? "";
          const name = r.name ?? r.fullName ?? [r.firstName, r.lastName].filter(Boolean).join(" ") ?? "";
          return { id, name, initials: initialsOf(name) };
        })
        .filter((c) => c.id && c.name),
    );
  } catch (err) {
    return fail(toMessage(err, "Failed to load counselors"));
  }
};

/** LIVE: a single pipeline's stage list (GET /crm/pipelines/:id) for the
 * per-pipeline status dropdown on the lead detail page. */
export const fetchPipelineStages = async (
  id: string,
): Promise<Result<{ id: string; title: string; stages: { key: string; name: string }[] }>> => {
  const res = await leadsSvc.getPipelineById(id);
  if (!res.ok) return res;
  try {
    const p = res.data as { _id?: string; title?: string; stages?: { key: string; name: string; order?: number }[] };
    return ok({
      id: p._id ?? id,
      title: p.title ?? "Pipeline",
      stages: (p.stages ?? [])
        .slice()
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((s) => ({ key: s.key, name: s.name })),
    });
  } catch (err) {
    return fail(toMessage(err, "Failed to load pipeline"));
  }
};

/** LIVE: Kanban view for a specific pipeline (GET /crm/pipelines/:id/view).
 * Returns the pipeline metadata + leads already grouped by stage. */
export const fetchPipelineView = async (
  id: string,
): Promise<Result<{
  pipeline: { id: string; title: string; stages: db.PipelineStage[] };
  leads: db.Lead[];
}>> => {
  const res = await leadsSvc.getPipelineView(id);
  if (!res.ok) return res;
  try {
    const data = res.data as {
      pipeline?: { _id?: string; title?: string; stages?: { key: string; name: string; order?: number }[] };
      stages?: Record<string, unknown[]>;
    };
    const p = data.pipeline ?? {};
    const stages: db.PipelineStage[] = ((p.stages ?? []) as { key: string; name: string; order?: number }[])
      .slice()
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((s) => ({ key: s.key, name: s.name, order: s.order ?? 0 }));

    const leads: db.Lead[] = Object.entries(data.stages ?? {}).flatMap(([stageKey, rows]) =>
      (rows as unknown[]).map((raw) => {
        const lead = mapLead(raw);
        return { ...lead, stageKey };
      }),
    );

    return ok({
      pipeline: { id: p._id ?? id, title: p.title ?? "Pipeline", stages },
      leads,
    });
  } catch (err) {
    return fail(toMessage(err, "Failed to load pipeline view"));
  }
};

/** LIVE: move a lead to a specific stage within a specific pipeline
 * (PATCH /crm/leads/:id/stage with an explicit pipelineId). */
export const setLeadStageInPipeline = async (
  leadId: string,
  pipelineId: string,
  stageKey: string,
  pipelineName?: string,
  logData?: db.PipelineHistoryEntry["logData"],
  existingHistory?: db.PipelineHistoryEntry[],
): Promise<Result<db.Lead | null>> => {
  const history = existingHistory ?? [];
  const updatedHistory: db.PipelineHistoryEntry[] = [
    ...history.filter((h) => h.pipelineId !== pipelineId || h.stage !== stageKey),
    { stage: stageKey, at: new Date().toISOString(), pipelineId, pipelineName, logData: logData ?? {} },
  ];
  const data = { contactChannel: null, contactOutcome: null, notes: null, note: null, pipelineHistory: updatedHistory };
  const res = await leadsSvc.updateLeadStage(leadId, { stage: stageKey, pipelineId, data });
  if (!res.ok) return res;
  try {
    return ok(res.data ? mapLead(res.data) : null);
  } catch (err) {
    return fail(toMessage(err, "Failed to update stage"));
  }
};

/** LIVE: recruitment pipelines (GET /crm/pipelines) as `{ value, label }` for
 * the lead-creation Target Pipeline picker. */
export const fetchLeadPipelines = async (): Promise<Result<{ value: string; label: string }[]>> => {
  const res = await leadsSvc.listPipelines();
  if (!res.ok) return res;
  try {
    const rows = arr<{ _id?: string; id?: string; title?: string; name?: string }>(res.data);
    return ok(
      rows
        .map((p) => ({ value: p._id ?? p.id ?? "", label: p.title ?? p.name ?? "Untitled" }))
        .filter((p) => p.value),
    );
  } catch (err) {
    return fail(toMessage(err, "Failed to load pipelines"));
  }
};
/** LIVE: CRM dashboard KPIs from GET /crm/dashboard, mapped to UI CrmStats. */
export const fetchCrmStats = async (): Promise<Result<db.CrmStats>> => {
  const res = await leadsSvc.getCrmDashboard();
  if (!res.ok) return res;
  try {
    return ok(mapCrmStats(res.data));
  } catch (err) {
    return fail(toMessage(err, "Failed to map CRM stats"));
  }
};
/** LIVE: lead-form dropdown options (lead source + specialty + education level)
 * from the CRM settings collection (GET /crm/settings).
 * The API returns objects with `_id` as the primary key and `nameEn` as the
 * group identifier. We match first by known `_id`, then fall back to a
 * case-insensitive `nameEn` keyword search so the code stays resilient to
 * minor API changes. */
export const fetchCrmFieldOptions = async (): Promise<Result<{ sources: string[]; specialties: string[]; educationLevels: string[] }>> => {
  const res = await crmSettingsSvc.listCrmSettings();
  if (!res.ok) return res;
  try {
    const list: any[] = Array.isArray(res.data) ? res.data : ((res.data as { data?: any[] })?.data ?? []);

    /** Find options by known _id first, then fall back to nameEn keyword. */
    const optionsFor = (id: string, kw: string): string[] => {
      const byId = list.find((s) => (s?._id ?? s?.id ?? "") === id);
      if (byId) return byId.options ?? [];
      return (list.find((s) => `${s?.nameEn ?? ""}`.toLowerCase().includes(kw))?.options ?? []) as string[];
    };

    return ok({
      sources:       optionsFor("6a05eda937c10d66e58b0154", "source"),
      specialties:   optionsFor("6a05e1f537c10d66e58aff55", "special"),
      educationLevels: optionsFor("6a0608f837c10d66e58b01da", "education"),
    });
  } catch (err) {
    return fail(toMessage(err, "Failed to load CRM options"));
  }
};

/** Map a backend pipeline (from GET /crm/pipelines `data[]`) to the inventory row. */
function mapPipelineSummary(p: any): db.PipelineSummary {
  const leads = p?.leadsCount ?? 0;
  const enrollments = p?.enrollmentsCount ?? 0;
  return {
    id: p?._id ?? p?.id ?? "",
    title: p?.title ?? "Pipeline",
    source: p?.salesAgent?.name ?? "Custom",
    createdAt: p?.createdAt
      ? new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : "—",
    leads,
    enrollments,
    revenue: p?.revenue ?? 0,
    currency: "EGP",
    conversion: leads > 0 ? Math.round((enrollments / leads) * 100) : 0,
    archived: p?.isActive === false,
  };
}

/** LIVE: all pipelines with per-pipeline lead/enrollment/revenue stats (GET /crm/pipelines). */
export const fetchPipelineInventory = async (): Promise<Result<db.PipelineSummary[]>> => {
  const res = await leadsSvc.listPipelines();
  if (!res.ok) return res;
  try {
    return ok((res.data?.data ?? []).map(mapPipelineSummary));
  } catch (err) {
    return fail(toMessage(err, "Failed to load pipelines"));
  }
};

/** LIVE: aggregate pipeline KPIs (the `stats` block of GET /crm/pipelines). */
export const fetchPipelineInventoryStats = async (): Promise<Result<db.PipelineInventoryStats>> => {
  const res = await leadsSvc.listPipelines();
  if (!res.ok) return res;
  const s = (res.data?.stats ?? {}) as Record<string, number>;
  const data = res.data?.data ?? [];
  return ok({
    totalPipelines: s.totalPipelines ?? data.length,
    activePipelines: data.filter((p: any) => p?.isActive !== false).length,
    totalLeads: s.totalLeads ?? 0,
    totalEnrollments: s.totalEnrollments ?? 0,
    totalRevenue: s.totalRevenue ?? 0,
    avgConversion: Math.round(s.avgConversion ?? 0),
  });
};

/** LIVE: create a pipeline (POST /crm/pipelines). Returns the new inventory row. */
export const createPipeline = async (
  input: { title: string; description?: string; isPrimary?: boolean },
): Promise<Result<db.PipelineSummary>> => {
  const res = await leadsSvc.createPipeline(input);
  if (!res.ok) return res;
  try {
    return ok(mapPipelineSummary(res.data));
  } catch (err) {
    return fail(toMessage(err, "Failed to create pipeline"));
  }
};

/** LIVE: delete a pipeline (DELETE /crm/pipelines/:id). */
export const deletePipeline = (id: string): Promise<Result<void>> => leadsSvc.deletePipeline(id);

/** LIVE: email a "set your password" invite to the lead's user account
 * (POST /students/send-set-password). The backend resolves the lead → user. */
export const sendLeadSetPassword = (leadId: string): Promise<Result<unknown>> =>
  api.post<unknown>("/students/send-set-password", { leadId });