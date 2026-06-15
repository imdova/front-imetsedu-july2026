/**
 * Category endpoint catalog.
 *
 * Paths are relative to NEXT_PUBLIC_API_URL and consumed by the shared
 * api client at services/http/. Do not concatenate or build URLs ad hoc.
 *
 * Auth: required (admin only).
 */

export const API_CATEGORIES = "/categories";
export const API_DOWNLOAD_CATEGORIES = "/categories/download";

export const apiCategoryById = (id: string) => `/categories/${id}`;
export const apiDuplicateCategory = (id: string) => `/categories/${id}/duplicate`;
export const apiCategoryBySlug = (slug: string) => `/categories/slug/${slug}`;
