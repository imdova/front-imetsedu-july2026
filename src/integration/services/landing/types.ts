/** Raw backend shapes from the NestJS `landing` module. */
export interface LandingPageDto {
  _id: string;
  name: string;
  path: string;
  status: string;
  language?: string;
  campaign: string;
  audience: string;
  description: string;
  thumbnailUrl: string;
  whatsappNumber?: string;
  heroVideoUrl?: string;
  views: number;
  clicks: number;
  registrations?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ExamLeadDto {
  _id: string;
  name: string;
  email: string;
  whatsapp?: string;
  profession?: string;
  interest?: string;
  region?: string;
  source: string;
  path?: string;
  createdAt: string;
}

export interface LandingStatsDto {
  total: number;
  published: number;
  drafts: number;
  views: number;
  clicks: number;
  ctr: number;
}

export interface ExamLeadStatsDto {
  total: number;
  last7: number;
  last30: number;
  withWhatsapp: number;
}

export interface EmailLeadsResultDto {
  sent: number;
  failed: number;
  total: number;
}

/* ── Homepage CMS ── */
export interface TestimonialDto {
  _id: string; quote: string; authorName: string; authorTitle?: string;
  videoUrl?: string; imageUrl?: string; order: number; isActive: boolean;
}
export interface SponsorDto {
  _id: string; name: string; logoUrl?: string; type: string; url?: string; order: number; isActive: boolean;
}
export interface InsightDto {
  _id: string; title: string; slug?: string; excerpt?: string; coverImage?: string;
  publishedAt?: string; order: number; isActive: boolean;
}
export interface SubscriberDto {
  _id: string; email: string; source: string; tags: string[]; createdAt: string;
}
export interface MessageDto {
  _id: string; name: string; email: string; message: string; phone?: string; createdAt: string;
}
