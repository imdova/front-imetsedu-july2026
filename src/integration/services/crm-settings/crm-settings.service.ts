import { api, type Result } from "@integration/services/http/client";
import { CRM_SETTINGS_API } from "@integration/constants/api/crm-settings";
import type {
  CrmSetting,
  CreateCrmSettingDto,
  UpdateCrmSettingDto,
} from "./types";

export function listCrmSettings(): Promise<Result<CrmSetting[]>> {
  return api.get<CrmSetting[]>(CRM_SETTINGS_API.LIST);
}

export function getCrmSettingById(id: string): Promise<Result<CrmSetting>> {
  return api.get<CrmSetting>(CRM_SETTINGS_API.GET(id));
}

export function createCrmSetting(input: CreateCrmSettingDto): Promise<Result<CrmSetting>> {
  return api.post<CrmSetting>(CRM_SETTINGS_API.CREATE, input);
}

export function updateCrmSetting(id: string, input: UpdateCrmSettingDto): Promise<Result<CrmSetting>> {
  return api.patch<CrmSetting>(CRM_SETTINGS_API.UPDATE(id), input);
}

export function deleteCrmSetting(id: string): Promise<Result<void>> {
  return api.delete<void>(CRM_SETTINGS_API.DELETE(id));
}
