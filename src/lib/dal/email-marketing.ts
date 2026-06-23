/**
 * Email-marketing DAL.
 *
 * LIVE: delegates to the NestJS `email-campaign` module via
 * `@integration/services/email-campaign` (`/admin/email/*`), mapping backend
 * `_id` → UI `id` and computing open/click rates. UI types still come from
 * `@/lib/db/email-marketing`; the `Result<T>` shape is unchanged so the UI and
 * the block/automation builders work without edits.
 */
import { ok, type Result } from "@integration/lib/api-client";
import * as svc from "@integration/services/email-campaign";
import type {
  Campaign, CampaignInput, EmailTemplate, TemplateInput,
  AudienceSegment, Automation, AutomationInput, EmailStats, BrandBlock,
} from "@/lib/db/email-marketing";

const rate = (n: number, d: number) => (d > 0 ? Math.round((n / d) * 1000) / 10 : 0);

const mapCampaign = (d: svc.CampaignDto): Campaign => ({
  id: d._id, subject: d.subject, previewText: d.previewText, fromName: d.fromName, replyTo: d.replyTo,
  audience: d.audience, status: d.status as Campaign["status"], scheduledAt: d.scheduledAt, sentAt: d.sentAt,
  recipientCount: d.recipientCount, opens: d.opens, clicks: d.clicks,
  openRate: rate(d.opens, d.recipientCount), clickRate: rate(d.clicks, d.recipientCount),
  design: d.design, body: d.body, createdAt: d.createdAt,
});
const mapTemplate = (d: svc.TemplateDto): EmailTemplate => ({
  id: d._id, name: d.name, subject: d.subject, previewText: d.previewText,
  design: d.design, body: d.body, createdAt: d.createdAt,
});
const mapAutomation = (d: svc.AutomationDto): Automation => ({
  id: d._id, name: d.name, trigger: d.trigger as Automation["trigger"], triggerTag: d.triggerTag,
  audience: d.audience, steps: d.steps, active: d.active, sentCount: d.sentCount, createdAt: d.createdAt,
});
const mapBrandBlock = (d: svc.BrandBlockDto): BrandBlock => ({ id: d._id, name: d.name, block: d.block });

/* ── Stats + segments ── */
export async function fetchEmailStats(): Promise<Result<EmailStats>> {
  const res = await svc.getStats();
  return res.ok ? ok(res.data as EmailStats) : res;
}
export async function fetchSegments(): Promise<Result<AudienceSegment[]>> {
  const res = await svc.getSegments();
  return res.ok ? ok(res.data as AudienceSegment[]) : res;
}

/* ── Campaigns ── */
export async function fetchCampaigns(): Promise<Result<Campaign[]>> {
  const res = await svc.listCampaigns();
  return res.ok ? ok(res.data.map(mapCampaign)) : res;
}
export async function fetchCampaign(id: string): Promise<Result<Campaign | null>> {
  const res = await svc.getCampaign(id);
  return res.ok ? ok(res.data ? mapCampaign(res.data) : null) : res;
}
export async function createCampaign(input: CampaignInput): Promise<Result<Campaign>> {
  const res = await svc.createCampaign(input);
  return res.ok ? ok(mapCampaign(res.data)) : res;
}
export async function updateCampaign(id: string, patch: Partial<CampaignInput>): Promise<Result<Campaign | null>> {
  const res = await svc.updateCampaign(id, patch);
  return res.ok ? ok(res.data ? mapCampaign(res.data) : null) : res;
}
export async function deleteCampaign(id: string): Promise<Result<boolean>> {
  const res = await svc.deleteCampaign(id);
  return res.ok ? ok(true) : res;
}
export async function sendCampaign(id: string): Promise<Result<Campaign | null>> {
  const res = await svc.sendCampaign(id);
  return res.ok ? ok(res.data ? mapCampaign(res.data) : null) : res;
}
export async function scheduleCampaign(id: string, scheduledAt: string): Promise<Result<Campaign | null>> {
  const res = await svc.scheduleCampaign(id, scheduledAt);
  return res.ok ? ok(res.data ? mapCampaign(res.data) : null) : res;
}
export async function unscheduleCampaign(id: string): Promise<Result<Campaign | null>> {
  const res = await svc.unscheduleCampaign(id);
  return res.ok ? ok(res.data ? mapCampaign(res.data) : null) : res;
}
export async function testCampaign(id: string, email: string): Promise<Result<boolean>> {
  const res = await svc.testCampaign(id, email);
  return res.ok ? ok(true) : res;
}
export async function duplicateCampaign(id: string): Promise<Result<Campaign | null>> {
  const res = await svc.duplicateCampaign(id);
  return res.ok ? ok(res.data ? mapCampaign(res.data) : null) : res;
}
export async function saveCampaignDesign(id: string, design: string, body: string): Promise<Result<Campaign | null>> {
  const res = await svc.saveCampaignDesign(id, design, body);
  return res.ok ? ok(res.data ? mapCampaign(res.data) : null) : res;
}

/* ── Templates ── */
export async function fetchTemplates(): Promise<Result<EmailTemplate[]>> {
  const res = await svc.listTemplates();
  return res.ok ? ok(res.data.map(mapTemplate)) : res;
}
export async function fetchTemplate(id: string): Promise<Result<EmailTemplate | null>> {
  const res = await svc.getTemplate(id);
  return res.ok ? ok(res.data ? mapTemplate(res.data) : null) : res;
}
export async function createTemplate(input: TemplateInput): Promise<Result<EmailTemplate>> {
  const res = await svc.createTemplate(input);
  return res.ok ? ok(mapTemplate(res.data)) : res;
}
export async function updateTemplate(id: string, patch: Partial<TemplateInput>): Promise<Result<EmailTemplate | null>> {
  const res = await svc.updateTemplate(id, patch);
  return res.ok ? ok(res.data ? mapTemplate(res.data) : null) : res;
}
export async function deleteTemplate(id: string): Promise<Result<boolean>> {
  const res = await svc.deleteTemplate(id);
  return res.ok ? ok(true) : res;
}
export async function saveTemplateDesign(id: string, design: string, body: string): Promise<Result<EmailTemplate | null>> {
  const res = await svc.saveTemplateDesign(id, design, body);
  return res.ok ? ok(res.data ? mapTemplate(res.data) : null) : res;
}

/* ── Automations ── */
export async function fetchAutomations(): Promise<Result<Automation[]>> {
  const res = await svc.listAutomations();
  return res.ok ? ok(res.data.map(mapAutomation)) : res;
}
export async function fetchAutomation(id: string): Promise<Result<Automation | null>> {
  const res = await svc.getAutomation(id);
  return res.ok ? ok(res.data ? mapAutomation(res.data) : null) : res;
}
export async function createAutomation(input: AutomationInput): Promise<Result<Automation>> {
  const res = await svc.createAutomation(input);
  return res.ok ? ok(mapAutomation(res.data)) : res;
}
export async function updateAutomation(id: string, patch: Partial<Automation>): Promise<Result<Automation | null>> {
  const res = await svc.updateAutomation(id, patch);
  return res.ok ? ok(res.data ? mapAutomation(res.data) : null) : res;
}
export async function toggleAutomation(id: string): Promise<Result<Automation | null>> {
  const res = await svc.toggleAutomation(id);
  return res.ok ? ok(res.data ? mapAutomation(res.data) : null) : res;
}
export async function deleteAutomation(id: string): Promise<Result<boolean>> {
  const res = await svc.deleteAutomation(id);
  return res.ok ? ok(true) : res;
}

/* ── Brand blocks ── */
export async function fetchBrandBlocks(): Promise<Result<BrandBlock[]>> {
  const res = await svc.listBrandBlocks();
  return res.ok ? ok(res.data.map(mapBrandBlock)) : res;
}
export async function createBrandBlock(name: string, block: string): Promise<Result<BrandBlock>> {
  const res = await svc.createBrandBlock(name, block);
  return res.ok ? ok(mapBrandBlock(res.data)) : res;
}
export async function deleteBrandBlock(id: string): Promise<Result<boolean>> {
  const res = await svc.deleteBrandBlock(id);
  return res.ok ? ok(true) : res;
}
