import { api, type Result } from "@integration/services/http/client";
import {
  API_TAGS,
  apiTagById,
  apiTagBySlug,
  apiTagToggleActive,
  API_UPLOAD_TAGS,
} from "@integration/constants/api/tags";
import type { Tag, CreateTagInput, UpdateTagInput } from "./types";

export function createTag(input: CreateTagInput): Promise<Result<Tag>> {
  return api.post<Tag>(API_TAGS, input);
}

export function listTags(): Promise<Result<Tag[]>> {
  return api.get<Tag[]>(API_TAGS, { requireAuth: false });
}

export function getTagById(id: string): Promise<Result<Tag>> {
  return api.get<Tag>(apiTagById(id), { requireAuth: false });
}

export function getTagBySlug(slug: string): Promise<Result<Tag>> {
  return api.get<Tag>(apiTagBySlug(slug), { requireAuth: false });
}

export function updateTag(id: string, input: UpdateTagInput): Promise<Result<Tag>> {
  return api.patch<Tag>(apiTagById(id), input);
}

export function deleteTag(id: string): Promise<Result<void>> {
  return api.delete<void>(apiTagById(id));
}

export function toggleTagStatus(id: string): Promise<Result<Tag>> {
  return api.patch<Tag>(apiTagToggleActive(id), {});
}

export function uploadTags(file: File): Promise<Result<void>> {
  const formData = new FormData();
  formData.append("file", file);
  return api.post<void>(API_UPLOAD_TAGS, formData);
}
