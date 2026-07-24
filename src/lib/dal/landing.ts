/**
 * Landing DAL.
 *
 * LIVE: landing-page registry/stats + free-exam leads delegate to the NestJS
 * `landing` module via `@integration/services/landing` (`/admin/landing/*`,
 * `/admin/free-exam/*`), mapping backend `_id` → UI `id` and computing `ctr`.
 * The homepage CMS (testimonials/sponsors/insights/newsletter/contact) remains
 * MOCK (`@/lib/db/landing-cms`) until its backend lands. UI types still come
 * from `@/lib/db/landing`; the `Result<T>` shape is unchanged.
 */
import { ok, type Result } from "@integration/lib/api-client";
import * as svc from "@integration/services/landing";
import type { MarketingLandingPage, LandingPageInput, LandingStats, ExamLead } from "@/lib/db/landing";
import type * as cms from "@/lib/db/landing-cms";

const ctrOf = (clicks: number, views: number) => (views > 0 ? Math.round((clicks / views) * 1000) / 10 : 0);

/** LIVE (public, no auth): the connected WhatsApp number for a landing path.
 * Returns "" if the path isn't registered or the call fails — callers should
 * fall back to their hardcoded default. Safe to call from public server pages. */
export async function fetchLandingWhatsapp(path: string): Promise<string> {
  try {
    const res = await svc.getPublicConfig(path);
    return res.ok ? (res.data?.whatsappNumber ?? "") : "";
  } catch {
    return "";
  }
}

/** LIVE (public, no auth): the hero-section YouTube URL for a landing path.
 * Returns "" if the path isn't registered, has no video, or the call fails.
 * Safe to call from public server pages. */
export async function fetchLandingHeroVideo(path: string): Promise<string> {
  try {
    const res = await svc.getPublicConfig(path);
    return res.ok ? (res.data?.heroVideoUrl ?? "") : "";
  } catch {
    return "";
  }
}
const mapPage = (d: svc.LandingPageDto): MarketingLandingPage => ({
  id: d._id, name: d.name, path: d.path, status: d.status as MarketingLandingPage["status"],
  language: (d.language as MarketingLandingPage["language"]) ?? "en",
  campaign: d.campaign, audience: d.audience, description: d.description, thumbnailUrl: d.thumbnailUrl,
  whatsappNumber: d.whatsappNumber ?? "",
  heroVideoUrl: d.heroVideoUrl ?? "",
  views: d.views, clicks: d.clicks, ctr: ctrOf(d.clicks, d.views),
  registrations: d.registrations ?? 0,
  createdAt: d.createdAt, updatedAt: d.updatedAt,
});
const mapLead = (d: svc.ExamLeadDto): ExamLead => ({
  id: d._id, name: d.name, email: d.email, whatsapp: d.whatsapp, profession: d.profession,
  interest: d.interest, region: d.region, source: d.source, path: d.path, createdAt: d.createdAt,
});

/* ── Landing pages (LIVE) ── */
export async function fetchLandingPages(params: svc.ListLandingParams = {}): Promise<Result<MarketingLandingPage[]>> {
  const res = await svc.listPages(params);
  return res.ok ? ok(res.data.map(mapPage)) : res;
}
export async function fetchLandingStats(): Promise<Result<LandingStats>> {
  const res = await svc.getPageStats();
  return res.ok ? ok(res.data as LandingStats) : res;
}
export async function fetchLandingPage(id: string): Promise<Result<MarketingLandingPage | null>> {
  const res = await svc.getPage(id);
  return res.ok ? ok(res.data ? mapPage(res.data) : null) : res;
}
export async function createLandingPage(input: LandingPageInput): Promise<Result<MarketingLandingPage>> {
  const res = await svc.createPage(input);
  return res.ok ? ok(mapPage(res.data)) : res;
}
export async function updateLandingPage(id: string, patch: Partial<LandingPageInput>): Promise<Result<MarketingLandingPage | null>> {
  const res = await svc.updatePage(id, patch);
  return res.ok ? ok(res.data ? mapPage(res.data) : null) : res;
}
export async function deleteLandingPage(id: string): Promise<Result<boolean>> {
  const res = await svc.deletePage(id);
  return res.ok ? ok(true) : res;
}

/* ── Free-exam leads (LIVE) ── */
export async function fetchRegistrationsByPath(path: string): Promise<Result<ExamLead[]>> {
  const res = await svc.listLeads({ path });
  return res.ok ? ok(res.data.map(mapLead)) : res;
}
export async function fetchLeads(search?: string): Promise<Result<ExamLead[]>> {
  const res = await svc.listLeads({ search });
  return res.ok ? ok(res.data.map(mapLead)) : res;
}
export async function fetchLeadStats(): Promise<Result<{ total: number; last7: number; last30: number; withWhatsapp: number }>> {
  return svc.getLeadStats();
}
export async function deleteLead(id: string): Promise<Result<boolean>> {
  const res = await svc.deleteLead(id);
  return res.ok ? ok(true) : res;
}
export async function emailLeads(ids: string[] | undefined, subject: string, html: string): Promise<Result<{ sent: number; failed: number; total: number }>> {
  return svc.emailLeads(ids, subject, html);
}

/* ── Public funnel (no auth) ── */
export interface CaptureLeadInput {
  name: string;
  email: string;
  whatsapp?: string;
  profession?: string;
  interest?: string;
  region?: string;
  path?: string;
  // Meta Conversions API dedup/match signals (from the browser pixel).
  fbp?: string;
  fbc?: string;
  eventId?: string;
  eventSourceUrl?: string;
}
export async function captureLead(input: CaptureLeadInput): Promise<Result<{ id: string }>> {
  const res = await svc.captureLead(input as unknown as Record<string, unknown>);
  return res.ok ? ok({ id: res.data._id }) : res;
}
export async function trackLanding(path: string, type: "view" | "click"): Promise<Result<boolean>> {
  const res = await svc.trackLanding(path, type);
  return res.ok ? ok(true) : res;
}

/* ── Homepage CMS (LandingManager) — LIVE ── */
const rec = (o: object) => o as unknown as Record<string, unknown>;
const mapTestimonial = (d: svc.TestimonialDto): cms.LandingTestimonial => ({
  id: d._id, quote: d.quote, authorName: d.authorName, authorTitle: d.authorTitle,
  videoUrl: d.videoUrl, imageUrl: d.imageUrl, order: d.order, isActive: d.isActive,
});
const mapSponsor = (d: svc.SponsorDto): cms.LandingSponsor => ({
  id: d._id, name: d.name, logoUrl: d.logoUrl, type: d.type as cms.SponsorType,
  url: d.url, order: d.order, isActive: d.isActive,
});
const mapInsight = (d: svc.InsightDto): cms.LandingInsight => ({
  id: d._id, title: d.title, slug: d.slug, excerpt: d.excerpt, coverImage: d.coverImage,
  publishedAt: d.publishedAt, order: d.order, isActive: d.isActive,
});
const mapSubscriber = (d: svc.SubscriberDto): cms.NewsletterSubscriber => ({
  id: d._id, email: d.email, source: d.source, tags: d.tags ?? [], createdAt: d.createdAt,
});
const mapMessage = (d: svc.MessageDto): cms.ContactMessage => ({
  id: d._id, name: d.name, email: d.email, message: d.message, phone: d.phone, createdAt: d.createdAt,
});

// Testimonials
export async function fetchTestimonials(): Promise<Result<cms.LandingTestimonial[]>> {
  const res = await svc.listTestimonials();
  return res.ok ? ok(res.data.map(mapTestimonial)) : res;
}
export async function createTestimonial(input: cms.TestimonialInput): Promise<Result<cms.LandingTestimonial>> {
  const res = await svc.createTestimonial(rec(input));
  return res.ok ? ok(mapTestimonial(res.data)) : res;
}
export async function updateTestimonial(id: string, patch: Partial<cms.TestimonialInput>): Promise<Result<cms.LandingTestimonial | null>> {
  const res = await svc.updateTestimonial(id, rec(patch));
  return res.ok ? ok(res.data ? mapTestimonial(res.data) : null) : res;
}
export async function deleteTestimonial(id: string): Promise<Result<boolean>> {
  const res = await svc.deleteTestimonial(id);
  return res.ok ? ok(true) : res;
}
// Sponsors & partners
export async function fetchSponsors(): Promise<Result<cms.LandingSponsor[]>> {
  const res = await svc.listSponsors();
  return res.ok ? ok(res.data.map(mapSponsor)) : res;
}
export async function createSponsor(input: cms.SponsorInput): Promise<Result<cms.LandingSponsor>> {
  const res = await svc.createSponsor(rec(input));
  return res.ok ? ok(mapSponsor(res.data)) : res;
}
export async function updateSponsor(id: string, patch: Partial<cms.SponsorInput>): Promise<Result<cms.LandingSponsor | null>> {
  const res = await svc.updateSponsor(id, rec(patch));
  return res.ok ? ok(res.data ? mapSponsor(res.data) : null) : res;
}
export async function deleteSponsor(id: string): Promise<Result<boolean>> {
  const res = await svc.deleteSponsor(id);
  return res.ok ? ok(true) : res;
}
// Insights
export async function fetchInsights(): Promise<Result<cms.LandingInsight[]>> {
  const res = await svc.listInsights();
  return res.ok ? ok(res.data.map(mapInsight)) : res;
}
export async function createInsight(input: cms.InsightInput): Promise<Result<cms.LandingInsight>> {
  const res = await svc.createInsight(rec(input));
  return res.ok ? ok(mapInsight(res.data)) : res;
}
export async function updateInsight(id: string, patch: Partial<cms.InsightInput>): Promise<Result<cms.LandingInsight | null>> {
  const res = await svc.updateInsight(id, rec(patch));
  return res.ok ? ok(res.data ? mapInsight(res.data) : null) : res;
}
export async function deleteInsight(id: string): Promise<Result<boolean>> {
  const res = await svc.deleteInsight(id);
  return res.ok ? ok(true) : res;
}
// Newsletter subscribers (read + delete)
export async function fetchSubscribers(search?: string): Promise<Result<cms.NewsletterSubscriber[]>> {
  const res = await svc.listSubscribers(search);
  return res.ok ? ok(res.data.map(mapSubscriber)) : res;
}
export async function deleteSubscriber(id: string): Promise<Result<boolean>> {
  const res = await svc.deleteSubscriber(id);
  return res.ok ? ok(true) : res;
}
// Contact messages (read + delete)
export async function fetchContactMessages(search?: string): Promise<Result<cms.ContactMessage[]>> {
  const res = await svc.listMessages(search);
  return res.ok ? ok(res.data.map(mapMessage)) : res;
}
export async function deleteContactMessage(id: string): Promise<Result<boolean>> {
  const res = await svc.deleteMessage(id);
  return res.ok ? ok(true) : res;
}
