import type { QuizQuestion } from "@integration/services/quizzes";

export type QuestionOrder = "regular" | "random";
export type QuizSessionMode = "quiz" | "study";
export type QuestionCountPreset = "all" | "quick";

export interface QuizStartOptions {
  order: QuestionOrder;
  mode: QuizSessionMode;
  countPreset: QuestionCountPreset;
}

export const DEFAULT_START_OPTIONS: QuizStartOptions = {
  order: "regular",
  mode: "quiz",
  countPreset: "all",
};

/** Number of questions for a "quick" practice set (about half, min 1). */
export function quickCount(total: number): number {
  return Math.max(1, Math.ceil(total / 2));
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Build the question set for a session from the chosen order + count preset. */
export function buildSessionQuestions(
  all: QuizQuestion[],
  opts: Pick<QuizStartOptions, "order" | "countPreset">,
): QuizQuestion[] {
  const ordered = opts.order === "random" ? shuffle(all) : [...all];
  const count = opts.countPreset === "quick" ? quickCount(all.length) : all.length;
  return ordered.slice(0, count);
}
