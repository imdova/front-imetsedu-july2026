import { api, type Result } from "@integration/services/http/client";
import type { SiteSettings, SiteSettingsPatch } from "@/types/site-settings";

const API_ADMIN = "/admin/site-settings";
const API_PUBLIC = "/site-settings/public";

/** Backend returns the singleton doc (+ _id/timestamps we ignore). */
type SettingsDoc = SiteSettings & { _id?: string };

export const getAdminSettings = (): Promise<Result<SettingsDoc>> => api.get<SettingsDoc>(API_ADMIN);
export const updateSettings = (patch: SiteSettingsPatch): Promise<Result<SettingsDoc>> => api.patch<SettingsDoc>(API_ADMIN, patch);
export const getPublicSettings = (): Promise<Result<SettingsDoc>> =>
  api.get<SettingsDoc>(API_PUBLIC, { requireAuth: false, revalidate: 120 });
