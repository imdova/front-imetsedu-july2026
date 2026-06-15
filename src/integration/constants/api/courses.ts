export const COURSES_API = {
  LIST: "/courses",
  STATS: "/courses/stats",
  REGISTRATIONS: "/courses/registrations",
  REGISTRATIONS_EXPORT: "/courses/registrations/export",
  GET_BY_ID: (id: string) => `/courses/${id}`,
  GET_BY_SLUG: (slug: string) => `/courses/slug/${slug}`,
  CREATE: "/courses",
  UPDATE: (id: string) => `/courses/${id}`,
  DELETE: (id: string) => `/courses/${id}`,
  DUPLICATE: (id: string) => `/courses/${id}/duplicate`,
};
