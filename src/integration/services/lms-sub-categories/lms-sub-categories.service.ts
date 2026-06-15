import { api, type Result } from "@integration/services/http/client";
import {
  API_LMS_SUB_CATEGORIES,
  API_LMS_SUB_CATEGORIES_DOWNLOAD,
  apiLmsSubCategoryById,
} from "@integration/constants/api/lms-sub-categories";
import type {
  LMSSubCategory,
  CreateLMSSubCategoryInput,
  UpdateLMSSubCategoryInput,
} from "./types";

export function listLMSSubCategories(): Promise<Result<LMSSubCategory[]>> {
  return api.get<LMSSubCategory[]>(API_LMS_SUB_CATEGORIES);
}

export function createLMSSubCategory(
  input: CreateLMSSubCategoryInput
): Promise<Result<LMSSubCategory>> {
  return api.post<LMSSubCategory>(API_LMS_SUB_CATEGORIES, input);
}

export function updateLMSSubCategory(
  id: string,
  input: UpdateLMSSubCategoryInput
): Promise<Result<LMSSubCategory>> {
  return api.patch<LMSSubCategory>(apiLmsSubCategoryById(id), input);
}

export function deleteLMSSubCategory(id: string): Promise<Result<void>> {
  return api.delete<void>(apiLmsSubCategoryById(id));
}

export function downloadLMSSubCategories(filename: string): Promise<Result<void>> {
  return api.download(API_LMS_SUB_CATEGORIES_DOWNLOAD, filename);
}
