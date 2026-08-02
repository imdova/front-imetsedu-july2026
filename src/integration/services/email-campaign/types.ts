/** Raw backend shapes from the NestJS `email-campaign` module. */
export interface ManualRecipientDto {
  email: string;
  name?: string;
}

export interface CampaignDto {
  _id: string;
  name?: string;
  subject: string;
  previewText: string;
  fromName: string;
  fromEmail?: string;
  replyTo: string;
  language?: string;
  audience: string;
  sources?: string[];
  manualRecipients?: ManualRecipientDto[];
  status: string;
  scheduledAt?: string;
  sentAt?: string;
  recipientCount: number;
  opens: number;
  clicks: number;
  design?: string;
  body?: string;
  trackOpens?: boolean;
  trackClicks?: boolean;
  createdAt: string;
}

export interface AudienceDto {
  key: string;
  label: string;
  group: string;
  description: string;
  count: number;
}

export interface RecipientsPreviewDto {
  total: number;
  breakdown: { key: string; label: string; count: number }[];
}

export interface TemplateDto {
  _id: string;
  name: string;
  subject: string;
  previewText: string;
  category?: string;
  design?: string;
  body?: string;
  createdAt: string;
}
export interface TemplateCategoryDto { name: string; count: number }

export interface AutomationDto {
  _id: string;
  name: string;
  trigger: string;
  triggerTag?: string;
  audience?: string;
  steps?: string;
  active: boolean;
  sentCount: number;
  createdAt: string;
}

export interface BrandBlockDto {
  _id: string;
  name: string;
  block: string;
}

export interface SubscriberDto {
  _id: string;
  email: string;
  name?: string;
  phone?: string;
  source?: string;
  tags?: string[];
  createdAt: string;
}

export interface SubscriberGroupDto {
  name: string;
  count: number;
  paths?: string[];
  kind?: string;
}

export interface EmailStatsDto {
  totalSubscribers: number;
  totalCampaigns: number;
  sentCampaigns: number;
  scheduledCampaigns: number;
  totalRecipients: number;
  totalOpens: number;
  totalClicks: number;
}

export interface SegmentDto {
  value: string;
  label: string;
  count: number;
}
