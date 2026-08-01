import { api, type Result } from "@integration/services/http/client";

const BASE = "/admin/whatsapp";

export interface WaStatusDto { configured: boolean; phoneId: string; version: string }
export interface WaGroupDto { name: string; count: number; phoneCount: number }
export interface WaTemplateDto {
  _id: string; name: string; language: string; category: string; body: string; variables: number; status: string;
}
export interface WaRecipient { phone: string; name?: string; params?: string[] }
export interface WaCampaignDto {
  _id: string; name: string; templateName: string; language: string; bodyPreview: string;
  defaultParams: string; recipients: { phone: string; name?: string }[];
  status: string; total: number; sentCount: number; failedCount: number; sentAt?: string; createdAt: string;
}
export interface WaAutomationDto {
  _id: string; name: string; trigger: string; triggerTag?: string; steps?: string; active: boolean; sentCount: number; createdAt: string;
}
export interface WaSendResult { sent: number; failed: number; total: number; errors: string[] }

export const getStatus = (): Promise<Result<WaStatusDto>> => api.get(`${BASE}/status`, { revalidate: false });
export const getGroups = (): Promise<Result<WaGroupDto[]>> => api.get(`${BASE}/groups`, { revalidate: false });

export const listTemplates = (): Promise<Result<WaTemplateDto[]>> => api.get(`${BASE}/templates`, { revalidate: false });
export const createTemplate = (input: Record<string, unknown>): Promise<Result<WaTemplateDto>> => api.post(`${BASE}/templates`, input);
export const updateTemplate = (id: string, input: Record<string, unknown>): Promise<Result<WaTemplateDto>> => api.patch(`${BASE}/templates/${id}`, input);
export const removeTemplate = (id: string): Promise<Result<{ success: boolean }>> => api.delete(`${BASE}/templates/${id}`);

export const listCampaigns = (): Promise<Result<WaCampaignDto[]>> => api.get(`${BASE}/campaigns`, { revalidate: false });
export const createCampaign = (input: Record<string, unknown>): Promise<Result<WaCampaignDto>> => api.post(`${BASE}/campaigns`, input);
export const sendCampaign = (id: string): Promise<Result<WaSendResult>> => api.post(`${BASE}/campaigns/${id}/send`, {});
export const removeCampaign = (id: string): Promise<Result<{ success: boolean }>> => api.delete(`${BASE}/campaigns/${id}`);

export const sendBulk = (input: Record<string, unknown>): Promise<Result<WaSendResult>> => api.post(`${BASE}/send-bulk`, input);
export const testSend = (input: Record<string, unknown>): Promise<Result<{ success: boolean }>> => api.post(`${BASE}/test`, input);

export const listAutomations = (): Promise<Result<WaAutomationDto[]>> => api.get(`${BASE}/automations`, { revalidate: false });
export const createAutomation = (input: Record<string, unknown>): Promise<Result<WaAutomationDto>> => api.post(`${BASE}/automations`, input);
export const updateAutomation = (id: string, input: Record<string, unknown>): Promise<Result<WaAutomationDto>> => api.patch(`${BASE}/automations/${id}`, input);
export const removeAutomation = (id: string): Promise<Result<{ success: boolean }>> => api.delete(`${BASE}/automations/${id}`);
