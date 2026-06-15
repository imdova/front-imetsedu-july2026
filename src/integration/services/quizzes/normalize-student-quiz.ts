import type { Question, Quiz } from "@integration/types/quiz";
import type { StudentPortalModule } from "@integration/services/student-courses/types";
import type { QuizAttemptData, QuizQuestion } from "./student-quiz.types";

export function unwrapQuizPayload(
  data: Quiz | { data?: Quiz },
): Quiz | null {
  if (!data || typeof data !== "object") return null;
  if ("_id" in data && ("titleEn" in data || "titleAr" in data)) {
    return data as Quiz;
  }
  const nested = (data as { data?: Quiz }).data;
  return nested && typeof nested === "object" ? nested : null;
}

export function findQuizInCourse(
  modules: StudentPortalModule[] | undefined,
  quizId: string,
): { moduleTitle: string; itemTitle: string } | null {
  for (const mod of modules ?? []) {
    for (const item of mod.items ?? []) {
      if (item.type === "quiz" && item.quiz?._id === quizId) {
        return {
          moduleTitle: mod.title,
          itemTitle: item.quiz.titleEn || item.quiz.titleAr || item.title || "Quiz",
        };
      }
    }
  }
  return null;
}

function normalizeQuestion(q: Question, index: number): QuizQuestion | null {
  const id = String(q._id ?? q.id ?? `q-${index}`);
  const prompt = q.prompt?.trim();
  if (!prompt) return null;

  const choices = q.choices ?? [];
  if (!choices.length) return null;

  const options = choices.map((c) => c.text);
  const optionIds = choices.map((c) => String(c._id ?? c.id ?? ""));
  const correctIndex = choices.findIndex((c) => c.isCorrect);

  return {
    id,
    type: "multiple_choice",
    question: prompt,
    options,
    optionIds,
    correctIndex: correctIndex >= 0 ? correctIndex : 0,
    learningInsight: q.explanation,
    points: q.points,
  };
}

export function normalizeStudentQuiz(
  api: Quiz,
  ctx: {
    courseId: string;
    quizId: string;
    locale?: "en" | "ar";
    moduleLabel?: string;
    itemTitle?: string;
  },
): QuizAttemptData {
  const title = api.titleEn || api.titleAr || ctx.itemTitle || "Quiz";
  const description = api.descriptionEn || api.descriptionAr || "";

  const questions = (api.questions ?? [])
    .map((q, i) => normalizeQuestion(q, i))
    .filter((q): q is QuizQuestion => q !== null);

  const moduleLabel = ctx.moduleLabel
    ? `MODULE · ${ctx.moduleLabel}`
    : undefined;

  return {
    quizId: ctx.quizId,
    courseId: ctx.courseId,
    title: title.toUpperCase(),
    orientationTitle: title,
    moduleLabel,
    orientationDescription: description,
    feedbackTitle: title,
    totalQuestions: questions.length,
    timeLimitMinutes: api.timeLimitMinutes ?? 45,
    passingPct: api.passingScore ?? 70,
    numberOfAttempts: api.numberOfAttempts,
    difficultyLevel: api.difficultyLevel,
    questions,
  };
}
