/**
 * Email-marketing seed (mock DB) — campaigns, templates, automations,
 * audience segments and aggregate stats. Mirrors the clone-spec `email-campaign`
 * module. The block-based email designer + automation step editor are separate
 * (deferred) builders; this covers the campaign/template lifecycle + analytics.
 */
import { respond, clone } from "./delay";

export type CampaignStatus = "DRAFT" | "SCHEDULED" | "SENT";

export interface Campaign {
  id: string;
  subject: string;
  previewText: string;
  fromName: string;
  replyTo: string;
  audience: string; // segment value
  status: CampaignStatus;
  scheduledAt?: string;
  sentAt?: string;
  recipientCount: number;
  opens: number;
  clicks: number;
  openRate: number; // %
  clickRate: number; // %
  design?: string; // JSON string of the block design (from the email builder)
  body?: string; // rendered HTML
  createdAt: string;
}

export type CampaignInput = {
  subject: string;
  previewText: string;
  fromName: string;
  replyTo: string;
  audience: string;
  status?: CampaignStatus;
};

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  previewText: string;
  design?: string;
  body?: string;
  createdAt: string;
}
export type TemplateInput = { name: string; subject: string; previewText: string };

export interface BrandBlock {
  id: string;
  name: string;
  block: string; // JSON of a single block
}

export interface AudienceSegment {
  value: string;
  label: string;
  count: number;
}

export type AutomationTrigger = "subscriber_created" | "tag_added";
export interface Automation {
  id: string;
  name: string;
  trigger: AutomationTrigger;
  triggerTag?: string;
  audience?: string;
  steps?: string; // JSON string of the visual step list (wait / email)
  active: boolean;
  sentCount: number;
  createdAt: string;
}
export type AutomationInput = { name: string; trigger: AutomationTrigger; triggerTag?: string; audience?: string };

export interface EmailStats {
  totalSubscribers: number;
  totalCampaigns: number;
  sentCampaigns: number;
  scheduledCampaigns: number;
  totalRecipients: number;
  totalOpens: number;
  totalClicks: number;
}

const stamp = () => new Date().toISOString();
const rate = (n: number, d: number) => (d > 0 ? Math.round((n / d) * 1000) / 10 : 0);

const segments: AudienceSegment[] = [
  { value: "all", label: "All subscribers", count: 4820 },
  { value: "students", label: "Active students", count: 1284 },
  { value: "leads", label: "Open leads", count: 2110 },
  { value: "alumni", label: "Alumni", count: 640 },
];

const campaigns: Campaign[] = [
  {
    id: "cmp_1", subject: "🎓 Summer Intake is open — save 20%", previewText: "Enroll before July 15",
    fromName: "IMETS School", replyTo: "hello@imetsedu.com", audience: "leads", status: "SENT",
    sentAt: "2026-06-05T09:00:00.000Z", recipientCount: 2110, opens: 928, clicks: 211,
    openRate: rate(928, 2110), clickRate: rate(211, 2110), createdAt: "2026-06-04T09:00:00.000Z",
  },
  {
    id: "cmp_2", subject: "New: AI for Business certificate", previewText: "Now open for registration",
    fromName: "IMETS School", replyTo: "hello@imetsedu.com", audience: "all", status: "SCHEDULED",
    scheduledAt: "2026-06-28T10:00:00.000Z", recipientCount: 4820, opens: 0, clicks: 0,
    openRate: 0, clickRate: 0, createdAt: "2026-06-20T09:00:00.000Z",
  },
  {
    id: "cmp_3", subject: "Your learning recap", previewText: "Pick up where you left off",
    fromName: "IMETS School", replyTo: "hello@imetsedu.com", audience: "students", status: "DRAFT",
    recipientCount: 0, opens: 0, clicks: 0, openRate: 0, clickRate: 0, createdAt: "2026-06-22T09:00:00.000Z",
  },
];

const templates: EmailTemplate[] = [
  { id: "tpl_1", name: "Course launch", subject: "Introducing {{course}}", previewText: "Be the first to enroll", createdAt: "2026-05-01T09:00:00.000Z" },
  { id: "tpl_2", name: "Payment reminder", subject: "Your installment is due", previewText: "A quick reminder", createdAt: "2026-05-10T09:00:00.000Z" },
];

const automations: Automation[] = [
  { id: "aut_1", name: "Welcome series", trigger: "subscriber_created", active: true, sentCount: 1840, createdAt: "2026-04-01T09:00:00.000Z" },
  { id: "aut_2", name: "Lead nurture", trigger: "tag_added", triggerTag: "lead", active: false, sentCount: 612, createdAt: "2026-04-15T09:00:00.000Z" },
];

let cmpSeq = campaigns.length;
let tplSeq = templates.length;
let autSeq = automations.length;

/* ── Stats + segments ── */
export async function getEmailStats(): Promise<EmailStats> {
  const sent = campaigns.filter((c) => c.status === "SENT");
  return respond({
    totalSubscribers: segments.find((s) => s.value === "all")?.count ?? 0,
    totalCampaigns: campaigns.length,
    sentCampaigns: sent.length,
    scheduledCampaigns: campaigns.filter((c) => c.status === "SCHEDULED").length,
    totalRecipients: sent.reduce((s, c) => s + c.recipientCount, 0),
    totalOpens: sent.reduce((s, c) => s + c.opens, 0),
    totalClicks: sent.reduce((s, c) => s + c.clicks, 0),
  });
}
export const getSegments = () => respond(segments);

/* ── Campaigns ── */
export const listCampaigns = () =>
  respond([...campaigns].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)));

export async function createCampaign(input: CampaignInput): Promise<Campaign> {
  const row: Campaign = {
    ...input, id: `cmp_${++cmpSeq}`, status: input.status ?? "DRAFT",
    recipientCount: 0, opens: 0, clicks: 0, openRate: 0, clickRate: 0, createdAt: stamp(),
  };
  campaigns.unshift(row);
  return respond(row);
}
export async function updateCampaign(id: string, patch: Partial<CampaignInput>): Promise<Campaign | null> {
  const row = campaigns.find((c) => c.id === id);
  if (!row) return respond(null);
  Object.assign(row, patch);
  return respond(clone(row));
}
export async function deleteCampaign(id: string): Promise<boolean> {
  const i = campaigns.findIndex((c) => c.id === id);
  if (i === -1) return respond(false);
  campaigns.splice(i, 1);
  return respond(true);
}
export async function sendCampaign(id: string): Promise<Campaign | null> {
  const row = campaigns.find((c) => c.id === id);
  if (!row) return respond(null);
  const audience = segments.find((s) => s.value === row.audience);
  row.status = "SENT"; row.sentAt = stamp(); row.scheduledAt = undefined;
  row.recipientCount = audience?.count ?? row.recipientCount;
  return respond(clone(row));
}
export async function scheduleCampaign(id: string, scheduledAt: string): Promise<Campaign | null> {
  const row = campaigns.find((c) => c.id === id);
  if (!row) return respond(null);
  row.status = "SCHEDULED"; row.scheduledAt = scheduledAt;
  return respond(clone(row));
}
export async function unscheduleCampaign(id: string): Promise<Campaign | null> {
  const row = campaigns.find((c) => c.id === id);
  if (!row) return respond(null);
  row.status = "DRAFT"; row.scheduledAt = undefined;
  return respond(clone(row));
}
export async function testCampaign(_id: string, _email: string): Promise<boolean> {
  return respond(true);
}
export async function duplicateCampaign(id: string): Promise<Campaign | null> {
  const src = campaigns.find((c) => c.id === id);
  if (!src) return respond(null);
  const copy: Campaign = {
    ...clone(src), id: `cmp_${++cmpSeq}`, subject: `${src.subject} (copy)`, status: "DRAFT",
    scheduledAt: undefined, sentAt: undefined, recipientCount: 0, opens: 0, clicks: 0,
    openRate: 0, clickRate: 0, createdAt: stamp(),
  };
  campaigns.unshift(copy);
  return respond(copy);
}

export async function getCampaign(id: string): Promise<Campaign | null> {
  const row = campaigns.find((c) => c.id === id);
  return respond(row ? clone(row) : null);
}
export async function saveCampaignDesign(id: string, design: string, body: string): Promise<Campaign | null> {
  const row = campaigns.find((c) => c.id === id);
  if (!row) return respond(null);
  row.design = design; row.body = body;
  return respond(clone(row));
}

/* ── Templates ── */
export const listTemplates = () =>
  respond([...templates].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)));
export async function createTemplate(input: TemplateInput): Promise<EmailTemplate> {
  const row: EmailTemplate = { ...input, id: `tpl_${++tplSeq}`, createdAt: stamp() };
  templates.unshift(row);
  return respond(row);
}
export async function updateTemplate(id: string, patch: Partial<TemplateInput>): Promise<EmailTemplate | null> {
  const row = templates.find((t) => t.id === id);
  if (!row) return respond(null);
  Object.assign(row, patch);
  return respond(clone(row));
}
export async function deleteTemplate(id: string): Promise<boolean> {
  const i = templates.findIndex((t) => t.id === id);
  if (i === -1) return respond(false);
  templates.splice(i, 1);
  return respond(true);
}

export async function getTemplate(id: string): Promise<EmailTemplate | null> {
  const row = templates.find((t) => t.id === id);
  return respond(row ? clone(row) : null);
}
export async function saveTemplateDesign(id: string, design: string, body: string): Promise<EmailTemplate | null> {
  const row = templates.find((t) => t.id === id);
  if (!row) return respond(null);
  row.design = design; row.body = body;
  return respond(clone(row));
}

/* ── Brand blocks (reusable saved blocks) ── */
const brandBlocks: BrandBlock[] = [];
let bbSeq = 0;
export const listBrandBlocks = () => respond([...brandBlocks]);
export async function createBrandBlock(name: string, block: string): Promise<BrandBlock> {
  const row: BrandBlock = { id: `bb_${++bbSeq}`, name, block };
  brandBlocks.push(row); return respond(row);
}
export async function deleteBrandBlock(id: string): Promise<boolean> {
  const i = brandBlocks.findIndex((b) => b.id === id);
  if (i === -1) return respond(false);
  brandBlocks.splice(i, 1); return respond(true);
}

/* ── Automations (summary list) ── */
export const listAutomations = () => respond([...automations]);
export async function getAutomation(id: string): Promise<Automation | null> {
  const row = automations.find((a) => a.id === id);
  return respond(row ? clone(row) : null);
}
export async function createAutomation(input: AutomationInput): Promise<Automation> {
  const row: Automation = { ...input, id: `aut_${++autSeq}`, active: false, sentCount: 0, createdAt: stamp() };
  automations.unshift(row); return respond(row);
}
export async function updateAutomation(id: string, patch: Partial<Automation>): Promise<Automation | null> {
  const row = automations.find((a) => a.id === id);
  if (!row) return respond(null);
  Object.assign(row, patch);
  return respond(clone(row));
}
export async function toggleAutomation(id: string): Promise<Automation | null> {
  const row = automations.find((a) => a.id === id);
  if (!row) return respond(null);
  row.active = !row.active;
  return respond(clone(row));
}
export async function deleteAutomation(id: string): Promise<boolean> {
  const i = automations.findIndex((a) => a.id === id);
  if (i === -1) return respond(false);
  automations.splice(i, 1);
  return respond(true);
}
