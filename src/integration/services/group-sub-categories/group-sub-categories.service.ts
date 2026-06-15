import { api, type Result } from "@integration/services/http/client";
import { 
  API_GROUP_SUB_CATEGORIES, 
  apiGroupSubCategoryById,
  API_DOWNLOAD_GROUP_SUB_CATEGORIES 
} from "@integration/constants/api/groups";
import type {
  GroupSubCategory,
  CreateGroupSubCategoryInput,
  UpdateGroupSubCategoryInput,
} from "./types";

/**
 * Group Sub Categories service.
 */

export function createGroupSubCategory(
  input: CreateGroupSubCategoryInput
): Promise<Result<GroupSubCategory>> {
  return api.post<GroupSubCategory>(API_GROUP_SUB_CATEGORIES, input);
}

export function listGroupSubCategories(): Promise<Result<GroupSubCategory[]>> {
  return api.get<GroupSubCategory[]>(API_GROUP_SUB_CATEGORIES);
}

export function updateGroupSubCategory(
  id: string,
  input: UpdateGroupSubCategoryInput
): Promise<Result<GroupSubCategory>> {
  return api.patch<GroupSubCategory>(apiGroupSubCategoryById(id), input);
}

export function deleteGroupSubCategory(id: string): Promise<Result<void>> {
  return api.delete<void>(apiGroupSubCategoryById(id));
}

export function downloadGroupSubCategories(): Promise<Result<void>> {
  return api.download(API_DOWNLOAD_GROUP_SUB_CATEGORIES, "group-sub-categories.xlsx");
}
