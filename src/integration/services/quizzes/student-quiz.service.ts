import { QUIZZES_API } from "@integration/constants/api/quizzes";
import { getStudentCourseRaw } from "@integration/services/student-courses";
import { api, fail, toMessage, type Result } from "@integration/services/http/client";
import {
  findQuizInCourse,
  normalizeStudentQuiz,
  unwrapQuizPayload,
} from "./normalize-student-quiz";
import type { QuizAttemptData } from "./student-quiz.types";
import type { Quiz } from "@integration/types/quiz";

/**
 * Load quiz definition and merge course context (module title) for the student UI.
 */
export async function fetchStudentQuizForCourse(
  courseId: string,
  quizId: string,
  locale: "en" | "ar" = "en",
): Promise<Result<QuizAttemptData>> {
  const quizRes = await api.get<Quiz | { data?: Quiz }>(QUIZZES_API.GET_BY_ID(quizId));

  if (!quizRes.ok) {
    return fail(
      typeof quizRes.error === "string" ? quizRes.error : "Failed to load quiz",
    );
  }

  try {
    const raw = unwrapQuizPayload(quizRes.data);
    if (!raw) {
      return fail("Quiz not found");
    }

    let moduleLabel: string | undefined;
    let itemTitle: string | undefined;

    const courseRes = await getStudentCourseRaw(courseId);
    if (courseRes.ok) {
      const ctx = findQuizInCourse(courseRes.data.modules, quizId);
      if (ctx) {
        moduleLabel = ctx.moduleTitle;
        itemTitle = ctx.itemTitle;
      }
    }

    const data = normalizeStudentQuiz(raw, {
      courseId,
      quizId,
      locale,
      moduleLabel,
      itemTitle,
    });

    if (data.questions.length === 0) {
      return fail("This quiz has no questions yet");
    }

    return { ok: true, data };
  } catch (err) {
    return fail(toMessage(err, "Failed to load quiz"));
  }
}
