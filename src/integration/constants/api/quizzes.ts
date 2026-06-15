export const QUIZZES_API = {
  LIST: "/quizzes",
  CREATE: "/quizzes",
  GET_BY_ID: (id: string) => `/quizzes/${id}`,
  UPDATE: (id: string) => `/quizzes/${id}`,
  DELETE: (id: string) => `/quizzes/${id}`,
  ADD_QUESTION: (id: string) => `/quizzes/${id}/questions`,
  UPDATE_QUESTION: (quizId: string, questionId: string) => `/quizzes/${quizId}/questions/${questionId}`,
  DELETE_QUESTION: (quizId: string, questionId: string) => `/quizzes/${quizId}/questions/${questionId}`,
  DOWNLOAD: (id: string) => `/quizzes/${id}/download`,
  UPLOAD_QUESTIONS: (id: string) => `/quizzes/${id}/questions/upload-excel`,
  ATTEMPTS: {
    START: (id: string) => `/quizzes/${id}/attempts`,
    SAVE_ANSWERS: (id: string, attemptId: string) => `/quizzes/${id}/attempts/${attemptId}/answers`,
    SUBMIT: (id: string, attemptId: string) => `/quizzes/${id}/attempts/${attemptId}/submit`,
    MY_LATEST: (id: string) => `/quizzes/${id}/attempts/me`,
  },
};

export const QUIZ_CATEGORIES_API = {
  LIST: "/quiz-categories",
  CREATE: "/quiz-categories",
  UPDATE: (id: string) => `/quiz-categories/${id}`,
  DELETE: (id: string) => `/quiz-categories/${id}`,
};
