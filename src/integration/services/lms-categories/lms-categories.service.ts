import { api, type Result } from "@integration/services/http/client";
import {
  API_LMS_CATEGORIES,
  API_LMS_CATEGORIES_DOWNLOAD,
  apiLmsCategoryById,
} from "@integration/constants/api/lms-categories";
import type {
  LMSCategory,
  CreateLMSCategoryInput,
  UpdateLMSCategoryInput,
} from "./types";

export function listLMSCategories(): Promise<Result<LMSCategory[]>> {
  return api.get<LMSCategory[]>(API_LMS_CATEGORIES);
}

export function createLMSCategory(
  input: CreateLMSCategoryInput
): Promise<Result<LMSCategory>> {
  return api.post<LMSCategory>(API_LMS_CATEGORIES, input);
}

export function updateLMSCategory(
  id: string,
  input: UpdateLMSCategoryInput
): Promise<Result<LMSCategory>> {
  return api.patch<LMSCategory>(apiLmsCategoryById(id), input);
}

export function deleteLMSCategory(id: string): Promise<Result<void>> {
  return api.delete<void>(apiLmsCategoryById(id));
}

export function downloadLMSCategories(filename: string): Promise<Result<void>> {
  return api.download(API_LMS_CATEGORIES_DOWNLOAD, filename);
}
