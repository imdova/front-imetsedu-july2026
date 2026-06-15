import { api, type Result } from "@integration/services/http/client";
import { QUIZZES_API } from "@integration/constants/api/quizzes";
import { Quiz, Question } from "@integration/types/quiz";
export type { Quiz, Question };

export function listQuizzes(): Promise<Result<Quiz[]>> {
  return api.get<Quiz[]>(QUIZZES_API.LIST);
}

export function getQuizById(id: string): Promise<Result<Quiz>> {
  return api.get<Quiz>(QUIZZES_API.GET_BY_ID(id));
}

export function createQuiz(data: Partial<Quiz>): Promise<Result<Quiz>> {
  return api.post<Quiz>(QUIZZES_API.CREATE, data);
}

export function updateQuiz(id: string, data: Partial<Quiz>): Promise<Result<Quiz>> {
  return api.patch<Quiz>(QUIZZES_API.UPDATE(id), data);
}

export function deleteQuiz(id: string): Promise<Result<any>> {
  return api.delete(QUIZZES_API.DELETE(id));
}

export function addQuestion(quizId: string, data: Partial<Question>): Promise<Result<Question>> {
  return api.post<Question>(QUIZZES_API.ADD_QUESTION(quizId), data);
}

export function updateQuestion(quizId: string, questionId: string, data: Partial<Question>): Promise<Result<Question>> {
  return api.patch<Question>(QUIZZES_API.UPDATE_QUESTION(quizId, questionId), data);
}

export function deleteQuestion(quizId: string, questionId: string): Promise<Result<any>> {
  return api.delete(QUIZZES_API.DELETE_QUESTION(quizId, questionId));
}

export function downloadQuizQuestions(quizId: string) {
  // We'll return the full URL for the browser to handle the download
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://imets.imdova.com/api";
  return `${baseUrl}${QUIZZES_API.DOWNLOAD(quizId)}`;
}
export function uploadQuizQuestions(quizId: string, file: File): Promise<Result<any>> {
  const formData = new FormData();
  formData.append("file", file);
  return api.post<any>(QUIZZES_API.UPLOAD_QUESTIONS(quizId), formData);
}
