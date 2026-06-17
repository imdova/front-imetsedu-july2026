import { api, ok, type Result } from "@integration/services/http/client";
import { QUIZZES_API } from "@integration/constants/api/quizzes";
import type { QuizAttemptResult, MyAttemptsResponse } from "@integration/types/quiz";

function unwrapData(raw: unknown): unknown {
  if (raw && typeof raw === "object" && "data" in raw) {
    return (raw as Record<string, unknown>).data;
  }
  return raw;
}

export async function startAttempt(quizId: string): Promise<Result<QuizAttemptResult>> {
  const res = await api.post<unknown>(QUIZZES_API.ATTEMPTS.START(quizId), {});
  if (!res.ok) return res;
  const raw = unwrapData(res.data) as QuizAttemptResult;
  return ok(raw);
}

export async function saveAnswers(
  quizId: string,
  attemptId: string,
  answers: Array<{ questionId: string; selectedChoiceIds: string[] }>,
): Promise<Result<unknown>> {
  return api.patch<unknown>(
    QUIZZES_API.ATTEMPTS.SAVE_ANSWERS(quizId, attemptId),
    { answers },
  );
}

export async function submitAttempt(
  quizId: string,
  attemptId: string,
): Promise<Result<QuizAttemptResult>> {
  const res = await api.post<unknown>(QUIZZES_API.ATTEMPTS.SUBMIT(quizId, attemptId), {});
  if (!res.ok) return res;
  return ok(unwrapData(res.data) as QuizAttemptResult);
}

export async function getMyLatestAttempt(quizId: string): Promise<Result<MyAttemptsResponse>> {
  const res = await api.get<unknown>(QUIZZES_API.ATTEMPTS.MY_LATEST(quizId));
  // 404 = no attempts yet
  if (!res.ok) return ok({ latestAttempt: null, attemptsCount: 0 });

  const raw = unwrapData(res.data);

  // Array response: sort by date, use length as count
  if (Array.isArray(raw)) {
    return ok({ latestAttempt: null, attemptsCount: raw.length });
  }

  // Single object: at least 1 attempt exists
  if (raw && typeof raw === "object" && ("_id" in raw || "id" in raw)) {
    const count = (raw as Record<string, unknown>).totalAttempts as number | undefined;
    return ok({ latestAttempt: null, attemptsCount: count ?? 1 });
  }

  return ok({ latestAttempt: null, attemptsCount: 0 });
}
