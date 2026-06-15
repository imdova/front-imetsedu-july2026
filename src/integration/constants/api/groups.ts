/**
 * Group Category, Sub Category, and Groups endpoint catalog.
 */

export const API_GROUPS = "/groups";
export const apiGroupById = (id: string) => `/groups/${id}`;
export const apiGroupDuplicate = (id: string) => `/groups/${id}/duplicate`;
export const apiGroupStudent = (id: string, studentId: string) => `/groups/${id}/students/${studentId}`;
export const apiGroupCourse = (id: string, courseId: string) => `/groups/${id}/courses/${courseId}`;
export const apiGroupStatus = (id: string) => `/groups/${id}/status`;

export const API_GROUP_CATEGORIES = "/group-categories";
export const API_DOWNLOAD_GROUP_CATEGORIES = "/group-categories/download";
export const apiGroupCategoryById = (id: string) => `/group-categories/${id}`;

export const API_GROUP_SUB_CATEGORIES = "/group-sub-categories";
export const API_DOWNLOAD_GROUP_SUB_CATEGORIES = "/group-sub-categories/download";
export const apiGroupSubCategoryById = (id: string) => `/group-sub-categories/${id}`;
