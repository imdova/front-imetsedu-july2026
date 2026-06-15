/**
 * Sub-category endpoint catalog.
 */

export const API_SUB_CATEGORIES = "/sub-categories";
export const API_DOWNLOAD_SUB_CATEGORIES = "/sub-categories/download";

export const apiSubCategoryById = (id: string) => `/sub-categories/${id}`;
export const apiDuplicateSubCategory = (id: string) => `/sub-categories/${id}/duplicate`;
export const apiSubCategoryBySlug = (slug: string) => `/sub-categories/slug/${slug}`;
