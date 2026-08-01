/** WhatsApp marketing DAL — LIVE against the NestJS `whatsapp` module. */
import { ok, type Result } from "@integration/lib/api-client";
import * as svc from "@integration/services/whatsapp";

export type WaStatus = svc.WaStatusDto;
export type WaGroup = svc.WaGroupDto;
export type WaSendResult = svc.WaSendResult;
export type WaRecipient = svc.WaRecipient;

export interface WaTemplate {
  id: string; name: string; language: string; category: string; body: string; variables: number; status: string;
}
export interface WaCampaign {
  id: string; name: string; templateName: string; language: string; bodyPreview: string;
  defaultParams: string[]; recipients: { phone: string; name?: string }[];
  status: string; total: number; sentCount: number; failedCount: number; sentAt?: string; createdAt: string;
}
export interface WaAutomation {
  id: string; name: string; trigger: string; triggerTag: string; steps: string; active: boolean; sentCount: number; createdAt: string;
}

const mapTpl = (d: svc.WaTemplateDto): WaTemplate => ({
  id: d._id, name: d.name, language: d.language, category: d.category, body: d.body, variables: d.variables ?? 0, status: d.status,
});
const mapCamp = (d: svc.WaCampaignDto): WaCampaign => {
  let defaultParams: string[] = []; try { defaultParams = JSON.parse(d.defaultParams || "[]"); } catch { defaultParams = []; }
  return { id: d._id, name: d.name, templateName: d.templateName, language: d.language, bodyPreview: d.bodyPreview, defaultParams, recipients: d.recipients ?? [], status: d.status, total: d.total ?? 0, sentCount: d.sentCount ?? 0, failedCount: d.failedCount ?? 0, sentAt: d.sentAt, createdAt: d.createdAt };
};
const mapAuto = (d: svc.WaAutomationDto): WaAutomation => ({
  id: d._id, name: d.name, trigger: d.trigger, triggerTag: d.triggerTag ?? "", steps: d.steps ?? "", active: !!d.active, sentCount: d.sentCount ?? 0, createdAt: d.createdAt,
});

export async function fetchStatus(): Promise<Result<WaStatus>> { return svc.getStatus(); }
export async function fetchGroups(): Promise<Result<WaGroup[]>> { return svc.getGroups(); }

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
export async function createCampaign(input: { name: string; templateName: string; language: string; bodyPreview?: string; defaultParams?: string[]; groups?: string[]; recipients?: WaRecipient[] }): Promise<Result<WaCampaign>> {
  const r = await svc.createCampaign(input); return r.ok ? ok(mapCamp(r.data)) : r;
}
export async function sendCampaign(id: string): Promise<Result<WaSendResult>> { return svc.sendCampaign(id); }
export async function deleteCampaign(id: string): Promise<Result<boolean>> {
  const r = await svc.removeCampaign(id); return r.ok ? ok(true) : r;
}
export async function sendBulk(input: { templateName: string; language: string; defaultParams?: string[]; groups?: string[]; recipients?: WaRecipient[] }): Promise<Result<WaSendResult>> {
  return svc.sendBulk(input);
}
export async function testSend(input: { to: string; templateName: string; language: string; params?: string[] }): Promise<Result<boolean>> {
  const r = await svc.testSend(input); return r.ok ? ok(true) : r;
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
