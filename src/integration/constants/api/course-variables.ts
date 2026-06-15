export const COURSE_VARIABLES_API = {
  LIST: "/course-variables",
  LIST_ACTIVE: "/course-variables/active",
  CREATE: "/course-variables",
  GET_BY_ID: (id: string) => `/course-variables/${id}`,
  UPDATE: (id: string) => `/course-variables/${id}`,
  DELETE: (id: string) => `/course-variables/${id}`,
  ADD_OPTION: (id: string) => `/course-variables/${id}/options`,
  REMOVE_OPTION: (id: string) => `/course-variables/${id}/options`,
  TOGGLE_ACTIVE: (id: string) => `/course-variables/${id}/toggle-active`,
};
