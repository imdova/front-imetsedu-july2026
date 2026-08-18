import { api, type Result } from "@integration/services/http/client";

const BASE = "/admin/whatsapp";

export interface WaStatusDto { configured: boolean; phoneId: string; version: string; wabaId?: string }
export interface WaGroupDto { name: string; count: number; phoneCount: number; kind?: string }
export interface WaTemplateDto {
  _id: string; name: string; language: string; category: string; folder?: string; body: string; variables: number; status: string;
  headerUrl?: string; headerKind?: string; headerFilename?: string;
}
export interface WaRecipient { phone: string; name?: string; params?: string[] }
export interface WaCampaignDto {
  _id: string; name: string; mode?: string; templateName: string; language: string; bodyPreview: string;
  text?: string; mediaUrl?: string; mediaKind?: string; mediaFilename?: string;
  defaultParams: string; recipients: { phone: string; name?: string }[];
  status: string; total: number; sentCount: number; failedCount: number; sentAt?: string; createdAt: string;
  deliveredCount?: number; deliveryFailedCount?: number; deliveryError?: string;
}
export interface WaMediaUploadDto { url: string; kind: string; mime: string; filename: string }
export interface WaAutomationDto {
  _id: string; name: string; trigger: string; triggerTag?: string; steps?: string; active: boolean; sentCount: number; createdAt: string;
}
export interface WaSendResult { sent: number; failed: number; total: number; errors: string[] }

export const getStatus = (): Promise<Result<WaStatusDto>> => api.get(`${BASE}/status`, { revalidate: false });

export interface WaAccountSettingsDto {
  profile: { about?: string; description?: string; email?: string; profile_picture_url?: string; websites?: string[]; vertical?: string; address?: string };
  phone: { display_phone_number?: string; verified_name?: string; name_status?: string; quality_rating?: string; throughput?: { level?: string } };
  waba: { name?: string; account_review_status?: string; business_verification_status?: string };
}
export const getAccountSettings = (): Promise<Result<WaAccountSettingsDto>> => api.get(`${BASE}/settings`, { revalidate: false });
export const updateWaProfile = (input: Record<string, unknown>): Promise<Result<{ success: boolean }>> => api.post(`${BASE}/settings/profile`, input);
export const updateWaProfilePicture = (form: FormData): Promise<Result<{ success: boolean }>> => api.post(`${BASE}/settings/profile-picture`, form);
export const requestWaDisplayName = (name: string): Promise<Result<{ success: boolean; name: string }>> => api.post(`${BASE}/settings/display-name`, { name });
export const getGroups = (): Promise<Result<WaGroupDto[]>> => api.get(`${BASE}/groups`, { revalidate: false });

export interface WaTemplateFolderDto { name: string; count: number; kind?: string }
export const createGroup = (name: string, kind?: string): Promise<Result<{ success: boolean; name: string }>> => api.post(`${BASE}/groups`, { name, ...(kind ? { kind } : {}) });

export interface WaAnalyticsDto {
  conversations: { total: number; open: number; resolved: number; unread: number; hot: number; warm: number; cold: number };
  responseMins: number | null;
  messages: { inbound: number; outbound: number; days: { day: string; in: number; out: number }[] };
  campaigns: { count: number; sent: number; failed: number; recent: { name: string; sent: number; failed: number; total: number; status: string }[] };
  automations: { active: number; total: number; enrolled: number; sent: number; completed: number; completionRate: number };
  templates: { total: number; approved: number };
  groups: { name: string; count: number; phoneCount: number }[];
}
export const getAnalytics = (): Promise<Result<WaAnalyticsDto>> => api.get(`${BASE}/analytics`, { revalidate: false });
export const listTemplateFolders = (): Promise<Result<WaTemplateFolderDto[]>> => api.get(`${BASE}/template-folders`, { revalidate: false });
export const createTemplateFolder = (name: string, kind?: string): Promise<Result<{ success: boolean; name: string }>> => api.post(`${BASE}/template-folders`, { name, ...(kind ? { kind } : {}) });
export const syncCourseTemplateFolders = (): Promise<Result<{ synced: number; created: number }>> => api.post(`${BASE}/template-folders/sync-courses`, {});
export const renameTemplateFolder = (name: string, to: string): Promise<Result<{ success: boolean; name: string }>> => api.patch(`${BASE}/template-folders`, { name, to });
export const deleteTemplateFolder = (name: string): Promise<Result<{ success: boolean }>> => api.delete(`${BASE}/template-folders/${encodeURIComponent(name)}`);

export const listTemplates = (): Promise<Result<WaTemplateDto[]>> => api.get(`${BASE}/templates`, { revalidate: false });
export interface WaTemplateStatusSync { checked: number; approved: number; pending: number; rejected: number; notFound: number; updated: number }
export const syncTemplateStatuses = (): Promise<Result<WaTemplateStatusSync>> => api.post(`${BASE}/templates/sync-status`, {});
export const submitTemplate = (id: string): Promise<Result<{ success: boolean; name: string; renamed: boolean; status: string }>> =>
  api.post(`${BASE}/templates/${id}/submit`, {});
export const createTemplate = (input: Record<string, unknown>): Promise<Result<WaTemplateDto>> => api.post(`${BASE}/templates`, input);
export const updateTemplate = (id: string, input: Record<string, unknown>): Promise<Result<WaTemplateDto>> => api.patch(`${BASE}/templates/${id}`, input);
export const removeTemplate = (id: string): Promise<Result<{ success: boolean }>> => api.delete(`${BASE}/templates/${id}`);

export const listCampaigns = (): Promise<Result<WaCampaignDto[]>> => api.get(`${BASE}/campaigns`, { revalidate: false });
export const createCampaign = (input: Record<string, unknown>): Promise<Result<WaCampaignDto>> => api.post(`${BASE}/campaigns`, input);
export const uploadCampaignMedia = (form: FormData): Promise<Result<WaMediaUploadDto>> => api.post(`${BASE}/campaigns/upload-media`, form);
export const sendCampaign = (id: string): Promise<Result<WaSendResult>> => api.post(`${BASE}/campaigns/${id}/send`, {});
export interface WaCampaignReportDto {
  campaign: WaCampaignDto;
  stats: { total: number; accepted: number; delivered: number; read: number; failed: number; notSent: number };
  recipients: { phone: string; name: string; status: string; error: string; at: string | null }[];
}
export const getCampaignReport = (id: string): Promise<Result<WaCampaignReportDto>> => api.get(`${BASE}/campaigns/${id}/report`, { revalidate: false });
export const resendCampaignFailed = (id: string): Promise<Result<WaSendResult & { retried: number }>> =>
  api.post(`${BASE}/campaigns/${id}/resend-failed`, {});
export const removeCampaign = (id: string): Promise<Result<{ success: boolean }>> => api.delete(`${BASE}/campaigns/${id}`);

export const sendBulk = (input: Record<string, unknown>): Promise<Result<WaSendResult>> => api.post(`${BASE}/send-bulk`, input);
export const testSend = (input: Record<string, unknown>): Promise<Result<{ success: boolean }>> => api.post(`${BASE}/test`, input);

/* ── Live-chat inbox ── */
export interface WaConversationDto { phone: string; name: string; lastMessage: string; lastDirection: string; lastMessageAt?: string; unread: number; status: string; labels: string[]; lists: string[]; windowOpen: boolean; score: number; temperature: string; followUpAt?: string | null; followUpNote?: string }
export interface WaThreadMsg { id: string; direction: string; type: string; text: string; mediaUrl?: string; mime?: string; filename?: string; status: string; author?: string; at?: string }
export interface WaContactDto { name: string; email: string; tags: string[]; createdAt?: string; source?: string }
export interface WaThreadDto { phone: string; name: string; status: string; labels: string[]; lists: string[]; windowOpen: boolean; lastInboundAt?: string; contact?: WaContactDto | null; messages: WaThreadMsg[]; score?: number; temperature?: string; followUpAt?: string | null; followUpNote?: string }
export interface WaListDto { name: string; count: number }
export interface WaListSendResult { total: number; sent: number; skipped: number; failed: number; errors: string[] }

export const listConversations = (): Promise<Result<WaConversationDto[]>> => api.get(`${BASE}/conversations`, { revalidate: false });
export const listLabels = (): Promise<Result<string[]>> => api.get(`${BASE}/labels`, { revalidate: false });
export const startConversation = (input: Record<string, unknown>): Promise<Result<{ success: boolean; phone: string }>> => api.post(`${BASE}/conversations/start`, input);
export const setLabels = (phone: string, labels: string[]): Promise<Result<{ success: boolean; labels: string[] }>> => api.post(`${BASE}/conversations/${encodeURIComponent(phone)}/labels`, { labels });
export const getThread = (phone: string): Promise<Result<WaThreadDto>> => api.get(`${BASE}/conversations/${encodeURIComponent(phone)}/messages`, { revalidate: false });
export const markRead = (phone: string): Promise<Result<{ success: boolean }>> => api.post(`${BASE}/conversations/${encodeURIComponent(phone)}/read`, {});
export const setConversationStatus = (phone: string, status: string): Promise<Result<{ success: boolean }>> => api.post(`${BASE}/conversations/${encodeURIComponent(phone)}/status`, { status });
export const addNote = (phone: string, text: string, author?: string): Promise<Result<{ success: boolean }>> => api.post(`${BASE}/conversations/${encodeURIComponent(phone)}/note`, { text, author });
export const replyText = (phone: string, text: string): Promise<Result<{ success: boolean }>> => api.post(`${BASE}/conversations/${encodeURIComponent(phone)}/reply`, { text });
export const sendMedia = (phone: string, form: FormData): Promise<Result<{ success: boolean; mediaUrl: string; type: string }>> => api.post(`${BASE}/conversations/${encodeURIComponent(phone)}/media`, form);

/* ── Conversation lists / segments ── */
export const listLists = (): Promise<Result<WaListDto[]>> => api.get(`${BASE}/lists`, { revalidate: false });
export const createList = (name: string): Promise<Result<{ success: boolean; name: string }>> => api.post(`${BASE}/lists`, { name });
export const renameList = (name: string, to: string): Promise<Result<{ success: boolean; name: string }>> => api.patch(`${BASE}/lists`, { name, to });
export const deleteList = (name: string): Promise<Result<{ success: boolean }>> => api.delete(`${BASE}/lists/${encodeURIComponent(name)}`);
export const sendListMessage = (name: string, payload: { text?: string; templateName?: string; language?: string; params?: string[] }): Promise<Result<WaListSendResult>> => api.post(`${BASE}/lists/${encodeURIComponent(name)}/message`, payload);
export const setConversationLists = (phone: string, lists: string[]): Promise<Result<{ success: boolean; lists: string[] }>> => api.post(`${BASE}/conversations/${encodeURIComponent(phone)}/lists`, { lists });
export const setContactGroup = (phone: string, group: string, add: boolean): Promise<Result<{ success: boolean; tags: string[]; created?: boolean }>> => api.post(`${BASE}/conversations/${encodeURIComponent(phone)}/group`, { group, add });
export const replyTemplate = (phone: string, input: Record<string, unknown>): Promise<Result<{ success: boolean }>> => api.post(`${BASE}/conversations/${encodeURIComponent(phone)}/reply-template`, input);

export interface WaAiResult { ok: boolean; action?: string; result: string; error?: string }
export const aiCopilot = (phone: string, action: string): Promise<Result<WaAiResult>> => api.post(`${BASE}/conversations/${encodeURIComponent(phone)}/ai`, { action });

/* ── Follow-up reminders ── */
export interface WaFollowUpDto { phone: string; name: string; followUpAt: string; followUpNote: string; followUpBy: string; overdue: boolean; score: number; temperature: string }
export const listFollowUps = (): Promise<Result<WaFollowUpDto[]>> => api.get(`${BASE}/follow-ups`, { revalidate: false });
export const setFollowUp = (phone: string, input: { at: string; note?: string; by?: string }): Promise<Result<{ success: boolean }>> => api.post(`${BASE}/conversations/${encodeURIComponent(phone)}/follow-up`, input);
export const clearFollowUp = (phone: string): Promise<Result<{ success: boolean }>> => api.delete(`${BASE}/conversations/${encodeURIComponent(phone)}/follow-up`);

export const listAutomations = (): Promise<Result<WaAutomationDto[]>> => api.get(`${BASE}/automations`, { revalidate: false });
export const createAutomation = (input: Record<string, unknown>): Promise<Result<WaAutomationDto>> => api.post(`${BASE}/automations`, input);
export const updateAutomation = (id: string, input: Record<string, unknown>): Promise<Result<WaAutomationDto>> => api.patch(`${BASE}/automations/${id}`, input);
export const removeAutomation = (id: string): Promise<Result<{ success: boolean }>> => api.delete(`${BASE}/automations/${id}`);
