import { api, type Result } from "@integration/services/http/client";
import {
  API_EMAIL_STATS, API_EMAIL_SEGMENTS,
  API_EMAIL_CAMPAIGNS, apiEmailCampaign, apiEmailCampaignAction,
  API_EMAIL_TEMPLATES, apiEmailTemplate, apiEmailTemplateDesign,
  API_EMAIL_AUTOMATIONS, apiEmailAutomation, apiEmailAutomationToggle,
  API_EMAIL_BRAND_BLOCKS, apiEmailBrandBlock,
} from "@integration/constants/api/email";
import type {
  CampaignDto, TemplateDto, AutomationDto, BrandBlockDto, EmailStatsDto, SegmentDto,
} from "./types";

/* Stats + segments */
export const getStats = () => api.get<EmailStatsDto>(API_EMAIL_STATS);
export const getSegments = () => api.get<SegmentDto[]>(API_EMAIL_SEGMENTS);

/* Campaigns */
export const listCampaigns = () => api.get<CampaignDto[]>(API_EMAIL_CAMPAIGNS);
export const getCampaign = (id: string) => api.get<CampaignDto>(apiEmailCampaign(id));
export const createCampaign = (input: Record<string, unknown>) => api.post<CampaignDto>(API_EMAIL_CAMPAIGNS, input);
export const updateCampaign = (id: string, patch: Record<string, unknown>) => api.patch<CampaignDto>(apiEmailCampaign(id), patch);
export const deleteCampaign = (id: string) => api.delete<{ success: boolean }>(apiEmailCampaign(id));
export const sendCampaign = (id: string) => api.post<CampaignDto>(apiEmailCampaignAction(id, "send"), {});
export const scheduleCampaign = (id: string, scheduledAt: string) => api.post<CampaignDto>(apiEmailCampaignAction(id, "schedule"), { scheduledAt });
export const unscheduleCampaign = (id: string) => api.post<CampaignDto>(apiEmailCampaignAction(id, "unschedule"), {});
export const testCampaign = (id: string, email: string) => api.post<{ success: boolean }>(apiEmailCampaignAction(id, "test"), { email });
export const duplicateCampaign = (id: string) => api.post<CampaignDto>(apiEmailCampaignAction(id, "duplicate"), {});
export const saveCampaignDesign = (id: string, design: string, body: string) => api.patch<CampaignDto>(`${apiEmailCampaign(id)}/design`, { design, body });

/* Templates */
export const listTemplates = () => api.get<TemplateDto[]>(API_EMAIL_TEMPLATES);
export const getTemplate = (id: string) => api.get<TemplateDto>(apiEmailTemplate(id));
export const createTemplate = (input: Record<string, unknown>) => api.post<TemplateDto>(API_EMAIL_TEMPLATES, input);
export const updateTemplate = (id: string, patch: Record<string, unknown>) => api.patch<TemplateDto>(apiEmailTemplate(id), patch);
export const deleteTemplate = (id: string) => api.delete<{ success: boolean }>(apiEmailTemplate(id));
export const saveTemplateDesign = (id: string, design: string, body: string) => api.patch<TemplateDto>(apiEmailTemplateDesign(id), { design, body });

/* Automations */
export const listAutomations = () => api.get<AutomationDto[]>(API_EMAIL_AUTOMATIONS);
export const getAutomation = (id: string) => api.get<AutomationDto>(apiEmailAutomation(id));
export const createAutomation = (input: Record<string, unknown>) => api.post<AutomationDto>(API_EMAIL_AUTOMATIONS, input);
export const updateAutomation = (id: string, patch: Record<string, unknown>) => api.patch<AutomationDto>(apiEmailAutomation(id), patch);
export const toggleAutomation = (id: string) => api.post<AutomationDto>(apiEmailAutomationToggle(id), {});
export const deleteAutomation = (id: string) => api.delete<{ success: boolean }>(apiEmailAutomation(id));

/* Brand blocks */
export const listBrandBlocks = () => api.get<BrandBlockDto[]>(API_EMAIL_BRAND_BLOCKS);
export const createBrandBlock = (name: string, block: string) => api.post<BrandBlockDto>(API_EMAIL_BRAND_BLOCKS, { name, block });
export const deleteBrandBlock = (id: string) => api.delete<{ success: boolean }>(apiEmailBrandBlock(id));

export type { Result };
