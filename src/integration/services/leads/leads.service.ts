import { api, type Result } from "@integration/services/http/client";
import { LEADS_API } from "@integration/constants/api/leads";
import type {
  Lead,
  CreateLeadDto,
  UpdateLeadDto,
} from "./types";

export function listLeads(params?: any): Promise<Result<{ data: Lead[], meta: any }>> {
  return api.get<{ data: Lead[], meta: any }>(LEADS_API.LIST, { params });
}

export function getLeadById(id: string): Promise<Result<Lead>> {
  return api.get<Lead>(LEADS_API.GET(id));
}

export function createLead(input: CreateLeadDto): Promise<Result<Lead>> {
  return api.post<Lead>(LEADS_API.CREATE, input);
}

export function updateLead(id: string, input: UpdateLeadDto): Promise<Result<Lead>> {
  return api.patch<Lead>(LEADS_API.UPDATE(id), input);
}

/** Public endpoint — no auth required. Phone is the local number without country code. */
export function checkLeadPhone(phone: string): Promise<Result<{ exists: boolean; leadId?: string }>> {
  return api.get<{ exists: boolean; leadId?: string }>(LEADS_API.CHECK_PHONE(phone), {
    requireAuth: false,
  });
}

export function deleteLead(id: string): Promise<Result<void>> {
  return api.delete<void>(LEADS_API.DELETE(id));
}

export function listPipelines(): Promise<Result<{ data: any[]; stats: any }>> {
  return api.get<{ data: any[]; stats: any }>(LEADS_API.PIPELINES.LIST);
}

export function getPipelineById(id: string): Promise<Result<any>> {
  return api.get<any>(LEADS_API.PIPELINES.GET(id));
}

export function getPipelineView(id: string): Promise<Result<any>> {
  return api.get<any>(LEADS_API.PIPELINES.VIEW(id));
}

export function createPipeline(input: {
  title: string;
  description?: string;
  salesAgent?: string;
  isPrimary?: boolean;
}): Promise<Result<any>> {
  return api.post<any>(LEADS_API.PIPELINES.CREATE, input);
}

export function updatePipeline(
  id: string,
  input: {
    title?: string;
    description?: string;
    salesAgent?: string;
    isActive?: boolean;
    isPrimary?: boolean;
  }
): Promise<Result<any>> {
  return api.patch<any>(LEADS_API.PIPELINES.UPDATE(id), input);
}

export function deletePipeline(id: string): Promise<Result<void>> {
  return api.delete<void>(LEADS_API.PIPELINES.DELETE(id));
}

export function updateLeadStage(
  id: string,
  input: { stage: string; data?: any; pipelineId?: string }
): Promise<Result<Lead>> {
  return api.patch<Lead>(LEADS_API.STAGE(id), input);
}

/** Append an activity/note to a lead's timeline (POST /crm/leads/:id/activities).
 * The backend stamps `performedAt` and pushes onto `lead.activities`. */
export function addLeadActivity(
  id: string,
  input: { action: string; note?: string },
): Promise<Result<Lead>> {
  return api.post<Lead>(LEADS_API.ACTIVITIES(id), input);
}

export function exportLeads(): Promise<Result<void>> {
  return api.download(LEADS_API.EXPORT, "leads_export.xlsx");
}

export function bulkMovePipeline(leadIds: string[], pipeline: string): Promise<Result<void>> {
  return api.patch<void>(LEADS_API.BULK_PIPELINE, { leadIds, pipeline });
}

export function addLeadToPipelines(
  leadIds: string[],
  pipelineIds: string[],
): Promise<Result<void>> {
  return api.post<void>(LEADS_API.ADD_TO_PIPELINES, { leadIds, pipelineIds });
}

export function updateLeadPipelines(
  leadIds: string[],
  pipelineIds: string[],
): Promise<Result<void>> {
  return api.patch<void>(LEADS_API.ADD_TO_PIPELINES, { leadIds, pipelineIds });
}

export function bulkChangeStage(leadIds: string[], stage: string): Promise<Result<void>> {
  return api.patch<void>(LEADS_API.BULK_STAGE, { leadIds, stage });
}

export function assignCounselor(staffId: string, leadIds: string[]): Promise<Result<void>> {
  return api.post<void>(LEADS_API.ASSIGN_COUNSELOR, { staffId, leadIds });
}

export function getCrmDashboard(params?: { days?: number }): Promise<Result<any>> {
  return api.get<any>(LEADS_API.DASHBOARD, { params });
}

/**
 * Export CRM dashboard data as Excel file.
 */
export function exportCrmDashboard(filename: string): Promise<Result<void>> {
  return api.download(LEADS_API.DASHBOARD_EXPORT, filename);
}

export function assignCertificateToLead(id: string, input: {
  groupId?: string;
  lmsId?: string;
  studentId?: string;
  certificateLink: string;
}): Promise<Result<any>> {
  return api.post<any>(LEADS_API.ASSIGN_CERTIFICATE(id), input);
}

