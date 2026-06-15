import { api, type Result } from "@integration/services/http/client";
import {
  API_SUB_CATEGORIES,
  apiSubCategoryById,
  apiDuplicateSubCategory,
  API_DOWNLOAD_SUB_CATEGORIES,
} from "@integration/constants/api/sub-categories";
import type {
  SubCategory,
  CreateSubCategoryInput,
  UpdateSubCategoryInput,
} from "./types";

/**
 * Sub-categories service.
 */

export function createSubCategory(
  input: CreateSubCategoryInput
): Promise<Result<SubCategory>> {
  return api.post<SubCategory>(API_SUB_CATEGORIES, input);
}

export function listSubCategories(): Promise<Result<SubCategory[]>> {
  return api.get<SubCategory[]>(API_SUB_CATEGORIES, { requireAuth: false, revalidate: 300 });
}

export function getSubCategoryById(id: string): Promise<Result<SubCategory>> {
  return api.get<SubCategory>(apiSubCategoryById(id), { requireAuth: false });
}

export function updateSubCategory(
  id: string,
  input: UpdateSubCategoryInput
): Promise<Result<SubCategory>> {
  return api.patch<SubCategory>(apiSubCategoryById(id), input);
}

export function deleteSubCategory(id: string): Promise<Result<void>> {
  return api.delete<void>(apiSubCategoryById(id));
}

export function duplicateSubCategory(id: string): Promise<Result<SubCategory>> {
  return api.post<SubCategory>(apiDuplicateSubCategory(id), {});
}

export function downloadSubCategories(): Promise<Result<void>> {
  return api.download(API_DOWNLOAD_SUB_CATEGORIES, "sub-categories.xlsx");
}
