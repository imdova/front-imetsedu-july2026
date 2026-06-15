/**
 * Quizzes DAL — LIVE. Wraps the integration quiz + quiz-category services and
 * maps raw backend shapes to the flat UI types the admin screens use.
 *
 * List endpoints return a `{ data, meta }` envelope; detail/mutations return
 * the document directly. We unwrap defensively so either shape works.
 */
import { ok, fail, toMessage, api, type Result } from "@integration/lib/api-client";
import { QUIZZES_API } from "@integration/constants/api/quizzes";
import * as quizSvc from "@integration/services/quizzes/quizzes.service";
import * as quizCatSvc from "@integration/services/quizzes/quiz-categories.service";
import type { Quiz, Question, QuizCategory } from "@integration/types/quiz";
import {
  mapQuiz, mapQuizDetail, mapQuizCategory,
  type QuizRow, type QuizDetailUI, type QuizCategoryOption,
  type QuizStatus, type QuizDifficulty, type QuizQuestionType,
} from "@/lib/quizzes/map-quiz";

export type {
  QuizRow, QuizDetailUI, QuizCategoryOption, QuizStatus, QuizDifficulty, QuizQuestionType,
  QuizQuestionUI, QuizChoiceUI,
} from "@/lib/quizzes/map-quiz";

function listOf<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    const inner = obj.data ?? obj.results ?? obj.quizzes ?? obj.items;
    if (Array.isArray(inner)) return inner as T[];
  }
  return [];
}

/* ───────────────────────── Quizzes ───────────────────────── */

export const fetchQuizzes = async (): Promise<Result<QuizRow[]>> => {
  const res = await quizSvc.listQuizzes();
  if (!res.ok) return res;
  try {
    return ok(listOf<Quiz>(res.data).map(mapQuiz));
  } catch (err) {
    return fail(toMessage(err, "Failed to load quizzes"));
  }
};

export const fetchQuizDetail = async (id: string): Promise<Result<QuizDetailUI>> => {
  const res = await quizSvc.getQuizById(id);
  if (!res.ok) return res;
  try {
    return ok(mapQuizDetail(res.data));
  } catch (err) {
    return fail(toMessage(err, "Failed to load quiz"));
  }
};

export interface QuizFormInput {
  titleEn: string;
  titleAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  category?: string;
  timeLimitMinutes?: number;
  passingScore?: number;
  numberOfAttempts?: number;
  difficultyLevel?: QuizDifficulty;
  antiCheat?: boolean;
  status?: QuizStatus;
  isActive?: boolean;
}

export const createQuiz = async (input: QuizFormInput): Promise<Result<QuizRow>> => {
  const res = await quizSvc.createQuiz(input as Partial<Quiz>);
  if (!res.ok) return res;
  try {
    return ok(mapQuiz(res.data));
  } catch (err) {
    return fail(toMessage(err, "Failed to create quiz"));
  }
};

export const updateQuiz = async (id: string, input: Partial<QuizFormInput>): Promise<Result<QuizRow>> => {
  const res = await quizSvc.updateQuiz(id, input as Partial<Quiz>);
  if (!res.ok) return res;
  try {
    return ok(mapQuiz(res.data));
  } catch (err) {
    return fail(toMessage(err, "Failed to update quiz"));
  }
};

export const deleteQuiz = (id: string) => quizSvc.deleteQuiz(id);

/* ───────────────────────── Questions ───────────────────────── */

export interface QuestionInput {
  prompt: string;
  type: QuizQuestionType;
  choices: { text: string; isCorrect: boolean }[];
  points: number;
  explanation?: string;
}

export const addQuestion = (quizId: string, input: QuestionInput) =>
  quizSvc.addQuestion(quizId, input as Partial<Question>);

export const updateQuestion = (quizId: string, questionId: string, input: QuestionInput) =>
  quizSvc.updateQuestion(quizId, questionId, input as Partial<Question>);

export const deleteQuestion = (quizId: string, questionId: string) =>
  quizSvc.deleteQuestion(quizId, questionId);

/** Bulk-import questions from an .xlsx/.csv file. */
export const uploadQuestionsExcel = (quizId: string, file: File) =>
  quizSvc.uploadQuizQuestions(quizId, file);

/** Browser-only: stream the quiz's questions as an Excel download (auth-aware). */
export const downloadQuestions = (quizId: string, filename = "quiz-questions.xlsx") =>
  api.download(QUIZZES_API.DOWNLOAD(quizId), filename);

/* ───────────────────────── Categories ───────────────────────── */

export const fetchQuizCategories = async (): Promise<Result<QuizCategoryOption[]>> => {
  const res = await quizCatSvc.listQuizCategories();
  if (!res.ok) return res;
  try {
    return ok(listOf<QuizCategory>(res.data).map(mapQuizCategory));
  } catch (err) {
    return fail(toMessage(err, "Failed to load quiz categories"));
  }
};

export const createQuizCategory = async (name: string): Promise<Result<QuizCategoryOption>> => {
  const res = await quizCatSvc.createQuizCategory({ name });
  if (!res.ok) return res;
  try {
    return ok(mapQuizCategory(res.data));
  } catch (err) {
    return fail(toMessage(err, "Failed to create category"));
  }
};

export const renameQuizCategory = async (id: string, name: string): Promise<Result<QuizCategoryOption>> => {
  const res = await quizCatSvc.updateQuizCategory(id, { name });
  if (!res.ok) return res;
  try {
    return ok(mapQuizCategory(res.data));
  } catch (err) {
    return fail(toMessage(err, "Failed to rename category"));
  }
};

export const deleteQuizCategory = (id: string) => quizCatSvc.deleteQuizCategory(id);
