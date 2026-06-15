export const INSTRUCTORS_API = {
  LIST: "/instructors",
  CREATE: "/instructors",
  GET_BY_ID: (id: string) => `/instructors/${id}`,
  UPDATE: (id: string) => `/instructors/${id}`,
  DELETE: (id: string) => `/instructors/${id}`,
};
