/** WhatsApp marketing DAL — LIVE against the NestJS `whatsapp` module. */
import { ok, type Result } from "@integration/lib/api-client";
import * as svc from "@integration/services/whatsapp";

export type WaStatus = svc.WaStatusDto;
export type WaGroup = svc.WaGroupDto;
export type WaSendResult = svc.WaSendResult;
export type WaRecipient = svc.WaRecipient;

export interface WaTemplate {
  id: string; name: string; language: string; category: string; folder: string; body: string; variables: number; status: string;
  headerUrl: string; headerKind: string; headerFilename: string;
}
export interface WaCampaign {
  id: string; name: string; mode: "template" | "manual"; templateName: string; language: string; bodyPreview: string;
  text: string; mediaUrl: string; mediaKind: string; mediaFilename: string;
  defaultParams: string[]; recipients: { phone: string; name?: string }[];
  status: string; total: number; sentCount: number; failedCount: number; sentAt?: string; createdAt: string;
  deliveredCount: number; deliveryFailedCount: number; deliveryError: string;
}
export type WaMediaUpload = svc.WaMediaUploadDto;
export interface WaAutomation {
  id: string; name: string; trigger: string; triggerTag: string; steps: string; active: boolean; sentCount: number; createdAt: string;
}

const mapTpl = (d: svc.WaTemplateDto): WaTemplate => ({
  id: d._id, name: d.name, language: d.language, category: d.category, folder: d.folder ?? "", body: d.body, variables: d.variables ?? 0, status: d.status,
  headerUrl: d.headerUrl ?? "", headerKind: d.headerKind ?? "", headerFilename: d.headerFilename ?? "",
});
const mapCamp = (d: svc.WaCampaignDto): WaCampaign => {
  let defaultParams: string[] = []; try { defaultParams = JSON.parse(d.defaultParams || "[]"); } catch { defaultParams = []; }
  return { id: d._id, name: d.name, mode: d.mode === "manual" ? "manual" : "template", templateName: d.templateName, language: d.language, bodyPreview: d.bodyPreview, text: d.text ?? "", mediaUrl: d.mediaUrl ?? "", mediaKind: d.mediaKind ?? "", mediaFilename: d.mediaFilename ?? "", defaultParams, recipients: d.recipients ?? [], status: d.status, total: d.total ?? 0, sentCount: d.sentCount ?? 0, failedCount: d.failedCount ?? 0, sentAt: d.sentAt, createdAt: d.createdAt, deliveredCount: d.deliveredCount ?? 0, deliveryFailedCount: d.deliveryFailedCount ?? 0, deliveryError: d.deliveryError ?? "" };
};
const mapAuto = (d: svc.WaAutomationDto): WaAutomation => ({
  id: d._id, name: d.name, trigger: d.trigger, triggerTag: d.triggerTag ?? "", steps: d.steps ?? "", active: !!d.active, sentCount: d.sentCount ?? 0, createdAt: d.createdAt,
});

export async function fetchStatus(): Promise<Result<WaStatus>> { return svc.getStatus(); }
export type WaAccountSettings = svc.WaAccountSettingsDto;
export async function fetchAccountSettings(): Promise<Result<WaAccountSettings>> { return svc.getAccountSettings(); }
export async function updateAccountProfile(input: { about?: string; description?: string; email?: string; website?: string; vertical?: string }): Promise<Result<boolean>> {
  const r = await svc.updateWaProfile(input as unknown as Record<string, unknown>);
  return r.ok ? ok(true) : r;
}
export async function updateProfilePicture(file: Blob, filename?: string): Promise<Result<boolean>> {
  const form = new FormData();
  form.append("file", file, filename ?? (file instanceof File ? file.name : "profile.jpg"));
  const r = await svc.updateWaProfilePicture(form);
  return r.ok ? ok(true) : r;
}
export async function requestDisplayName(name: string): Promise<Result<{ success: boolean; name: string }>> {
  return svc.requestWaDisplayName(name);
}
export async function fetchGroups(): Promise<Result<WaGroup[]>> { return svc.getGroups(); }
export type WaAnalytics = svc.WaAnalyticsDto;
export async function fetchAnalytics(): Promise<Result<WaAnalytics>> { return svc.getAnalytics(); }
export async function createGroup(name: string, kind?: "landing" | "course"): Promise<Result<boolean>> {
  const r = await svc.createGroup(name, kind); return r.ok ? ok(true) : r;
}

export type WaTemplateFolder = svc.WaTemplateFolderDto;
export async function fetchTemplateFolders(): Promise<Result<WaTemplateFolder[]>> { return svc.listTemplateFolders(); }
export async function createTemplateFolder(name: string, kind?: "landing" | "course"): Promise<Result<boolean>> {
  const r = await svc.createTemplateFolder(name, kind); return r.ok ? ok(true) : r;
}
export async function syncCourseTemplateFolders(): Promise<Result<{ synced: number; created: number }>> {
  return svc.syncCourseTemplateFolders();
}
export async function renameTemplateFolder(name: string, to: string): Promise<Result<boolean>> {
  const r = await svc.renameTemplateFolder(name, to); return r.ok ? ok(true) : r;
}
export async function deleteTemplateFolder(name: string): Promise<Result<boolean>> {
  const r = await svc.deleteTemplateFolder(name); return r.ok ? ok(true) : r;
}

export type WaTemplateStatusSync = svc.WaTemplateStatusSync;
export async function syncTemplateStatuses(): Promise<Result<WaTemplateStatusSync>> { return svc.syncTemplateStatuses(); }
export async function submitTemplate(id: string): Promise<Result<{ success: boolean; name: string; renamed: boolean; status: string }>> {
  return svc.submitTemplate(id);
}
export async function fetchTemplates(): Promise<Result<WaTemplate[]>> {
  const r = await svc.listTemplates(); return r.ok ? ok(r.data.map(mapTpl)) : r;
}
export async function createTemplate(input: Partial<WaTemplate>): Promise<Result<WaTemplate>> {
  const r = await svc.createTemplate(input as Record<string, unknown>); return r.ok ? ok(mapTpl(r.data)) : r;
}
export async function updateTemplate(id: string, input: Partial<WaTemplate>): Promise<Result<WaTemplate>> {
  const r = await svc.updateTemplate(id, input as Record<string, unknown>); return r.ok ? ok(mapTpl(r.data)) : r;
}
export async function deleteTemplate(id: string): Promise<Result<boolean>> {
  const r = await svc.removeTemplate(id); return r.ok ? ok(true) : r;
}

export async function fetchCampaigns(): Promise<Result<WaCampaign[]>> {
  const r = await svc.listCampaigns(); return r.ok ? ok(r.data.map(mapCamp)) : r;
}
export async function createCampaign(input: { name: string; mode?: "template" | "manual"; templateName?: string; language?: string; bodyPreview?: string; text?: string; mediaUrl?: string; mediaKind?: string; mediaFilename?: string; defaultParams?: string[]; groups?: string[]; recipients?: WaRecipient[] }): Promise<Result<WaCampaign>> {
  const r = await svc.createCampaign(input); return r.ok ? ok(mapCamp(r.data)) : r;
}
export async function uploadCampaignMedia(file: Blob, opts: { voice?: boolean; filename?: string } = {}): Promise<Result<WaMediaUpload>> {
  const form = new FormData();
  form.append("file", file, opts.filename ?? (file instanceof File ? file.name : "file"));
  if (opts.voice) form.append("voice", "true");
  return svc.uploadCampaignMedia(form);
}
export async function sendCampaign(id: string): Promise<Result<WaSendResult>> { return svc.sendCampaign(id); }
export interface WaCampaignReport {
  campaign: WaCampaign;
  stats: { total: number; accepted: number; delivered: number; read: number; failed: number; notSent: number };
  recipients: { phone: string; name: string; status: string; error: string; at: string | null }[];
}
export async function fetchCampaignReport(id: string): Promise<Result<WaCampaignReport>> {
  const r = await svc.getCampaignReport(id);
  return r.ok ? ok({ campaign: mapCamp(r.data.campaign), stats: r.data.stats, recipients: r.data.recipients }) : r;
}
export async function resendCampaignFailed(id: string): Promise<Result<WaSendResult & { retried: number }>> {
  return svc.resendCampaignFailed(id);
}
export async function deleteCampaign(id: string): Promise<Result<boolean>> {
  const r = await svc.removeCampaign(id); return r.ok ? ok(true) : r;
}
export async function sendBulk(input: { templateName: string; language: string; defaultParams?: string[]; groups?: string[]; recipients?: WaRecipient[] }): Promise<Result<WaSendResult>> {
  return svc.sendBulk(input);
}
export async function testSend(input: { to: string; templateName: string; language: string; params?: string[] }): Promise<Result<boolean>> {
  const r = await svc.testSend(input); return r.ok ? ok(true) : r;
}

export type WaConversation = svc.WaConversationDto;
export type WaThread = svc.WaThreadDto;
export type WaList = svc.WaListDto;
export type WaListSendResult = svc.WaListSendResult;

export async function fetchConversations(): Promise<Result<WaConversation[]>> { return svc.listConversations(); }
export async function fetchThread(phone: string): Promise<Result<WaThread>> { return svc.getThread(phone); }
export async function fetchLabels(): Promise<Result<string[]>> { return svc.listLabels(); }
export async function startConversation(input: { phone: string; name?: string; templateName: string; language: string; params?: string[] }): Promise<Result<{ success: boolean; phone: string }>> { return svc.startConversation(input); }
export async function setLabels(phone: string, labels: string[]): Promise<Result<boolean>> {
  const r = await svc.setLabels(phone, labels); return r.ok ? ok(true) : r;
}
export async function fetchLists(): Promise<Result<WaList[]>> { return svc.listLists(); }
export async function createList(name: string): Promise<Result<boolean>> {
  const r = await svc.createList(name); return r.ok ? ok(true) : r;
}
export async function renameList(name: string, to: string): Promise<Result<boolean>> {
  const r = await svc.renameList(name, to); return r.ok ? ok(true) : r;
}
export async function deleteList(name: string): Promise<Result<boolean>> {
  const r = await svc.deleteList(name); return r.ok ? ok(true) : r;
}
export async function sendListMessage(name: string, payload: { text?: string; templateName?: string; language?: string; params?: string[] }): Promise<Result<WaListSendResult>> { return svc.sendListMessage(name, payload); }
export async function setConversationLists(phone: string, lists: string[]): Promise<Result<boolean>> {
  const r = await svc.setConversationLists(phone, lists); return r.ok ? ok(true) : r;
}
export async function setContactGroup(phone: string, group: string, add: boolean): Promise<Result<{ tags: string[]; created?: boolean }>> {
  const r = await svc.setContactGroup(phone, group, add); return r.ok ? ok({ tags: r.data.tags, created: r.data.created }) : r;
}
export async function markConversationRead(phone: string): Promise<Result<boolean>> {
  const r = await svc.markRead(phone); return r.ok ? ok(true) : r;
}
export async function setConversationStatus(phone: string, status: "open" | "resolved"): Promise<Result<boolean>> {
  const r = await svc.setConversationStatus(phone, status); return r.ok ? ok(true) : r;
}
/** Block/unblock a contact: their inbound messages are ignored and nothing can be sent to them. */
export async function setConversationBlocked(phone: string, blocked: boolean, reason?: string): Promise<Result<boolean>> {
  const r = await svc.setConversationBlocked(phone, blocked, reason); return r.ok ? ok(true) : r;
}
export async function addNote(phone: string, text: string, author?: string): Promise<Result<boolean>> {
  const r = await svc.addNote(phone, text, author); return r.ok ? ok(true) : r;
}
export async function replyText(phone: string, text: string): Promise<Result<boolean>> {
  const r = await svc.replyText(phone, text); return r.ok ? ok(true) : r;
}
export async function sendMedia(phone: string, file: Blob, opts: { caption?: string; voice?: boolean; filename?: string } = {}): Promise<Result<boolean>> {
  const form = new FormData();
  form.append("file", file, opts.filename || (file instanceof File ? file.name : "file"));
  if (opts.caption) form.append("caption", opts.caption);
  if (opts.voice) form.append("voice", "true");
  const r = await svc.sendMedia(phone, form); return r.ok ? ok(true) : r;
}
export async function replyTemplate(phone: string, input: { templateName: string; language: string; params?: string[] }): Promise<Result<boolean>> {
  const r = await svc.replyTemplate(phone, input); return r.ok ? ok(true) : r;
}
export type WaAiResult = svc.WaAiResult;
export async function aiCopilot(phone: string, action: "summary" | "suggest" | "intent"): Promise<Result<WaAiResult>> { return svc.aiCopilot(phone, action); }

export type WaFollowUp = svc.WaFollowUpDto;
export async function fetchFollowUps(): Promise<Result<WaFollowUp[]>> { return svc.listFollowUps(); }
export async function setFollowUp(phone: string, input: { at: string; note?: string; by?: string }): Promise<Result<boolean>> {
  const r = await svc.setFollowUp(phone, input); return r.ok ? ok(true) : r;
}
export async function clearFollowUp(phone: string): Promise<Result<boolean>> {
  const r = await svc.clearFollowUp(phone); return r.ok ? ok(true) : r;
}

export async function fetchAutomations(): Promise<Result<WaAutomation[]>> {
  const r = await svc.listAutomations(); return r.ok ? ok(r.data.map(mapAuto)) : r;
}
export async function createAutomation(input: Partial<WaAutomation>): Promise<Result<WaAutomation>> {
  const r = await svc.createAutomation(input as Record<string, unknown>); return r.ok ? ok(mapAuto(r.data)) : r;
}
export async function updateAutomation(id: string, input: Partial<WaAutomation>): Promise<Result<WaAutomation>> {
  const r = await svc.updateAutomation(id, input as Record<string, unknown>); return r.ok ? ok(mapAuto(r.data)) : r;
}
export async function deleteAutomation(id: string): Promise<Result<boolean>> {
  const r = await svc.removeAutomation(id); return r.ok ? ok(true) : r;
}
