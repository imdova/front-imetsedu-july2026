import { api, type Result } from "@integration/services/http/client";
import { 
  API_GROUP_CATEGORIES, 
  apiGroupCategoryById,
  API_DOWNLOAD_GROUP_CATEGORIES 
} from "@integration/constants/api/groups";
import type {
  GroupCategory,
  CreateGroupCategoryInput,
  UpdateGroupCategoryInput,
} from "./types";

/**
 * Group Categories service.
 */

export function createGroupCategory(
  input: CreateGroupCategoryInput
): Promise<Result<GroupCategory>> {
  return api.post<GroupCategory>(API_GROUP_CATEGORIES, input);
}

export function listGroupCategories(): Promise<Result<GroupCategory[]>> {
  return api.get<GroupCategory[]>(API_GROUP_CATEGORIES);
}

export function updateGroupCategory(
  id: string,
  input: UpdateGroupCategoryInput
): Promise<Result<GroupCategory>> {
  return api.patch<GroupCategory>(apiGroupCategoryById(id), input);
}

export function deleteGroupCategory(id: string): Promise<Result<void>> {
  return api.delete<void>(apiGroupCategoryById(id));
}

export function downloadGroupCategories(): Promise<Result<void>> {
  return api.download(API_DOWNLOAD_GROUP_CATEGORIES, "group-categories.xlsx");
}
