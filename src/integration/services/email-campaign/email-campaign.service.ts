import { api, type Result } from "@integration/services/http/client";
import {
  API_EMAIL_STATS, API_EMAIL_SEGMENTS, API_EMAIL_AUDIENCES, API_EMAIL_RECIPIENTS_PREVIEW,
  API_EMAIL_CAMPAIGNS, apiEmailCampaign, apiEmailCampaignAction,
  API_EMAIL_TEMPLATES, apiEmailTemplate, apiEmailTemplateDesign,
  API_EMAIL_TEMPLATE_CATEGORIES, apiEmailTemplateCategory,
  API_EMAIL_AUTOMATIONS, apiEmailAutomation, apiEmailAutomationToggle,
  API_EMAIL_BRAND_BLOCKS, apiEmailBrandBlock,
  API_EMAIL_SUBSCRIBERS, apiEmailSubscriber, API_EMAIL_SUBSCRIBERS_IMPORT, API_EMAIL_SUBSCRIBERS_BULK_DELETE,
  API_EMAIL_SUBSCRIBERS_ASSIGN, API_EMAIL_SUBSCRIBERS_UNASSIGN,
  API_EMAIL_SUBSCRIBER_GROUPS, apiEmailSubscriberGroup, API_EMAIL_SUBSCRIBER_GROUP_LINKS,
} from "@integration/constants/api/email";
import type {
  CampaignDto, TemplateDto, TemplateCategoryDto, AutomationDto, BrandBlockDto, EmailStatsDto, SegmentDto,
  AudienceDto, RecipientsPreviewDto, ManualRecipientDto, SubscriberDto, SubscriberGroupDto,
} from "./types";

/* Stats + segments + audiences */
export const getStats = () => api.get<EmailStatsDto>(API_EMAIL_STATS);
export const getSegments = () => api.get<SegmentDto[]>(API_EMAIL_SEGMENTS);
export const getAudiences = () => api.get<AudienceDto[]>(API_EMAIL_AUDIENCES);
export const previewRecipients = (sources: string[], manualRecipients: ManualRecipientDto[]) =>
  api.post<RecipientsPreviewDto>(API_EMAIL_RECIPIENTS_PREVIEW, { sources, manualRecipients });

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

/* Template categories */
export const listTemplateCategories = () => api.get<TemplateCategoryDto[]>(API_EMAIL_TEMPLATE_CATEGORIES);
export const createTemplateCategory = (name: string, kind?: string) => api.post<TemplateCategoryDto>(API_EMAIL_TEMPLATE_CATEGORIES, { name, ...(kind ? { kind } : {}) });
export const syncCourseTemplateCategories = () => api.post<{ synced: number; created: number }>(`${API_EMAIL_TEMPLATE_CATEGORIES}/sync-courses`, {});
export const renameTemplateCategory = (oldName: string, name: string) => api.patch<TemplateCategoryDto>(apiEmailTemplateCategory(oldName), { name });
export const deleteTemplateCategory = (name: string) => api.delete<{ success: boolean }>(apiEmailTemplateCategory(name));

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

/* Subscribers */
export const listSubscribers = (search?: string, group?: string) => {
  const q = new URLSearchParams();
  if (search) q.set("search", search);
  if (group && group !== "all") q.set("group", group);
  const qs = q.toString();
  return api.get<SubscriberDto[]>(qs ? `${API_EMAIL_SUBSCRIBERS}?${qs}` : API_EMAIL_SUBSCRIBERS);
};
export const addSubscriber = (input: Record<string, unknown>) => api.post<SubscriberDto>(API_EMAIL_SUBSCRIBERS, input);
export const importSubscribers = (subscribers: { email: string; name?: string; phone?: string }[], group?: string) =>
  api.post<{ imported: number; created: number; group: string | null; count: number }>(
    API_EMAIL_SUBSCRIBERS_IMPORT, { subscribers, ...(group ? { group } : {}) },
  );
export const deleteSubscriber = (id: string) => api.delete<{ success: boolean }>(apiEmailSubscriber(id));
export const bulkDeleteSubscribers = (ids: string[]) => api.post<{ success: boolean; deleted: number }>(API_EMAIL_SUBSCRIBERS_BULK_DELETE, { ids });
export const assignSubscribersGroup = (ids: string[], group: string) => api.post<{ success: boolean; modified: number }>(API_EMAIL_SUBSCRIBERS_ASSIGN, { ids, group });
export const unassignSubscribersGroup = (ids: string[], group: string) => api.post<{ success: boolean; modified: number }>(API_EMAIL_SUBSCRIBERS_UNASSIGN, { ids, group });

/* Subscriber groups */
export const listSubscriberGroups = () => api.get<SubscriberGroupDto[]>(API_EMAIL_SUBSCRIBER_GROUPS);
export const createSubscriberGroup = (name: string, kind?: string) => api.post<SubscriberGroupDto>(API_EMAIL_SUBSCRIBER_GROUPS, { name, ...(kind ? { kind } : {}) });
export const syncCourseGroups = () => api.post<{ synced: number; created: number }>(`${API_EMAIL_SUBSCRIBER_GROUPS}/sync-courses`, {});
export const renameSubscriberGroup = (oldName: string, name: string) => api.patch<SubscriberGroupDto>(apiEmailSubscriberGroup(oldName), { name });
export const setSubscriberGroupPaths = (name: string, paths: string[]) => api.patch<SubscriberGroupDto>(`${apiEmailSubscriberGroup(name)}/paths`, { paths });
export const linkPathToGroups = (path: string, groups: string[]) => api.patch<{ path: string; groups: string[] }>(API_EMAIL_SUBSCRIBER_GROUP_LINKS, { path, groups });
export const deleteSubscriberGroup = (name: string) => api.delete<{ success: boolean }>(apiEmailSubscriberGroup(name));

export type { Result };
