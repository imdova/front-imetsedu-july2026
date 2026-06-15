/**
 * CRM Data Access Layer — leads, pipeline, counselors, dashboard stats. The UI
 * imports from here only; swap the `db.*` calls for the integration `leads` /
 * `crm` services to go live (Result shape is already identical).
 */
import { ok, fail, toMessage, api, type Result } from "@integration/lib/api-client";
import * as leadsSvc from "@integration/services/leads";
import * as crmSettingsSvc from "@integration/services/crm-settings";
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
    source: f(filters.source),
    counselor: f(filters.counselorId),
    pipeline: f(filters.pipeline),
    dateRange: f(filters.dateRange),
  });
  if (!res.ok) return res;
  try {
    let rows = (Array.isArray(res.data?.data) ? res.data.data : []).map(mapLead);
    // Client-side narrowing for fields the backend can't query.
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
export const updateLeadStage = async (id: string, stageKey: string): Promise<Result<db.Lead | null>> => {
  const leadRes = await leadsSvc.getLeadById(id);
  if (!leadRes.ok) return leadRes;
  const pipelineId: string | undefined = leadRes.data?.pipelines?.[0]?._id;
  if (!pipelineId) return fail("Lead is not assigned to a pipeline");

  // Prefer a stage key that actually exists in this pipeline.
  let backendStage = REVERSE_STAGE[stageKey] ?? stageKey;
  const pRes = await leadsSvc.getPipelineById(pipelineId);
  if (pRes.ok) {
    const stages: Array<{ key: string }> = pRes.data?.stages ?? [];
    const match = stages.find((s) => (STAGE_MAP[s.key] ?? s.key) === stageKey);
    if (match) backendStage = match.key;
  }

  const res = await leadsSvc.updateLeadStage(id, { stage: backendStage, pipelineId });
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

/** LIVE: move a lead to a specific stage within a specific pipeline
 * (PATCH /crm/leads/:id/stage with an explicit pipelineId). */
export const setLeadStageInPipeline = async (
  leadId: string,
  pipelineId: string,
  stageKey: string,
): Promise<Result<db.Lead | null>> => {
  const res = await leadsSvc.updateLeadStage(leadId, { stage: stageKey, pipelineId });
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
/** LIVE: lead-form dropdown options (lead source + specialty) from the CRM
 * settings collection (GET /crm/settings). Each setting is a named group with
 * an `options` array; we match the group by its English name. */
export const fetchCrmFieldOptions = async (): Promise<Result<{ sources: string[]; specialties: string[] }>> => {
  const res = await crmSettingsSvc.listCrmSettings();
  if (!res.ok) return res;
  try {
    const list: any[] = Array.isArray(res.data) ? res.data : ((res.data as { data?: any[] })?.data ?? []);
    const optionsFor = (kw: string): string[] =>
      (list.find((s) => `${s?.nameEn ?? ""}`.toLowerCase().includes(kw))?.options ?? []) as string[];
    return ok({ sources: optionsFor("source"), specialties: optionsFor("special") });
  } catch (err) {
    return fail(toMessage(err, "Failed to load CRM options"));
  }
};

export const fetchPipelineInventory = () => wrap(db.getPipelineInventory, "Failed to load pipelines");
export const fetchPipelineInventoryStats = () => wrap(db.getPipelineInventoryStats, "Failed to load pipeline stats");

/** LIVE: email a "set your password" invite to the lead's user account
 * (POST /students/send-set-password). The backend resolves the lead → user. */
export const sendLeadSetPassword = (leadId: string): Promise<Result<unknown>> =>
  api.post<unknown>("/students/send-set-password", { leadId });
