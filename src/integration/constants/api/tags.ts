export const API_TAGS = "/tags";
export const API_UPLOAD_TAGS = "/tags/upload";
export const apiTagById = (id: string) => `/tags/${id}`;
export const apiTagBySlug = (slug: string) => `/tags/slug/${slug}`;
export const apiTagToggleActive = (id: string) => `/tags/${id}/toggle-active`;
