/** Raw backend shapes from the NestJS `email-campaign` module. */
export interface CampaignDto {
  _id: string;
  subject: string;
  previewText: string;
  fromName: string;
  replyTo: string;
  audience: string;
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

export interface TemplateDto {
  _id: string;
  name: string;
  subject: string;
  previewText: string;
  design?: string;
  body?: string;
  createdAt: string;
}

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
