/**
 * Maps raw backend quiz shapes (titleAr/titleEn, populated category, nested
 * questions/choices) to flat UI types the admin quiz screens consume.
 */
import type { Quiz, Question, Choice, QuizCategory } from "@integration/types/quiz";

export type QuizStatus = "published" | "not_published";
export type QuizDifficulty = "beginner" | "intermediate" | "advanced";
export type QuizQuestionType = "single" | "multiple" | "true-false" | "short-answer" | "essay";

export interface QuizCategoryOption {
  id: string;
  name: string;
  quizCount: number;
}

export interface QuizChoiceUI {
  id?: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestionUI {
  id: string;
  prompt: string;
  type: QuizQuestionType;
  choices: QuizChoiceUI[];
  points: number;
  explanation?: string;
}

export interface QuizRow {
  id: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  categoryId: string | null;
  categoryName: string | null;
  questionsCount: number;
  timeLimitMinutes: number;
  passingScore: number;
  numberOfAttempts: number;
  difficultyLevel: QuizDifficulty;
  antiCheat: boolean;
  status: QuizStatus;
  createdAt: string;
  updatedAt: string;
}

export interface QuizDetailUI extends QuizRow {
  questions: QuizQuestionUI[];
}

type RawCategory = string | { _id?: string; id?: string; name?: string } | null | undefined;

function categoryId(cat: RawCategory): string | null {
  if (!cat) return null;
  if (typeof cat === "string") return cat;
  return cat._id ?? cat.id ?? null;
}
function categoryName(cat: RawCategory): string | null {
  if (!cat || typeof cat === "string") return null;
  return cat.name ?? null;
}

export function mapChoice(c: Choice): QuizChoiceUI {
  return { id: c._id ?? c.id, text: c.text ?? "", isCorrect: !!c.isCorrect };
}

export function mapQuestion(q: Question): QuizQuestionUI {
  return {
    id: q._id ?? q.id ?? "",
    prompt: q.prompt ?? "",
    type: (q.type as QuizQuestionType) ?? "single",
    choices: Array.isArray(q.choices) ? q.choices.map(mapChoice) : [],
    points: typeof q.points === "number" ? q.points : 1,
    explanation: q.explanation,
  };
}

export function mapQuiz(q: Quiz): QuizRow {
  return {
    id: q._id ?? q.id ?? "",
    titleEn: q.titleEn ?? "",
    titleAr: q.titleAr ?? "",
    descriptionEn: q.descriptionEn ?? "",
    descriptionAr: q.descriptionAr ?? "",
    categoryId: categoryId(q.category as RawCategory),
    categoryName: categoryName(q.category as RawCategory),
    questionsCount: Array.isArray(q.questions) ? q.questions.length : 0,
    timeLimitMinutes: q.timeLimitMinutes ?? 0,
    passingScore: q.passingScore ?? 0,
    numberOfAttempts: q.numberOfAttempts ?? 1,
    difficultyLevel: (q.difficultyLevel as QuizDifficulty) ?? "beginner",
    antiCheat: !!q.antiCheat,
    status: (q.status as QuizStatus) ?? "not_published",
    createdAt: q.createdAt ?? "",
    updatedAt: q.updatedAt ?? "",
  };
}

export function mapQuizDetail(q: Quiz): QuizDetailUI {
  return {
    ...mapQuiz(q),
    questions: Array.isArray(q.questions) ? q.questions.map(mapQuestion) : [],
  };
}

export function mapQuizCategory(c: QuizCategory): QuizCategoryOption {
  return {
    id: c._id,
    name: c.name ?? "",
    quizCount: Array.isArray(c.quiz) ? c.quiz.length : 0,
  };
}
