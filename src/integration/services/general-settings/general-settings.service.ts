import { api, ok, type Result } from "@integration/services/http/client";
import {
  API_GENERAL_SETTINGS_CREATE,
  API_GENERAL_SETTINGS_LIST,
  API_GENERAL_SETTINGS_UPDATE,
} from "@integration/constants/api/general-settings";
import type { GeneralSettings } from "./types";

export async function getGeneralSettings(): Promise<Result<GeneralSettings | null>> {
  // Public endpoint — no auth header needed
  const result = await api.get<GeneralSettings[] | GeneralSettings>(
    API_GENERAL_SETTINGS_LIST,
    { requireAuth: false }
  );
  if (!result.ok) return result;

  // Handle both array and single-object responses
  const data = Array.isArray(result.data)
    ? (result.data[0] ?? null)
    : (result.data ?? null);

  return ok(data);
}

export async function saveGeneralSettings(
  data: Omit<GeneralSettings, "_id" | "createdAt" | "updatedAt">,
  existingId?: string
): Promise<Result<GeneralSettings>> {
  if (existingId) {
    return api.patch<GeneralSettings>(API_GENERAL_SETTINGS_UPDATE(existingId), data);
  }
  return api.post<GeneralSettings>(API_GENERAL_SETTINGS_CREATE, data);
}
