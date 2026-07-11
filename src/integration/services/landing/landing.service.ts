import { api, type Result } from "@integration/services/http/client";
import {
  API_LANDING_PAGES, API_LANDING_PAGES_STATS, apiLandingPage,
  API_EXAM_LEADS, API_EXAM_LEADS_STATS, API_EXAM_LEADS_EMAIL, apiExamLead,
  API_LANDING_TRACK, API_LANDING_PUBLIC_CONFIG, API_FREE_EXAM_CAPTURE,
  API_LANDING_TESTIMONIALS, apiLandingTestimonial, API_LANDING_SPONSORS, apiLandingSponsor,
  API_LANDING_INSIGHTS, apiLandingInsight, API_LANDING_NEWSLETTER, apiLandingSubscriber,
  API_LANDING_CONTACT, apiLandingMessage,
} from "@integration/constants/api/landing";
import type {
  LandingPageDto, ExamLeadDto, LandingStatsDto, ExamLeadStatsDto, EmailLeadsResultDto,
  TestimonialDto, SponsorDto, InsightDto, SubscriberDto, MessageDto,
} from "./types";

export interface ListLandingParams { search?: string; status?: string; sort?: string }

/* ── Landing pages (admin) ── */
export function listPages(params: ListLandingParams = {}): Promise<Result<LandingPageDto[]>> {
  return api.get<LandingPageDto[]>(API_LANDING_PAGES, {
    params: {
      ...(params.search ? { search: params.search } : {}),
      ...(params.status ? { status: params.status } : {}),
      ...(params.sort ? { sort: params.sort } : {}),
    },
  });
}
export const getPageStats = () => api.get<LandingStatsDto>(API_LANDING_PAGES_STATS);
export const getPage = (id: string) => api.get<LandingPageDto>(apiLandingPage(id));
export const createPage = (input: Record<string, unknown>) => api.post<LandingPageDto>(API_LANDING_PAGES, input);
export const updatePage = (id: string, patch: Record<string, unknown>) => api.patch<LandingPageDto>(apiLandingPage(id), patch);
export const deletePage = (id: string) => api.delete<{ success: boolean }>(apiLandingPage(id));

/* ── Exam leads (admin) ── */
export function listLeads(params: { search?: string; path?: string } = {}): Promise<Result<ExamLeadDto[]>> {
  return api.get<ExamLeadDto[]>(API_EXAM_LEADS, {
    params: {
      ...(params.search ? { search: params.search } : {}),
      ...(params.path ? { path: params.path } : {}),
    },
  });
}
export const getLeadStats = () => api.get<ExamLeadStatsDto>(API_EXAM_LEADS_STATS);
export const deleteLead = (id: string) => api.delete<{ success: boolean }>(apiExamLead(id));
export const emailLeads = (ids: string[] | undefined, subject: string, html: string) =>
  api.post<EmailLeadsResultDto>(API_EXAM_LEADS_EMAIL, { ids, subject, html });

/* ── Public ── */
export const trackLanding = (path: string, type: "view" | "click") =>
  api.post<{ success: boolean }>(API_LANDING_TRACK, { path, type }, { requireAuth: false });
export const getPublicConfig = (path: string) =>
  api.get<{ path: string; whatsappNumber: string; status: string }>(API_LANDING_PUBLIC_CONFIG, {
    params: { path }, requireAuth: false,
  });
export const captureLead = (input: Record<string, unknown>) =>
  api.post<{ _id: string }>(API_FREE_EXAM_CAPTURE, input, { requireAuth: false });

/* ── Homepage CMS (admin) ── */
export const listTestimonials = () => api.get<TestimonialDto[]>(API_LANDING_TESTIMONIALS);
export const createTestimonial = (input: Record<string, unknown>) => api.post<TestimonialDto>(API_LANDING_TESTIMONIALS, input);
export const updateTestimonial = (id: string, patch: Record<string, unknown>) => api.patch<TestimonialDto>(apiLandingTestimonial(id), patch);
export const deleteTestimonial = (id: string) => api.delete<{ success: boolean }>(apiLandingTestimonial(id));

export const listSponsors = () => api.get<SponsorDto[]>(API_LANDING_SPONSORS);
export const createSponsor = (input: Record<string, unknown>) => api.post<SponsorDto>(API_LANDING_SPONSORS, input);
export const updateSponsor = (id: string, patch: Record<string, unknown>) => api.patch<SponsorDto>(apiLandingSponsor(id), patch);
export const deleteSponsor = (id: string) => api.delete<{ success: boolean }>(apiLandingSponsor(id));

export const listInsights = () => api.get<InsightDto[]>(API_LANDING_INSIGHTS);
export const createInsight = (input: Record<string, unknown>) => api.post<InsightDto>(API_LANDING_INSIGHTS, input);
export const updateInsight = (id: string, patch: Record<string, unknown>) => api.patch<InsightDto>(apiLandingInsight(id), patch);
export const deleteInsight = (id: string) => api.delete<{ success: boolean }>(apiLandingInsight(id));

export const listSubscribers = (search?: string) => api.get<SubscriberDto[]>(API_LANDING_NEWSLETTER, { params: search ? { search } : undefined });
export const deleteSubscriber = (id: string) => api.delete<{ success: boolean }>(apiLandingSubscriber(id));

export const listMessages = (search?: string) => api.get<MessageDto[]>(API_LANDING_CONTACT, { params: search ? { search } : undefined });
export const deleteMessage = (id: string) => api.delete<{ success: boolean }>(apiLandingMessage(id));
