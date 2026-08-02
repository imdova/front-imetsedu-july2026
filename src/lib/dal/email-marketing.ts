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
  Campaign, CampaignInput, EmailTemplate, TemplateInput, TemplateCategory,
  AudienceSegment, Automation, AutomationInput, EmailStats, BrandBlock,
  AudienceOption, RecipientsPreview, ManualRecipient,
  Subscriber, SubscriberInput, SubscriberGroup,
} from "@/lib/db/email-marketing";

const rate = (n: number, d: number) => (d > 0 ? Math.round((n / d) * 1000) / 10 : 0);

const mapCampaign = (d: svc.CampaignDto): Campaign => ({
  id: d._id, name: d.name, subject: d.subject, previewText: d.previewText,
  fromName: d.fromName, fromEmail: d.fromEmail, replyTo: d.replyTo, language: d.language,
  audience: d.audience, sources: d.sources, manualRecipients: d.manualRecipients,
  status: d.status as Campaign["status"], scheduledAt: d.scheduledAt, sentAt: d.sentAt,
  recipientCount: d.recipientCount, opens: d.opens, clicks: d.clicks,
  openRate: rate(d.opens, d.recipientCount), clickRate: rate(d.clicks, d.recipientCount),
  trackOpens: d.trackOpens, trackClicks: d.trackClicks,
  design: d.design, body: d.body, createdAt: d.createdAt,
});
const mapTemplate = (d: svc.TemplateDto): EmailTemplate => ({
  id: d._id, name: d.name, subject: d.subject, previewText: d.previewText,
  category: d.category ?? "", design: d.design, body: d.body, createdAt: d.createdAt,
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
export async function fetchAudiences(): Promise<Result<AudienceOption[]>> {
  const res = await svc.getAudiences();
  return res.ok ? ok(res.data as AudienceOption[]) : res;
}
export async function previewRecipients(
  sources: string[], manualRecipients: ManualRecipient[],
): Promise<Result<RecipientsPreview>> {
  const res = await svc.previewRecipients(sources, manualRecipients);
  return res.ok ? ok(res.data as RecipientsPreview) : res;
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

/* ── Template categories ── */
export async function fetchTemplateCategories(): Promise<Result<TemplateCategory[]>> {
  const res = await svc.listTemplateCategories();
  return res.ok ? ok(res.data.map((c) => ({ name: c.name, count: c.count }))) : res;
}
export async function createTemplateCategory(name: string): Promise<Result<TemplateCategory>> {
  const res = await svc.createTemplateCategory(name);
  return res.ok ? ok({ name: res.data.name, count: res.data.count }) : res;
}
export async function renameTemplateCategory(oldName: string, name: string): Promise<Result<TemplateCategory>> {
  const res = await svc.renameTemplateCategory(oldName, name);
  return res.ok ? ok({ name: res.data.name, count: res.data.count }) : res;
}
export async function deleteTemplateCategory(name: string): Promise<Result<boolean>> {
  const res = await svc.deleteTemplateCategory(name);
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

/* ── Subscribers ── */
const mapSubscriber = (d: svc.SubscriberDto): Subscriber => ({
  id: d._id, email: d.email, name: d.name ?? "", phone: d.phone ?? "", source: d.source ?? "", tags: d.tags ?? [], createdAt: d.createdAt,
});
const mapGroup = (d: svc.SubscriberGroupDto): SubscriberGroup => ({ name: d.name, count: d.count, paths: d.paths ?? [], kind: d.kind === "course" ? "course" : "landing" });
export async function fetchSubscribers(search?: string, group?: string): Promise<Result<Subscriber[]>> {
  const res = await svc.listSubscribers(search, group);
  return res.ok ? ok(res.data.map(mapSubscriber)) : res;
}
export async function addSubscriber(input: SubscriberInput): Promise<Result<Subscriber>> {
  const res = await svc.addSubscriber(input as unknown as Record<string, unknown>);
  return res.ok ? ok(mapSubscriber(res.data)) : res;
}
export async function deleteSubscriber(id: string): Promise<Result<boolean>> {
  const res = await svc.deleteSubscriber(id);
  return res.ok ? ok(true) : res;
}
export async function bulkDeleteSubscribers(ids: string[]): Promise<Result<number>> {
  const res = await svc.bulkDeleteSubscribers(ids);
  return res.ok ? ok(res.data.deleted) : res;
}
export async function assignSubscribersGroup(ids: string[], group: string): Promise<Result<number>> {
  const res = await svc.assignSubscribersGroup(ids, group);
  return res.ok ? ok(res.data.modified) : res;
}
export async function unassignSubscribersGroup(ids: string[], group: string): Promise<Result<number>> {
  const res = await svc.unassignSubscribersGroup(ids, group);
  return res.ok ? ok(res.data.modified) : res;
}

/* ── Subscriber groups ── */
export async function fetchSubscriberGroups(): Promise<Result<SubscriberGroup[]>> {
  const res = await svc.listSubscriberGroups();
  return res.ok ? ok(res.data.map(mapGroup)) : res;
}
export async function createSubscriberGroup(name: string, kind?: "landing" | "course"): Promise<Result<SubscriberGroup>> {
  const res = await svc.createSubscriberGroup(name, kind);
  return res.ok ? ok(mapGroup(res.data)) : res;
}
export async function syncCourseGroups(): Promise<Result<{ synced: number; created: number }>> {
  return svc.syncCourseGroups();
}
export async function renameSubscriberGroup(oldName: string, name: string): Promise<Result<SubscriberGroup>> {
  const res = await svc.renameSubscriberGroup(oldName, name);
  return res.ok ? ok(mapGroup(res.data)) : res;
}
export async function setSubscriberGroupPaths(name: string, paths: string[]): Promise<Result<SubscriberGroup>> {
  const res = await svc.setSubscriberGroupPaths(name, paths);
  return res.ok ? ok(mapGroup(res.data)) : res;
}
/** Reconcile which groups a single page path (course/landing) feeds. */
export async function setPathGroups(path: string, groups: string[]): Promise<Result<{ path: string; groups: string[] }>> {
  const res = await svc.linkPathToGroups(path, groups);
  return res.ok ? ok(res.data) : res;
}
export async function deleteSubscriberGroup(name: string): Promise<Result<boolean>> {
  const res = await svc.deleteSubscriberGroup(name);
  return res.ok ? ok(true) : res;
}
