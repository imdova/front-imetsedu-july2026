import { api, type Result } from "@integration/services/http/client";
import { QUIZ_CATEGORIES_API } from "@integration/constants/api/quizzes";
import { QuizCategory } from "@integration/types/quiz";

export function listQuizCategories(): Promise<Result<QuizCategory[]>> {
  return api.get<QuizCategory[]>(QUIZ_CATEGORIES_API.LIST);
}

export function createQuizCategory(data: Partial<QuizCategory>): Promise<Result<QuizCategory>> {
  return api.post<QuizCategory>(QUIZ_CATEGORIES_API.CREATE, data);
}

export function updateQuizCategory(id: string, data: Partial<QuizCategory>): Promise<Result<QuizCategory>> {
  return api.patch<QuizCategory>(QUIZ_CATEGORIES_API.UPDATE(id), data);
}

export function deleteQuizCategory(id: string): Promise<Result<any>> {
  return api.delete(QUIZ_CATEGORIES_API.DELETE(id));
}
