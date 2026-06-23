import { api, type Result } from "@integration/services/http/client";
import {
  API_ADMIN_BANNERS,
  apiAdminBanner,
  API_ADMIN_PROMOTED,
  apiAdminPromoted,
  API_PUBLIC_BANNERS,
  API_PUBLIC_PROMOTED,
} from "@integration/constants/api/marketing";
import type { BannerDto, BannerInput, PromotedDto, PromotedInput } from "./types";

/* ── Public reads (consumed by the site; cached, no auth) ── */
export function listActiveBanners(placement?: string): Promise<Result<BannerDto[]>> {
  return api.get<BannerDto[]>(API_PUBLIC_BANNERS, {
    requireAuth: false,
    params: placement ? { placement } : undefined,
    revalidate: 60,
  });
}
export function listActivePromoted(slot?: string): Promise<Result<PromotedDto[]>> {
  return api.get<PromotedDto[]>(API_PUBLIC_PROMOTED, {
    requireAuth: false,
    params: slot ? { slot } : undefined,
    revalidate: 60,
  });
}

/* ── Banners (admin) ── */
export function listBanners(): Promise<Result<BannerDto[]>> {
  return api.get<BannerDto[]>(API_ADMIN_BANNERS);
}
export function createBanner(input: BannerInput): Promise<Result<BannerDto>> {
  return api.post<BannerDto>(API_ADMIN_BANNERS, input);
}
export function updateBanner(id: string, patch: Partial<BannerInput>): Promise<Result<BannerDto>> {
  return api.patch<BannerDto>(apiAdminBanner(id), patch);
}
export function deleteBanner(id: string): Promise<Result<{ success: boolean }>> {
  return api.delete<{ success: boolean }>(apiAdminBanner(id));
}

/* ── Featured placements (admin) ── */
export function listPromoted(): Promise<Result<PromotedDto[]>> {
  return api.get<PromotedDto[]>(API_ADMIN_PROMOTED);
}
export function createPromoted(input: PromotedInput): Promise<Result<PromotedDto>> {
  return api.post<PromotedDto>(API_ADMIN_PROMOTED, input);
}
export function updatePromoted(id: string, patch: Partial<PromotedInput>): Promise<Result<PromotedDto>> {
  return api.patch<PromotedDto>(apiAdminPromoted(id), patch);
}
export function deletePromoted(id: string): Promise<Result<{ success: boolean }>> {
  return api.delete<{ success: boolean }>(apiAdminPromoted(id));
}
