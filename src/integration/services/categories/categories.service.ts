import { api, type Result } from "@integration/services/http/client";
import {
  API_CATEGORIES,
  apiCategoryById,
  apiDuplicateCategory,
  API_DOWNLOAD_CATEGORIES,
  apiCategoryBySlug,
} from "@integration/constants/api/categories";
import type {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "./types";

/**
 * Categories service.
 *
 * Auth: required (admin only) for create/update/delete.
 * Mutations should invalidate any client cache keyed on the categories list.
 */

export function createCategory(
  input: CreateCategoryInput
): Promise<Result<Category>> {
  return api.post<Category>(API_CATEGORIES, input);
}

export function listCategories(): Promise<Result<Category[]>> {
  return api.get<Category[]>(API_CATEGORIES, { requireAuth: false, revalidate: 300 });
}

export function getCategoryById(id: string): Promise<Result<Category>> {
  return api.get<Category>(apiCategoryById(id), { requireAuth: false });
}

export function getCategoryBySlug(slug: string): Promise<Result<Category>> {
  return api.get<Category>(apiCategoryBySlug(slug), { requireAuth: false });
}

export function updateCategory(
  id: string,
  input: UpdateCategoryInput
): Promise<Result<Category>> {
  return api.patch<Category>(apiCategoryById(id), input);
}

export function deleteCategory(id: string): Promise<Result<void>> {
  return api.delete<void>(apiCategoryById(id));
}

export function duplicateCategory(id: string): Promise<Result<Category>> {
  return api.post<Category>(apiDuplicateCategory(id), {});
}

export function downloadCategories(): Promise<Result<void>> {
  return api.download(API_DOWNLOAD_CATEGORIES, "categories.xlsx");
}
